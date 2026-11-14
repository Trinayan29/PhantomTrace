from pymongo.errors import PyMongoError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import ApplicationSerializer
from . import services


class ApplicationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="list_applications",
        summary="List accessible applications",
        responses={200: ApplicationSerializer(many=True)},
    )
    def get(self, request):
        try:
            applications = services.list_applications(
                str(request.user.id)
            )
            return Response(applications)

        except PyMongoError:
            return Response(
                {"error": "Unable to retrieve applications."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except (ValueError, PermissionError):
            return Response(
                {"error": "Unable to resolve organization access."},
                status=status.HTTP_403_FORBIDDEN,
            )

    @extend_schema(
        operation_id="create_application",
        summary="Create an application",
        request=ApplicationSerializer,
        responses={
            201: ApplicationSerializer,
            400: OpenApiResponse(description="Invalid application data."),
            403: OpenApiResponse(description="Organization access denied."),
            503: OpenApiResponse(description="MongoDB service unavailable."),
        },
    )
    def post(self, request):
        serializer = ApplicationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            application = services.create_application(
                serializer.validated_data,
                user_id=str(request.user.id),
                organization_id=request.data.get("organization_id"),
            )
            return Response(
                application,
                status=status.HTTP_201_CREATED,
            )

        except (ValueError, PermissionError) as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except PyMongoError:
            return Response(
                {"error": "Unable to create application."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class ApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="retrieve_application",
        summary="Retrieve an application",
        responses={
            200: ApplicationSerializer,
            404: OpenApiResponse(description="Application not found."),
        },
    )
    def get(self, request, application_id):
        try:
            application = services.get_application(
                application_id,
                str(request.user.id),
            )

            if application is None:
                return Response(
                    {"error": "Application not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(application)

        except PyMongoError:
            return Response(
                {"error": "Unable to retrieve application."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except (ValueError, PermissionError):
            return Response(
                {"error": "Unable to resolve organization access."},
                status=status.HTTP_403_FORBIDDEN,
            )

    @extend_schema(
        operation_id="update_application",
        summary="Update an application",
        request=ApplicationSerializer,
        responses={
            200: ApplicationSerializer,
            400: OpenApiResponse(description="Invalid application data."),
            404: OpenApiResponse(description="Application not found."),
        },
    )
    def patch(self, request, application_id):
        serializer = ApplicationSerializer(
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            application = services.update_application(
                application_id,
                serializer.validated_data,
                str(request.user.id),
            )

            if application is None:
                return Response(
                    {"error": "Application not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(application)

        except PyMongoError:
            return Response(
                {"error": "Unable to update application."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except (ValueError, PermissionError):
            return Response(
                {"error": "Unable to resolve organization access."},
                status=status.HTTP_403_FORBIDDEN,
            )

    @extend_schema(
        operation_id="delete_application",
        summary="Soft-delete an application",
        responses={
            200: OpenApiResponse(description="Application deleted successfully."),
            404: OpenApiResponse(description="Application not found."),
        },
    )
    def delete(self, request, application_id):
        try:
            deleted = services.delete_application(
                application_id,
                str(request.user.id),
            )

            if not deleted:
                return Response(
                    {"error": "Application not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(
                {"message": "Application deleted successfully."},
                status=status.HTTP_200_OK,
            )

        except PyMongoError:
            return Response(
                {"error": "Unable to delete application."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except (ValueError, PermissionError):
            return Response(
                {"error": "Unable to resolve organization access."},
                status=status.HTTP_403_FORBIDDEN,
            )
