from django.shortcuts import render

import csv
import io
from xml.sax.saxutils import escape

from pymongo.errors import PyMongoError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse

from drf_spectacular.utils import (
    extend_schema,
    OpenApiResponse,
    OpenApiTypes,
)

from . import services
from .serializers import (
    ReportFindingsResponseSerializer,
    ReportSummaryResponseSerializer,
    RemediationReportResponseSerializer,
)


def get_report_filters(request):
    return {
        "severity": request.query_params.get("severity"),
        "status": request.query_params.get("status"),
        "organization_id": request.query_params.get("organization_id"),
        "limit": request.query_params.get("limit", 50),
        "skip": request.query_params.get("skip", 0),
    }


def handle_report_error(exc):
    if isinstance(exc, PermissionError):
        return Response(
            {"detail": str(exc)},
            status=status.HTTP_403_FORBIDDEN,
        )

    if isinstance(exc, ValueError):
        return Response(
            {"detail": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, PyMongoError):
        return Response(
            {"detail": "Database operation failed."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {"detail": "An unexpected report error occurred."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


class ReportFindingsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="get_security_report_summary",
        responses={200: ReportSummaryResponseSerializer},
        summary="Get security report summary",
    )
    def get(self, request):
        try:
            result = services.list_findings(
                str(request.user.id),
                get_report_filters(request),
            )
            return Response(result, status=status.HTTP_200_OK)
        except (PermissionError, ValueError, PyMongoError) as exc:
            return handle_report_error(exc)


class ReportSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="list_security_findings",
        responses={200: ReportFindingsResponseSerializer},
        summary="List security findings",
    )
    def get(self, request):
        try:
            result = services.get_report_summary(
                str(request.user.id),
                get_report_filters(request),
            )
            return Response(result, status=status.HTTP_200_OK)
        except (PermissionError, ValueError, PyMongoError) as exc:
            return handle_report_error(exc)


class RemediationReportView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="list_remediation_actions",
        responses={200: RemediationReportResponseSerializer},
        summary="List remediation actions",
    )
    def get(self, request):
        try:
            result = services.list_remediation_actions(
                str(request.user.id),
                get_report_filters(request),
            )
            return Response(result, status=status.HTTP_200_OK)
        except (PermissionError, ValueError, PyMongoError) as exc:
            return handle_report_error(exc)


class ReportExportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="export_security_findings_csv",
        responses={
            (200, "text/csv"): OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description="Downloadable CSV report.",
            )
        },
        summary="Export security findings as CSV",
    )
    def get(self, request):
        try:
            findings = services.get_export_findings(
                str(request.user.id),
                get_report_filters(request),
            )

            output = io.StringIO()
            writer = csv.writer(output)

            columns = [
                "_id",
                "title",
                "description",
                "severity",
                "status",
                "remediation_status",
                "organization_id",
                "created_at",
            ]

            writer.writerow(columns)

            for finding in findings:
                writer.writerow([
                    str(finding.get(column, ""))
                    for column in columns
                ])

            response = HttpResponse(
                output.getvalue(),
                content_type="text/csv; charset=utf-8",
            )
            response["Content-Disposition"] = (
                'attachment; filename="phantomtrace_report.csv"'
            )
            return response

        except (PermissionError, ValueError, PyMongoError) as exc:
            return handle_report_error(exc)


class ReportExportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="export_security_findings_pdf",
        responses={
            (200, "application/pdf"): OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description="Downloadable PDF report.",
            )
        },
        summary="Export security findings as PDF",
    )
    def get(self, request):
        try:
            findings = services.get_export_findings(
                str(request.user.id),
                get_report_filters(request),
            )

            try:
                from reportlab.lib import colors
                from reportlab.lib.pagesizes import A4, landscape
                from reportlab.lib.styles import getSampleStyleSheet
                from reportlab.platypus import (
                    SimpleDocTemplate,
                    Paragraph,
                    Spacer,
                    Table,
                    TableStyle,
                )
            except ImportError:
                return Response(
                    {
                        "detail": (
                            "PDF export requires reportlab. "
                            "Install it using: pip install reportlab"
                        )
                    },
                    status=status.HTTP_501_NOT_IMPLEMENTED,
                )

            buffer = io.BytesIO()

            document = SimpleDocTemplate(
                buffer,
                pagesize=landscape(A4),
                rightMargin=25,
                leftMargin=25,
                topMargin=30,
                bottomMargin=30,
            )

            styles = getSampleStyleSheet()
            elements = [
                Paragraph("PhantomTrace Security Report", styles["Title"]),
                Spacer(1, 16),
                Paragraph(
                    f"Total findings: {len(findings)}",
                    styles["Normal"],
                ),
                Spacer(1, 12),
            ]

            table_data = [[
                "Title",
                "Severity",
                "Status",
                "Remediation",
            ]]

            for finding in findings:
                table_data.append([
                    Paragraph(
                        escape(str(finding.get("title", "Untitled"))),
                        styles["BodyText"],
                    ),
                    escape(str(finding.get("severity", "Unknown"))),
                    escape(str(finding.get("status", "Unknown"))),
                    escape(str(
                        finding.get("remediation_status", "Unknown")
                    )),
                ])

            table = Table(
                table_data,
                repeatRows=1,
                colWidths=[300, 100, 120, 130],
            )

            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#263445")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 7),
            ]))

            elements.append(table)
            document.build(elements)

            response = HttpResponse(
                buffer.getvalue(),
                content_type="application/pdf",
            )
            response["Content-Disposition"] = (
                'attachment; filename="phantomtrace_report.pdf"'
            )
            return response

        except (PermissionError, ValueError, PyMongoError) as exc:
            return handle_report_error(exc)

# Create your views here.
