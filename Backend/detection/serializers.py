from rest_framework import serializers


class DetectionEventSerializer(serializers.Serializer):
    event_type = serializers.CharField(max_length=100)
    source_ip = serializers.IPAddressField(
        required=False,
        allow_null=True,
    )
    failed_attempts = serializers.IntegerField(
        min_value=0,
        default=0,
    )
    organization_id = serializers.CharField(
        required=False,
        allow_blank=False,
    )

    def validate_event_type(self, value):
        value = value.strip().lower()

        if not value:
            raise serializers.ValidationError(
                "Event type cannot be empty."
            )

        return value
