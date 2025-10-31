from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('donor', 'Donor'),
        ('hospital', 'Hospital'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='donor')

    def __str__(self):
        return f"{self.username} ({self.role})"


class DonorProfile(models.Model):
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('O+', 'O+'), ('O-', 'O-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
    ]
    user = models.OneToOneField('core.User', on_delete=models.CASCADE, related_name='donor_profile')
    phone = models.CharField(max_length=20, blank=True)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    city = models.CharField(max_length=100, blank=True)
    last_donated = models.DateField(null=True, blank=True)
    available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.blood_group}"


class BloodBank(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    # track units by group in a simple JSON-like field (could be improved)
    units_a_plus = models.PositiveIntegerField(default=0)
    units_a_minus = models.PositiveIntegerField(default=0)
    units_b_plus = models.PositiveIntegerField(default=0)
    units_b_minus = models.PositiveIntegerField(default=0)
    units_o_plus = models.PositiveIntegerField(default=0)
    units_o_minus = models.PositiveIntegerField(default=0)
    units_ab_plus = models.PositiveIntegerField(default=0)
    units_ab_minus = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.city})"


class BloodRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    requester = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, related_name='requests')
    blood_group = models.CharField(max_length=3)
    units = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request {self.id} - {self.blood_group} x{self.units} ({self.status})"


class Donation(models.Model):
    donor = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, related_name='donations')
    blood_bank = models.ForeignKey('core.BloodBank', on_delete=models.SET_NULL, null=True, blank=True)
    blood_group = models.CharField(max_length=3)
    units = models.PositiveIntegerField(default=1)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Donation {self.id} - {self.donor} - {self.blood_group} x{self.units}"
