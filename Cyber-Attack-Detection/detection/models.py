
from django.db import models

class SecurityEvent(models.Model):

    EVENT_CHOICES = [
        ('failed_login', 'Failed Login'),
        ('suspicious_login', 'Suspicious Login'),
        ('unauthorized_access', 'Unauthorized Access'),
    ]

    event_type = models.CharField(
        max_length=50,
        choices=EVENT_CHOICES
    )

    username = models.CharField(max_length=100)

    description = models.TextField()

    timestamp = models.DateTimeField(auto_now_add=True)

    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return self.event_type