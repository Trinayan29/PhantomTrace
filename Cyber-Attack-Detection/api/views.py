from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.core.validators import validate_ipv46_address

from .models import Incident
from .detector import detect_suspicious_activity


@api_view(["GET", "POST"])
def detect_event(request):

    # GET request
    if request.method == "GET":
        return Response({
            "success": True,
            "message": "Cyber Attack Detection API is working!",
            "endpoint": "/api/detect/",
            "methods": ["GET", "POST"]
        })

    # POST request
    event_type = request.data.get("event_type", "")
    source_ip = request.data.get("source_ip")
    failed_attempts = request.data.get("failed_attempts", 0)

    if not isinstance(event_type, str) or not event_type.strip():
        return Response(
            {"success": False, "error": "event_type is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        if isinstance(failed_attempts, bool):
            raise ValueError

        failed_attempts = int(failed_attempts)

        if failed_attempts < 0:
            raise ValueError

    except (ValueError, TypeError):
        return Response(
            {"success": False, "error": "failed_attempts must be a non-negative integer"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if source_ip == "":
        source_ip = None

    if source_ip is not None:
        try:
            validate_ipv46_address(source_ip)
        except (ValidationError, TypeError):
            return Response(
                {"success": False, "error": "Invalid IP address"},
                status=status.HTTP_400_BAD_REQUEST
            )

    suspicious = detect_suspicious_activity(
        event_type,
        failed_attempts
    )

    incident = Incident.objects.create(
        event_type=event_type.strip(),
        source_ip=source_ip,
        failed_attempts=failed_attempts,
        is_suspicious=suspicious
    )

    return Response({
        "success": True,
        "incident_id": incident.id,
        "event_type": incident.event_type,
        "is_suspicious": suspicious,
        "message": (
            "Suspicious activity detected"
            if suspicious else "Normal activity"
        )
    }, status=status.HTTP_201_CREATED)
