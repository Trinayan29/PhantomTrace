from rest_framework import serializers


class RiskEvaluationSerializer(serializers.Serializer):
    employment_status = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    account_active = serializers.BooleanField(required=False)

    privilege_level = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    resource_sensitivity = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    owner_known = serializers.BooleanField(required=False)

    suspicious_activity = serializers.JSONField(
        required=False,
        default=False,
    )

    def validate_suspicious_activity(self, value):
        if isinstance(value, bool):
            return value

        if isinstance(value, list) and all(
            isinstance(item, str) for item in value
        ):
            return value

        raise serializers.ValidationError(
            "Must be a boolean or a list of strings."
        )

    def validate(self, attrs):
        allowed = set(self.fields.keys())
        supplied = set(self.initial_data.keys())
        unknown = supplied - allowed

        if unknown:
            raise serializers.ValidationError({
                "unknown_fields": sorted(unknown)
            })

        return attrs
