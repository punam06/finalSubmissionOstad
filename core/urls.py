from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, UserViewSet, DonorProfileViewSet,
    BloodBankViewSet, BloodRequestViewSet, DonationViewSet,
    AdminDashboardView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'donor-profiles', DonorProfileViewSet)
router.register(r'blood-banks', BloodBankViewSet)
router.register(r'blood-requests', BloodRequestViewSet)
router.register(r'donations', DonationViewSet)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    # Simple template dashboards
    path('dashboard/donor/', lambda request: __import__('django.shortcuts').shortcuts.render(request, 'donor_dashboard.html'), name='donor-dashboard'),
    path('dashboard/admin/', lambda request: __import__('django.shortcuts').shortcuts.render(request, 'admin_dashboard.html'), name='admin-dashboard-page'),
    path('', include(router.urls)),
]
