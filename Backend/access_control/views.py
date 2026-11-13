from django.shortcuts import render

# Create your views here.

from pymongo.errors import PyMongoError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema

from . import services
from .serializers import (
    OrganizationCreateSerializer,
    OrganizationUpdateSerializer,
    OrganizationMemberCreateSerializer,
    OrganizationResponseSerializer,
    OrganizationMemberResponseSerializer,
    MessageResponseSerializer,
)


class OrganizationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="list_accessible_organizations",
        summary="List accessible organizations",
        description="Returns organizations within the authenticated user's access scope.",
        responses={200: OrganizationResponseSerializer(many=True)},
    )
    def get(self, request):
        try:
            organizations = services.list_organizations(
                str(request.user.id)
            )

            return Response(
                organizations,
                status=status.HTTP_200_OK,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    @extend_schema(
        request=OrganizationCreateSerializer,
        responses={201: OrganizationResponseSerializer},
        summary="Create an organization",
    )
    def post(self, request):
        serializer = OrganizationCreateSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            organization = services.create_organization(
                user_id=str(request.user.id),
                data=serializer.validated_data,
            )

            return Response(
                organization,
                status=status.HTTP_201_CREATED,
            )

        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class OrganizationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="retrieve_organization",
        responses={200: OrganizationResponseSerializer},
        summary="Retrieve an organization",
    )
    def get(self, request, organization_id):
        try:
            organization = services.get_organization(
                user_id=str(request.user.id),
                organization_id=organization_id,
            )

            return Response(
                organization,
                status=status.HTTP_200_OK,
            )

        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    @extend_schema(
        request=OrganizationUpdateSerializer,
        responses={200: OrganizationResponseSerializer},
        summary="Update an organization",
    )
    def patch(self, request, organization_id):
        serializer = OrganizationUpdateSerializer(
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            organization = services.update_organization(
                user_id=str(request.user.id),
                organization_id=organization_id,
                data=serializer.validated_data,
            )

            return Response(
                organization,
                status=status.HTTP_200_OK,
            )

        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    @extend_schema(
        responses={200: MessageResponseSerializer},
        summary="Deactivate an organization",
    )
    def delete(self, request, organization_id):
        try:
            services.deactivate_organization(
                user_id=str(request.user.id),
                organization_id=organization_id,
            )

            return Response(
                {"detail": "Organization deactivated successfully."},
                status=status.HTTP_200_OK,
            )

        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class OrganizationMemberCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=OrganizationMemberCreateSerializer,
        responses={201: OrganizationMemberResponseSerializer},
        summary="Add a member to an organization",
    )
    def post(self, request, organization_id):
        serializer = OrganizationMemberCreateSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            membership = services.add_organization_member(
                user_id=str(request.user.id),
                organization_id=organization_id,
                member_user_id=serializer.validated_data["user_id"],
                role_name=serializer.validated_data["role"],
            )

            return Response(
                membership,
                status=status.HTTP_201_CREATED,
            )

        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

class OrganizationMembersView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: OrganizationMemberResponseSerializer(many=True)},
        summary="List organization members",
    )
    def get(self, request, organization_id):
        try:
            members = services.list_organization_members(
                user_id=str(request.user.id),
                organization_id=organization_id,
            )

            return Response(
                members,
                status=status.HTTP_200_OK,
            )

        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    @extend_schema(
        request=OrganizationMemberCreateSerializer,
        responses={201: OrganizationMemberResponseSerializer},
        summary="Add a member to an organization",
    )
    def post(self, request, organization_id):
        serializer = OrganizationMemberCreateSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            membership = services.add_organization_member(
                user_id=str(request.user.id),
                organization_id=organization_id,
                member_user_id=serializer.validated_data["user_id"],
                role_name=serializer.validated_data["role"],
            )

            return Response(
                membership,
                status=status.HTTP_201_CREATED,
            )

        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class OrganizationMemberDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=OrganizationMemberCreateSerializer,
        responses={200: OrganizationMemberResponseSerializer},
        summary="Change an organization member's role",
    )
    def patch(self, request, organization_id, member_user_id):
        serializer = OrganizationMemberCreateSerializer(
            data={
                "user_id": member_user_id,
                "role": request.data.get("role"),
            }
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            membership = services.update_organization_member_role(
                user_id=str(request.user.id),
                organization_id=organization_id,
                member_user_id=member_user_id,
                role_name=serializer.validated_data["role"],
            )

            return Response(
                membership,
                status=status.HTTP_200_OK,
            )

        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    @extend_schema(
        responses={200: MessageResponseSerializer},
        summary="Deactivate an organization membership",
    )
    def delete(self, request, organization_id, member_user_id):
        try:
            services.deactivate_organization_member(
                user_id=str(request.user.id),
                organization_id=organization_id,
                member_user_id=member_user_id,
            )

            return Response(
                {"detail": "Organization membership deactivated."},
                status=status.HTTP_200_OK,
            )

        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"detail": "Database operation failed."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
