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
from rest_framework.parsers import MultiPartParser, FormParser

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
    parser_classes = (MultiPartParser, FormParser)

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
        # find a blood bank with sufficient units for the requested group
        field_map = {
            'A+': 'units_a_plus', 'A-': 'units_a_minus',
            'B+': 'units_b_plus', 'B-': 'units_b_minus',
            'O+': 'units_o_plus', 'O-': 'units_o_minus',
            'AB+': 'units_ab_plus', 'AB-': 'units_ab_minus',
        }
        field = field_map.get(req.blood_group)
        if not field:
            return Response({'detail': 'Invalid blood group on request.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # try to find any bank with enough units
            bank = BloodBank.objects.filter(**{f"{field}__gte": req.units}).first()
            if not bank:
                return Response({'detail': 'Insufficient units in all blood banks.'}, status=status.HTTP_400_BAD_REQUEST)
            # decrement using F() to avoid races
            BloodBank.objects.filter(pk=bank.pk).update(**{field: F(field) - req.units})
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


class AnalyticsView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        """Get analytics and statistics about the blood donation system"""
        # Donation stats
        total_donations = Donation.objects.count()
        approved_donations = Donation.objects.filter(status='approved').count()
        pending_donations = Donation.objects.filter(status='pending').count()
        total_units_donated = Donation.objects.filter(
            status__in=['approved', 'completed']
        ).values_list('units_donated', flat=True)
        total_units_donated = sum(total_units_donated) if total_units_donated else 0

        # Request stats
        total_requests = BloodRequest.objects.count()
        pending_requests = BloodRequest.objects.filter(status='pending').count()
        fulfilled_requests = BloodRequest.objects.filter(status__in=['fulfilled', 'approved']).count()
        total_units_requested = BloodRequest.objects.values_list('units_required', flat=True)
        total_units_requested = sum(total_units_requested) if total_units_requested else 0

        # Donor stats
        total_donors = DonorProfile.objects.count()
        available_donors = DonorProfile.objects.filter(available=True).count()
        donors_by_blood_group = {}
        for bg in ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']:
            donors_by_blood_group[bg] = DonorProfile.objects.filter(blood_group=bg).count()

        # Blood availability
        banks = BloodBank.objects.all()
        blood_availability = {
            'A+': sum(b.units_a_plus for b in banks),
            'A-': sum(b.units_a_minus for b in banks),
            'B+': sum(b.units_b_plus for b in banks),
            'B-': sum(b.units_b_minus for b in banks),
            'O+': sum(b.units_o_plus for b in banks),
            'O-': sum(b.units_o_minus for b in banks),
            'AB+': sum(b.units_ab_plus for b in banks),
            'AB-': sum(b.units_ab_minus for b in banks),
        }

        # Calculate fulfillment rate
        fulfillment_rate = (fulfilled_requests / total_requests * 100) if total_requests > 0 else 0

        return Response({
            'donations': {
                'total': total_donations,
                'approved': approved_donations,
                'pending': pending_donations,
                'total_units_donated': total_units_donated,
            },
            'requests': {
                'total': total_requests,
                'pending': pending_requests,
                'fulfilled': fulfilled_requests,
                'total_units_requested': total_units_requested,
                'fulfillment_rate': round(fulfillment_rate, 2),
            },
            'donors': {
                'total': total_donors,
                'available': available_donors,
                'by_blood_group': donors_by_blood_group,
            },
            'blood_availability': blood_availability,
        })


class DonationExportView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        """Export user's donations as CSV"""
        import csv
        from django.http import HttpResponse

        # Get user's donations
        donations = Donation.objects.filter(donor=request.user)

        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="donations.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Blood Group', 'Units', 'Blood Bank', 'Status', 'Notes'])

        for donation in donations:
            writer.writerow([
                donation.created_at.strftime('%Y-%m-%d %H:%M'),
                donation.blood_group,
                donation.units_donated,
                donation.blood_bank.name if donation.blood_bank else 'N/A',
                donation.status,
                donation.notes or '',
            ])

        return response


class RequestExportView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        """Export user's blood requests as CSV"""
        import csv
        from django.http import HttpResponse

        # Get user's requests
        blood_requests = BloodRequest.objects.filter(user=request.user)

        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="blood_requests.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Blood Group', 'Units', 'Reason', 'Hospital', 'Status', 'Urgent', 'Notes'])

        for req in blood_requests:
            writer.writerow([
                req.created_at.strftime('%Y-%m-%d %H:%M'),
                req.blood_group,
                req.units_required,
                req.reason or '',
                req.hospital_name or 'N/A',
                req.status,
                'Yes' if req.is_urgent else 'No',
                req.notes or '',
            ])

        return response
