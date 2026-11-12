
from datetime import datetime, timezone
from bson import ObjectId

from services.mongodb import get_database
from accounts.services import get_user_access_context


def _serialize(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: _serialize(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_serialize(item) for item in value]
    return value


def _report_scope(user_id, permission="reports.read"):
    contexts = get_user_access_context(user_id)

    if any(
        item["assignment_type"] == "global"
        and item["role"] == "super_admin"
        for item in contexts
    ):
        return None

    organization_ids = []

    for item in contexts:
        if (
            item["assignment_type"] == "organization"
            and permission in item["permissions"]
            and item.get("organization_id")
        ):
            organization_id = ObjectId(item["organization_id"])
            if organization_id not in organization_ids:
                organization_ids.append(organization_id)

    if not organization_ids:
        raise PermissionError(
            "You do not have permission to access reports."
        )

    return organization_ids


def _build_findings_query(user_id, filters=None):
    filters = filters or {}
    scope = _report_scope(user_id)

    query = {}

    if scope is not None:
        query["organization_id"] = {"$in": scope}

    severity = filters.get("severity")
    if severity:
        query["severity"] = severity.lower()

    status_value = filters.get("status")
    if status_value:
        query["status"] = status_value.lower()

    organization_id = filters.get("organization_id")
    if organization_id:
        if not ObjectId.is_valid(str(organization_id)):
            raise ValueError("Invalid organization ID.")

        organization_object_id = ObjectId(str(organization_id))

        if scope is not None and organization_object_id not in scope:
            raise PermissionError(
                "You cannot access reports for this organization."
            )

        query["organization_id"] = organization_object_id

    return query


def list_findings(user_id, filters=None):
    db = get_database()
    filters = filters or {}

    query = _build_findings_query(user_id, filters)

    try:
        limit = min(max(int(filters.get("limit", 50)), 1), 200)
        skip = max(int(filters.get("skip", 0)), 0)
    except (TypeError, ValueError):
        raise ValueError("Invalid pagination values.")

    findings = list(
        db.security_findings.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    total = db.security_findings.count_documents(query)

    return {
        "total": total,
        "limit": limit,
        "skip": skip,
        "results": [_serialize(item) for item in findings],
    }


def get_report_summary(user_id, filters=None):
    db = get_database()
    query = _build_findings_query(user_id, filters)

    findings = list(db.security_findings.find(
        query,
        {
            "severity": 1,
            "status": 1,
            "remediation_status": 1,
        },
    ))

    severity_counts = {}
    status_counts = {}
    remediation_counts = {}

    for finding in findings:
        severity = str(finding.get("severity", "unknown")).lower()
        status_value = str(finding.get("status", "unknown")).lower()
        remediation = str(
            finding.get("remediation_status", "unknown")
        ).lower()

        severity_counts[severity] = severity_counts.get(severity, 0) + 1
        status_counts[status_value] = status_counts.get(status_value, 0) + 1
        remediation_counts[remediation] = (
            remediation_counts.get(remediation, 0) + 1
        )

    return {
        "total_findings": len(findings),
        "severity": severity_counts,
        "status": status_counts,
        "remediation_status": remediation_counts,
    }


def list_remediation_actions(user_id, filters=None):
    db = get_database()
    filters = filters or {}

    scope = _report_scope(user_id)
    query = {}

    if scope is not None:
        query["organization_id"] = {"$in": scope}

    status_value = filters.get("status")
    if status_value:
        query["status"] = status_value.lower()

    try:
        limit = min(max(int(filters.get("limit", 50)), 1), 200)
        skip = max(int(filters.get("skip", 0)), 0)
    except (TypeError, ValueError):
        raise ValueError("Invalid pagination values.")

    actions = list(
        db.remediation_actions.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    return {
        "total": db.remediation_actions.count_documents(query),
        "limit": limit,
        "skip": skip,
        "results": [_serialize(item) for item in actions],
    }


def get_export_findings(user_id, filters=None):
    scope = _report_scope(user_id, "reports.export")
    filters = filters or {}

    query = {}

    if scope is not None:
        query["organization_id"] = {"$in": scope}

    severity = filters.get("severity")
    if severity:
        query["severity"] = severity.lower()

    status_value = filters.get("status")
    if status_value:
        query["status"] = status_value.lower()

    organization_id = filters.get("organization_id")
    if organization_id:
        if not ObjectId.is_valid(str(organization_id)):
            raise ValueError("Invalid organization ID.")

        organization_object_id = ObjectId(organization_id)

        if scope is not None and organization_object_id not in scope:
            raise PermissionError(
                "You cannot export this organization's findings."
            )

        query["organization_id"] = organization_object_id

    findings = list(
        get_database().security_findings.find(query).sort(
            "created_at",
            -1,
        )
    )

    return [_serialize(item) for item in findings]
