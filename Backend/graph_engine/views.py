from django.shortcuts import render
from django.shortcuts import render
from pymongo.errors import PyMongoError
from drf_spectacular.utils import extend_schema
from .serializers import AccessGraphResponseSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .services import get_access_graph


class AccessGraphView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: AccessGraphResponseSerializer},
        summary="Retrieve the access relationship graph",
        description="Returns the identities, applications, permissions, resources, and access relationships available to the authenticated user.",
    )

    def get(self, request):
        user_id = getattr(request.user, "id", None)

        if not user_id:
            return Response(
                {"error": "Unable to identify the authenticated user."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        organization_id = request.query_params.get("organization_id")

        try:
            graph = get_access_graph(
                user_id=str(user_id),
                organization_id=organization_id,
            )

            return Response(
                {
                    "success": True,
                    **graph,
                },
                status=status.HTTP_200_OK,
            )

        except PermissionError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"error": "Unable to retrieve the access graph."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
