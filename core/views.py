from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import DonorProfile, BloodBank, BloodRequest, Donation
from .serializers import (
    UserSerializer, RegisterSerializer, DonorProfileSerializer,
    BloodBankSerializer, BloodRequestSerializer, DonationSerializer
)
from django.conf import settings
from .utils import send_donation_approved_email, notify_donors_blood_needed
from django.db import transaction
from django.db.models import F

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class DonorProfileViewSet(viewsets.ModelViewSet):
    queryset = DonorProfile.objects.select_related('user').all()
    serializer_class = DonorProfileSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_queryset(self):
        """Allow filtering donors by blood_group and availability via query params."""
        qs = super().get_queryset()
        blood_group = self.request.query_params.get('blood_group')
        available = self.request.query_params.get('available')
        if blood_group:
            qs = qs.filter(blood_group__iexact=blood_group)
        if available is not None:
            if available.lower() in ['true', '1', 'yes']:
                qs = qs.filter(available=True)
            elif available.lower() in ['false', '0', 'no']:
                qs = qs.filter(available=False)
        return qs


class BloodBankViewSet(viewsets.ModelViewSet):
    queryset = BloodBank.objects.all()
    serializer_class = BloodBankSerializer
    permission_classes = (permissions.IsAuthenticated,)


class BloodRequestViewSet(viewsets.ModelViewSet):
    queryset = BloodRequest.objects.select_related('requester').all()
    serializer_class = BloodRequestSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)
        # Notify donors of this blood group that blood is needed
        try:
            notify_donors_blood_needed(serializer.instance)
        except Exception:
            # Fail silently to avoid blocking request creation
            pass

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        # Only admin can approve
        if request.user.role != 'admin':
            return Response({'detail': 'Only admin can approve.'}, status=status.HTTP_403_FORBIDDEN)
        req = self.get_object()
        req.status = 'approved'
        req.save()
        return Response(self.get_serializer(req).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Only admin can reject.'}, status=status.HTTP_403_FORBIDDEN)
        req = self.get_object()
        req.status = 'rejected'
        req.save()
        return Response(self.get_serializer(req).data)


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.select_related('donor').all()
    serializer_class = DonationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Only admin can approve.'}, status=status.HTTP_403_FORBIDDEN)
        donation = self.get_object()
        donation.approved = True
        # Save and atomically update blood bank units if bank present
        with transaction.atomic():
            donation.save()
            try:
                bank = donation.blood_bank
                if bank and donation.units > 0:
                    field_map = {
                        'A+': 'units_a_plus', 'A-': 'units_a_minus',
                        'B+': 'units_b_plus', 'B-': 'units_b_minus',
                        'O+': 'units_o_plus', 'O-': 'units_o_minus',
                        'AB+': 'units_ab_plus', 'AB-': 'units_ab_minus',
                    }
                    field = field_map.get(donation.blood_group)
                    if field:
                        # Use F() to avoid race conditions
                        setattr(BloodBank.objects.filter(pk=bank.pk).first(), field, F(field) + donation.units)
                        # Persist increment on the bank
                        BloodBank.objects.filter(pk=bank.pk).update(**{field: F(field) + donation.units})
            except Exception:
                # don't block approval if bank update fails
                pass
        # send email notification to donor
        try:
            send_donation_approved_email(donation)
        except Exception:
            pass
        # Optionally update blood bank units (left as exercise)
        return Response(self.get_serializer(donation).data)


from rest_framework.views import APIView


class AdminDashboardView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        # only admin users
        if request.user.role != 'admin':
            return Response({'detail': 'Only admin can access dashboard.'}, status=status.HTTP_403_FORBIDDEN)

        total_donors = User.objects.filter(role='donor').count()
        pending_requests = BloodRequest.objects.filter(status='pending').count()
        # aggregate available units from blood banks
        banks = BloodBank.objects.all()
        units = {
            'A+': sum(b.units_a_plus for b in banks),
            'A-': sum(b.units_a_minus for b in banks),
            'B+': sum(b.units_b_plus for b in banks),
            'B-': sum(b.units_b_minus for b in banks),
            'O+': sum(b.units_o_plus for b in banks),
            'O-': sum(b.units_o_minus for b in banks),
            'AB+': sum(b.units_ab_plus for b in banks),
            'AB-': sum(b.units_ab_minus for b in banks),
        }

        return Response({
            'total_donors': total_donors,
            'pending_requests': pending_requests,
            'available_units': units,
        })
