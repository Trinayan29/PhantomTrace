
from rest_framework import serializers


class OrganizationCreateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
        required=True,
        trim_whitespace=True,
    )

    description = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        default="",
    )

    industry = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        default="",
    )


class OrganizationUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=150,
        required=False,
        trim_whitespace=True,
    )

    description = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
    )

    industry = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )


class OrganizationMemberCreateSerializer(serializers.Serializer):
    user_id = serializers.CharField(
        required=True,
        max_length=24,
    )

    role = serializers.ChoiceField(
        choices=[
            "organization_admin",
            "security_analyst",
            "auditor",
            "viewer",
        ],
        required=True,
    )

    def validate_user_id(self, value):
        from bson import ObjectId

        if not ObjectId.is_valid(value):
            raise serializers.ValidationError(
                "Invalid user ID."
            )

        return value


class OrganizationResponseSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField(required=False)
    industry = serializers.CharField(required=False)
    is_active = serializers.BooleanField()
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)


class OrganizationMemberResponseSerializer(serializers.Serializer):
    id = serializers.CharField()
    user_id = serializers.CharField()
    organization_id = serializers.CharField()
    role = serializers.CharField()
    is_active = serializers.BooleanField()

class MessageResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()