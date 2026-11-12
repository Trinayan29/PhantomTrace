
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo.errors import PyMongoError
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import IdentitySerializer
from . import services


class IdentityListCreateView(APIView):

    @extend_schema(
        operation_id="list_identities",
        summary="List accessible identities",
        description=(
            "Retrieve digital identities belonging to organizations "
            "the authenticated user is authorized to access."
        ),
        responses={
            200: IdentitySerializer(many=True),
            503: OpenApiResponse(description="MongoDB service unavailable.")
        }
    )
    def get(self, request):
        try:
            identities = services.list_identities(
                str(request.user.id)
            )

            return Response(identities)

        except PyMongoError:
            return Response(
                {"error": "Unable to retrieve identities."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except ValueError:
            return Response(
                {"error": "Unable to resolve organization access."},
                status=status.HTTP_403_FORBIDDEN
            )

    @extend_schema(
        operation_id="create_identity",
        summary="Create an identity",
        description=(
            "Register a digital identity in an organization "
            "the authenticated user is authorized to access. "
            "organization_id is optional when the user belongs "
            "to exactly one organization."
        ),
        request=IdentitySerializer,
        responses={
            201: IdentitySerializer,
            400: OpenApiResponse(description="Invalid identity data."),
            403: OpenApiResponse(description="Organization access denied."),
            503: OpenApiResponse(description="MongoDB service unavailable.")
        }
    )
    def post(self, request):
        serializer = IdentitySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Organization selection is resolved separately from identity data.
        organization_id = request.data.get("organization_id")

        try:
            identity = services.create_identity(
                serializer.validated_data,
                user_id=str(request.user.id),
                organization_id=organization_id
            )

            return Response(
                identity,
                status=status.HTTP_201_CREATED
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_403_FORBIDDEN
            )

        except PyMongoError:
            return Response(
                {"error": "Unable to create identity."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


class IdentityDetailView(APIView):

    @extend_schema(
        operation_id="retrieve_identity",
        summary="Retrieve an identity",
        description=(
            "Retrieve a digital identity using its MongoDB ID, "
            "subject to organization access restrictions."
        ),
        responses={
            200: IdentitySerializer,
            404: OpenApiResponse(description="Identity not found."),
            403: OpenApiResponse(description="Organization access denied."),
            503: OpenApiResponse(description="MongoDB service unavailable.")
        }
    )
    def get(self, request, identity_id):
        try:
            identity = services.get_identity(
                identity_id,
                str(request.user.id)
            )

            if identity is None:
                return Response(
                    {"error": "Identity not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(identity)

        except PyMongoError:
            return Response(
                {"error": "Unable to retrieve identity."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except ValueError:
            return Response(
                {"error": "Unable to resolve organization access."},
                status=status.HTTP_403_FORBIDDEN
            )

    @extend_schema(
        operation_id="update_identity",
        summary="Update an identity",
        description=(
            "Partially update an existing digital identity "
            "within the authenticated user's organization scope."
        ),
        request=IdentitySerializer,
        responses={
            200: IdentitySerializer,
            400: OpenApiResponse(description="Invalid identity data."),
            404: OpenApiResponse(description="Identity not found."),
            403: OpenApiResponse(description="Organization access denied."),
            503: OpenApiResponse(description="MongoDB service unavailable.")
        }
    )
    def patch(self, request, identity_id):
        serializer = IdentitySerializer(
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            identity = services.update_identity(
                identity_id,
                serializer.validated_data,
                str(request.user.id)
            )

            if identity is None:
                return Response(
                    {"error": "Identity not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(identity)

        except PyMongoError:
            return Response(
                {"error": "Unable to update identity."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except ValueError:
            return Response(
                {"error": "Unable to resolve organization access."},
                status=status.HTTP_403_FORBIDDEN
            )

    @extend_schema(
        operation_id="delete_identity",
        summary="Delete an identity",
        description=(
            "Soft-delete an existing digital identity "
            "within the authenticated user's organization scope."
        ),
        responses={
            200: OpenApiResponse(description="Identity deleted successfully."),
            404: OpenApiResponse(description="Identity not found."),
            403: OpenApiResponse(description="Organization access denied."),
            503: OpenApiResponse(description="MongoDB service unavailable.")
        }
    )
    def delete(self, request, identity_id):
        try:
            deleted = services.delete_identity(
                identity_id,
                str(request.user.id)
            )

            if not deleted:
                return Response(
                    {"error": "Identity not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                {"message": "Identity deleted successfully."},
                status=status.HTTP_200_OK
            )

        except PyMongoError:
            return Response(
                {"error": "Unable to delete identity."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except ValueError:
            return Response(
                {"error": "Unable to resolve organization access."},
                status=status.HTTP_403_FORBIDDEN
            )
