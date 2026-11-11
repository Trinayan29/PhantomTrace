
from django.db import models


class Incident(models.Model):
    event_type = models.CharField(max_length=100)
    source_ip = models.GenericIPAddressField(
        null=True,
        blank=True
    )
    failed_attempts = models.PositiveIntegerField(default=0)
    is_suspicious = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.event_type
