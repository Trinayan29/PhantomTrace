from django.contrib.auth.signals import user_login_failed
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta

from .models import SecurityEvent


@receiver(user_login_failed)
def detect_failed_login(sender, credentials, request, **kwargs):

    # Get username
    username = (
        credentials.get('username')
        or credentials.get('email')
        or 'unknown'
    )

    # Get IP address
    ip_address = 'Unknown'

    if request:
        ip_address = request.META.get(
            'REMOTE_ADDR',
            'Unknown'
        )

    # Record failed login
    SecurityEvent.objects.create(
        event_type='failed_login',
        username=username,
        description=f'Failed login from IP: {ip_address}'
    )

    # Check last 10 minutes
    time_limit = timezone.now() - timedelta(minutes=10)

    failed_count = SecurityEvent.objects.filter(
        event_type='failed_login',
        username=username,
        timestamp__gte=time_limit
    ).count()

    # Generate suspicious login alert
    if failed_count >= 5:

        existing_alert = SecurityEvent.objects.filter(
            event_type='suspicious_login',
            username=username,
            timestamp__gte=time_limit
        ).exists()

        if not existing_alert:

            SecurityEvent.objects.create(
                event_type='suspicious_login',
                username=username,
                description=(
                    f'{failed_count} failed login attempts '
                    f'within 10 minutes. IP: {ip_address}'
                )
            )