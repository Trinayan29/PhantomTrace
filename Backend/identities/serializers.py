
from rest_framework import serializers


class IdentitySerializer(serializers.Serializer):

    id = serializers.CharField(read_only=True, required=False)

    organization_id = serializers.CharField(read_only=True, required=False)

    display_name = serializers.CharField(max_length=150)

    email = serializers.EmailField(
        required=False,
        allow_blank=True
    )

    username = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    identity_type = serializers.ChoiceField(
        choices=[
            "human",
            "service_account",
            "external",
            "machine"
        ],
        default="human"
    )

    status = serializers.ChoiceField(
        choices=[
            "active",
            "inactive",
            "suspended"
        ],
        default="active"
    )

    department = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    source = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    external_id = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True
    )

    metadata = serializers.DictField(
        required=False,
        default=dict
    )
