from django.core.mail import send_mail
from django.conf import settings


def send_donation_approved_email(donation):
    """Send an email to donor when their donation is approved."""
    donor = donation.donor
    if not donor or not donor.email:
        return
    subject = 'Your blood donation has been approved'
    message = f"Hello {donor.get_full_name() or donor.username},\n\nYour donation (blood group: {donation.blood_group}, units: {donation.units}) has been approved. Thank you for your contribution!\n\nRegards,\nBlood Management Team"
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [donor.email], fail_silently=True)


def notify_donors_blood_needed(blood_request):
    """Notify available donors who match the requested blood group."""
    from .models import DonorProfile

    group = blood_request.blood_group
    donors = DonorProfile.objects.filter(blood_group__iexact=group, available=True).select_related('user')
    emails = [d.user.email for d in donors if d.user and d.user.email]
    if not emails:
        return
    subject = f'Blood needed: {group}'
    message = f"A new blood request has been made requesting {blood_request.units} unit(s) of {group}.\n\nIf you are available, please consider donating or contact the blood bank/administrator.\n\nRegards,\nBlood Management Team"
    # Send to all matching donors (BCC is not handled here; using send_mail for simplicity)
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, list(set(emails)), fail_silently=True)
