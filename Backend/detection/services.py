from datetime import datetime, timezone

from bson import ObjectId

from services.mongodb import get_database
from accounts.services import get_user_organization_scope

from .detector import detect_suspicious_activity


def resolve_organization(user_id, organization_id=None):
    db = get_database()
    scope = get_user_organization_scope(str(user_id))

    if organization_id:
        if not ObjectId.is_valid(str(organization_id)):
            raise ValueError("Invalid organization ID.")

        selected = ObjectId(str(organization_id))

        if not db.organizations.find_one({"_id": selected}):
            raise ValueError("Organization does not exist.")

        if (
            not scope["is_super_admin"]
            and selected not in scope["organization_ids"]
        ):
            raise PermissionError(
                "You do not have access to this organization."
            )

        return selected

    if scope["is_super_admin"]:
        raise ValueError(
            "Super Admin must specify an organization ID."
        )

    organizations = scope["organization_ids"]

    if len(organizations) == 0:
        raise PermissionError(
            "No active organization membership found."
        )

    if len(organizations) > 1:
        raise ValueError(
            "Specify an organization ID."
        )

    return organizations[0]


def serialize_document(document):
    if isinstance(document, ObjectId):
        return str(document)

    if isinstance(document, datetime):
        return document.isoformat()

    if isinstance(document, dict):
        return {
            key: serialize_document(value)
            for key, value in document.items()
            if key != "_id"
        }

    if isinstance(document, list):
        return [
            serialize_document(item)
            for item in document
        ]

    return document


def create_detection_event(data, user_id):
    db = get_database()

    organization_id = resolve_organization(
        user_id,
        data.get("organization_id"),
    )

    event_type = data["event_type"]
    failed_attempts = data.get("failed_attempts", 0)
    source_ip = data.get("source_ip")

    suspicious = detect_suspicious_activity(
        event_type,
        failed_attempts,
    )

    now = datetime.now(timezone.utc)

    event = {
        "event_type": event_type,
        "source_ip": source_ip,
        "failed_attempts": failed_attempts,
        "is_suspicious": suspicious,
        "organization_id": organization_id,
        "created_by": ObjectId(str(user_id)),
        "created_at": now,
    }

    result = db.detection_events.insert_one(event)

    finding_id = None

    if suspicious:
        finding = {
            "title": f"Suspicious activity detected: {event_type}",
            "description": (
                f"Detection rule identified {event_type}. "
                f"Failed attempts: {failed_attempts}. "
                f"Source IP: {source_ip or 'Not provided'}."
            ),
            "severity": "high",
            "status": "open",
            "remediation_status": "pending",
            "organization_id": organization_id,
            "detection_event_id": result.inserted_id,
            "source_ip": source_ip,
            "event_type": event_type,
            "created_at": now,
            "updated_at": now,
        }

        finding_result = db.security_findings.insert_one(finding)
        finding_id = str(finding_result.inserted_id)

    return {
        "incident_id": str(result.inserted_id),
        "finding_id": finding_id,
        "event_type": event_type,
        "is_suspicious": suspicious,
        "message": (
            "Suspicious activity detected."
            if suspicious
            else "No suspicious activity detected."
        ),
        "created_at": now.isoformat(),
    }


def list_detection_events(user_id, organization_id=None):
    db = get_database()
    scope = get_user_organization_scope(str(user_id))

    query = {}

    if organization_id:
        if not ObjectId.is_valid(str(organization_id)):
            raise ValueError("Invalid organization ID.")

        selected = ObjectId(str(organization_id))

        if (
            not scope["is_super_admin"]
            and selected not in scope["organization_ids"]
        ):
            raise PermissionError(
                "You do not have access to this organization."
            )

        query["organization_id"] = selected

    elif not scope["is_super_admin"]:
        query["organization_id"] = {
            "$in": scope["organization_ids"]
        }

    events = list(
        db.detection_events.find(query)
        .sort("created_at", -1)
        .limit(200)
    )

    return [
        serialize_document(event)
        for event in events
    ]
