from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DonorProfile, BloodBank, BloodRequest, Donation

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='donor')

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'first_name', 'last_name')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class DonorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = DonorProfile
        fields = ('id', 'user', 'phone', 'blood_group', 'city', 'last_donated', 'available')


class BloodBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodBank
        fields = '__all__'


class BloodRequestSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)

    class Meta:
        model = BloodRequest
        fields = ('id', 'requester', 'blood_group', 'units', 'status', 'created_at')
        read_only_fields = ('status', 'created_at')


class DonationSerializer(serializers.ModelSerializer):
    donor = UserSerializer(read_only=True)

    class Meta:
        model = Donation
        fields = ('id', 'donor', 'blood_bank', 'blood_group', 'units', 'approved', 'created_at')
        read_only_fields = ('approved', 'created_at')
