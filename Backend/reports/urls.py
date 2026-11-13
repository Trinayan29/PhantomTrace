
from django.urls import path

from .views import (
    ReportFindingsView,
    ReportSummaryView,
    RemediationReportView,
    ReportExportCSVView,
    ReportExportPDFView,
)

urlpatterns = [
    path("findings/", ReportFindingsView.as_view(), name="report-findings"),
    path("summary/", ReportSummaryView.as_view(), name="report-summary"),
    path("remediation/", RemediationReportView.as_view(), name="report-remediation"),
    path("export/csv/", ReportExportCSVView.as_view(), name="report-export-csv"),
    path("export/pdf/", ReportExportPDFView.as_view(), name="report-export-pdf"),
]