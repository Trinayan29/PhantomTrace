from pymongo.errors import PyMongoError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import DetectionEventSerializer
from .services import (
    create_detection_event,
    list_detection_events,
)


class DetectionEventView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            events = list_detection_events(
                str(request.user.id),
                request.query_params.get("organization_id"),
            )

            return Response({
                "success": True,
                "total": len(events),
                "results": events,
            })

        except PermissionError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"error": "Unable to retrieve detection events."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    def post(self, request):
        serializer = DetectionEventSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = create_detection_event(
                serializer.validated_data,
                str(request.user.id),
            )

            return Response(
                {
                    "success": True,
                    **result,
                },
                status=status.HTTP_201_CREATED,
            )

        except PermissionError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_403_FORBIDDEN,
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except PyMongoError:
            return Response(
                {"error": "Unable to process detection event."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
