
from django.contrib import admin
from .models import Incident


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "event_type",
        "source_ip",
        "failed_attempts",
        "is_suspicious",
        "created_at",
    )

    list_filter = ("is_suspicious", "created_at")
    search_fields = ("event_type", "source_ip")
