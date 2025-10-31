from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import DonorProfile, BloodBank, Donation

User = get_user_model()


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class CoreAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        # create admin and donor users
        self.admin = User.objects.create_user(username='admin', email='admin@example.com', password='adminpass', role='admin')
        self.donor = User.objects.create_user(username='donor1', email='donor1@example.com', password='donorpass', role='donor')
        # create a blood bank
        self.bank = BloodBank.objects.create(name='Central Bank', city='TestCity')

    def test_register_and_login(self):
        url = '/api/auth/register/'
        data = {'username': 'newdonor', 'email': 'new@example.com', 'password': 'pass1234', 'role': 'donor'}
        resp = self.client.post(url, data, format='json')
        self.assertEqual(resp.status_code, 201)
        # login
        login_url = '/api/auth/login/'
        resp = self.client.post(login_url, {'username': 'newdonor', 'password': 'pass1234'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)

    def test_prevent_duplicate_donor_profile(self):
        # authenticate donor
        login = self.client.post('/api/auth/login/', {'username': 'donor1', 'password': 'donorpass'}, format='json')
        token = login.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # create first profile
        resp = self.client.post('/api/donor-profiles/', {'phone': '12345', 'blood_group': 'A+', 'city': 'CityX'}, format='json')
        self.assertEqual(resp.status_code, 201)

        # attempt to create duplicate profile
        resp2 = self.client.post('/api/donor-profiles/', {'phone': '54321', 'blood_group': 'A+', 'city': 'CityY'}, format='json')
        self.assertEqual(resp2.status_code, 400)
        self.assertIn('Donor profile already exists', str(resp2.data))

    def test_donation_approval_updates_bank_and_sends_email(self):
        # donor creates a donation associated with bank
        login = self.client.post('/api/auth/login/', {'username': 'donor1', 'password': 'donorpass'}, format='json')
        token = login.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        resp = self.client.post('/api/donations/', {'blood_bank': self.bank.id, 'blood_group': 'O+', 'units': 2}, format='json')
        self.assertEqual(resp.status_code, 201)
        donation_id = resp.data.get('id')

        # record initial units
        self.assertEqual(BloodBank.objects.get(pk=self.bank.pk).units_o_plus, 0)

        # admin approves the donation
        login_admin = self.client.post('/api/auth/login/', {'username': 'admin', 'password': 'adminpass'}, format='json')
        admin_token = login_admin.data.get('access')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

        approve_url = f'/api/donations/{donation_id}/approve/'
        resp2 = self.client.post(approve_url, {}, format='json')
        self.assertEqual(resp2.status_code, 200)

        # check donation marked approved
        donation = Donation.objects.get(pk=donation_id)
        self.assertTrue(donation.approved)

        # bank units incremented
        bank = BloodBank.objects.get(pk=self.bank.pk)
        self.assertEqual(bank.units_o_plus, 2)

        # check that an email was queued (locmem backend)
        from django.core import mail
        self.assertTrue(len(mail.outbox) >= 1)
        found = any('Your blood donation has been approved' in m.subject for m in mail.outbox)
        self.assertTrue(found)
