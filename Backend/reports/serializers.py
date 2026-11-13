
from rest_framework import serializers


class ReportFindingsResponseSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    limit = serializers.IntegerField()
    skip = serializers.IntegerField()
    results = serializers.ListField(
        child=serializers.JSONField()
    )


class ReportSummaryResponseSerializer(serializers.Serializer):
    total_findings = serializers.IntegerField()
    severity = serializers.JSONField()
    status = serializers.JSONField()
    remediation_status = serializers.JSONField()


class RemediationReportResponseSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    limit = serializers.IntegerField()
    skip = serializers.IntegerField()
    results = serializers.ListField(
        child=serializers.JSONField()
    )


class ReportErrorResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
