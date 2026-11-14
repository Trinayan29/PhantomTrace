from rest_framework import serializers


class ApplicationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True, required=False)
    organization_id = serializers.CharField(read_only=True, required=False)

    name = serializers.CharField(max_length=150)
    display_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    application_type = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )
    type = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )
    status = serializers.ChoiceField(
        choices=["active", "inactive", "suspended"],
        default="active",
    )
    risk_score = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=100,
        allow_null=True,
    )
    metadata = serializers.DictField(
        required=False,
        default=dict,
    )
