
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

from services.mongodb import get_database


class RegistrationSerializer(serializers.Serializer):

    full_name = serializers.CharField(max_length=150)
    username = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        value = value.strip().lower()

        if get_database().users.find_one({"username": value}):
            raise serializers.ValidationError(
                "This username is already registered."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if get_database().users.find_one({"email": value}):
            raise serializers.ValidationError(
                "This email is already registered."
            )

        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return data

class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        write_only=True,
        trim_whitespace=False
    )


class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(
        write_only=True,
        trim_whitespace=False
    )


#Permissions given to members of particular roles
class OrganizationMembershipSerializer(serializers.Serializer):
    organization_id = serializers.CharField(
        allow_null=True
    )
    role = serializers.CharField()
    permissions = serializers.ListField(
        child=serializers.CharField()
    )


class UserProfileSerializer(serializers.Serializer):
    id = serializers.CharField()
    full_name = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()
    is_active = serializers.BooleanField()
    is_verified = serializers.BooleanField()

    roles = serializers.ListField(
        child=serializers.CharField()
    )

    permissions = serializers.ListField(
        child=serializers.CharField()
    )

    is_super_admin = serializers.BooleanField()

    memberships = OrganizationMembershipSerializer(
        many=True
    )

