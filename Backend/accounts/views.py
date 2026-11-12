
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.permissions import AllowAny
from .serializers import RefreshTokenSerializer, TokenPairSerializer

from drf_spectacular.utils import extend_schema
from pymongo.errors import DuplicateKeyError, PyMongoError

from .serializers import RegistrationSerializer, LoginSerializer
from . import services
from .serializers import LogoutSerializer
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer


class RegistrationResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    user = serializers.DictField()


class RegistrationErrorSerializer(serializers.Serializer):
    error = serializers.CharField()


class LoginResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.DictField()



class RegisterView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    ALLOWED_REGISTRATION_FIELDS = {
        "full_name",
        "username",
        "email",
        "password",
        "confirm_password",
    }

    @extend_schema(
        operation_id="register_user",
        summary="Register a new PhantomTrace user",
        description=(
            "Create a standard PhantomTrace account. "
            "Public registration cannot assign platform roles, "
            "organization memberships, or administrative privileges."
        ),
        request=RegistrationSerializer,
        responses={
            201: RegistrationResponseSerializer,
            400: RegistrationErrorSerializer,
            409: RegistrationErrorSerializer,
            503: RegistrationErrorSerializer,
        },
        tags=["Authentication"],
    )
    def post(self, request):

        # Reject unexpected fields rather than silently accepting
        # role, organization, or privilege-related input.
        unexpected_fields = (
            set(request.data.keys())
            - self.ALLOWED_REGISTRATION_FIELDS
        )

        if unexpected_fields:
            return Response(
                {
                    "error": (
                        "Unsupported registration fields: "
                        + ", ".join(sorted(unexpected_fields))
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RegistrationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_data = serializer.validated_data.copy()
            user_data.pop("confirm_password")

            user = services.create_user(**user_data)

            return Response(
                {
                    "message": "Registration successful.",
                    "user": user,
                },
                status=status.HTTP_201_CREATED
            )

        except DuplicateKeyError:
            return Response(
                {"error": "Username or email already exists."},
                status=status.HTTP_409_CONFLICT
            )

        except PyMongoError:
            return Response(
                {"error": "Unable to register user."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )



class LoginView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="login_user",
        summary="Login to PhantomTrace",
        request=LoginSerializer,
        responses={
            200: LoginResponseSerializer,
            400: RegistrationErrorSerializer,
            401: RegistrationErrorSerializer,
            503: RegistrationErrorSerializer,
        },
        tags=["Authentication"],
    )
    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = services.authenticate_user(
                serializer.validated_data["identifier"],
                serializer.validated_data["password"]
            )

            if not user:
                return Response(
                    {"error": "Invalid username/email or password."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            tokens = services.issue_token_pair(user["id"])

            return Response(
                {
                    "message": "Login successful.",
                    "access": tokens["access"],
                    "refresh": tokens["refresh"],
                    "user": user,
                },
                status=status.HTTP_200_OK
            )

        except PyMongoError:
            return Response(
                {"error": "Authentication service unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except ValueError:
            return Response(
                {"error": "Unable to generate authentication tokens."},
                status=status.HTTP_401_UNAUTHORIZED
            )


class RefreshTokenView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="refresh_auth_token",
        summary="Refresh PhantomTrace JWT tokens",
        request=RefreshTokenSerializer,
        responses={
            200: TokenPairSerializer,
            400: RegistrationErrorSerializer,
            401: RegistrationErrorSerializer,
            503: RegistrationErrorSerializer,
        },
        tags=["Authentication"],
    )
    def post(self, request):
        serializer = RefreshTokenSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:
            tokens = services.rotate_refresh_token(
                serializer.validated_data["refresh"]
            )

            return Response(
                tokens,
                status=status.HTTP_200_OK
            )

        except ValueError:
            return Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        except PyMongoError:
            return Response(
                {"error": "Authentication service unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class LogoutView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="logout_user",
        summary="Logout and revoke refresh token",
        request=LogoutSerializer,
        responses={
            200: RegistrationResponseSerializer,
            400: RegistrationErrorSerializer,
            401: RegistrationErrorSerializer,
            503: RegistrationErrorSerializer,
        },
        tags=["Authentication"],
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            revoked = services.revoke_refresh_token(
                serializer.validated_data["refresh"]
            )

            if not revoked:
                return Response(
                    {"error": "Refresh token is invalid or already revoked."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            return Response(
                {"message": "Logout successful.", "user": {}},
                status=status.HTTP_200_OK
            )

        except ValueError:
            return Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        except PyMongoError:
            return Response(
                {"error": "Authentication service unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )



class CurrentUserView(APIView):

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="get_current_user",
        summary="Get authenticated user profile and permissions",
        responses={
            200: UserProfileSerializer,
        },
        tags=["Authentication"],
    )
    def get(self, request):

        try:
            access = services.get_user_roles_and_permissions(
                request.user.id
            )

            user_data = {
                "id": request.user.id,
                "full_name": request.user.full_name,
                "username": request.user.username,
                "email": request.user.email,
                "is_active": request.user.is_active,
                "is_verified": request.user.is_verified,
                "roles": access["roles"],
                "permissions": access["permissions"],
                "is_super_admin": access["is_super_admin"],
                "memberships": access["memberships"],
            }

            return Response(
                user_data,
                status=status.HTTP_200_OK
            )

        except PyMongoError:
            return Response(
                {"error": "Unable to retrieve user profile."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
