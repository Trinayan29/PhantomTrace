from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import RiskEvaluationSerializer
from .services import evaluate_finding
from security_assistant import explain_finding


class RiskEvaluateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RiskEvaluationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = evaluate_finding(serializer.validated_data)
            return Response(
                {"success": True, **result},
                status=status.HTTP_200_OK,
            )
        except (TypeError, ValueError) as error:
            return Response(
                {"success": False, "error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class RiskExplainView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RiskEvaluationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = explain_finding(serializer.validated_data)
            return Response(
                {"success": True, "assistant": result},
                status=status.HTTP_200_OK,
            )
        except (TypeError, ValueError) as error:
            return Response(
                {"success": False, "error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )
