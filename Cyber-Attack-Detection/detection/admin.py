
from django.contrib import api
from .models import SecurityEvent

@admin.register(SecurityEvent)
class SecurityEventAdmin(api.ModelApi):
    list_display = (
        'event_type',
        'username',
        'timestamp',
        'is_resolved'
    )

    list_filter = ('event_type', 'is_resolved')

    search_fields = ('username', 'description')

    ordering = ('-timestamp',)