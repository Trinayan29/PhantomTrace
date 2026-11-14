from datetime import datetime, timezone

from bson import ObjectId

from services.mongodb import get_database
from accounts.services import get_user_organization_scope


def application_collection():
    return get_database()["applications"]


def serialize_application(application):
    application["id"] = str(application.pop("_id"))

    organization_id = application.get("organization_id")
    if isinstance(organization_id, ObjectId):
        application["organization_id"] = str(organization_id)

    return application


def _get_user_scope(user_id):
    return get_user_organization_scope(str(user_id))


def _build_application_filter(user_id, extra_filter=None):
    scope = _get_user_scope(user_id)

    query = {"is_deleted": False}

    if not scope["is_super_admin"]:
        query["organization_id"] = {
            "$in": scope["organization_ids"]
        }

    if extra_filter:
        query.update(extra_filter)

    return query


def _resolve_creation_organization(user_id, organization_id=None):
    db = get_database()
    scope = _get_user_scope(user_id)

    if organization_id:
        if not ObjectId.is_valid(str(organization_id)):
            raise ValueError("Invalid organization ID.")

        selected_id = ObjectId(str(organization_id))

        if not db.organizations.find_one({"_id": selected_id}):
            raise ValueError("Organization does not exist.")

        if (
            not scope["is_super_admin"]
            and selected_id not in scope["organization_ids"]
        ):
            raise ValueError(
                "You do not have access to this organization."
            )

        return selected_id

    if scope["is_super_admin"]:
        raise ValueError(
            "Super Admin must specify an organization when creating an application."
        )

    organization_ids = scope["organization_ids"]

    if len(organization_ids) == 0:
        raise ValueError(
            "You do not have an active organization membership."
        )

    if len(organization_ids) > 1:
        raise ValueError(
            "You belong to multiple organizations. Specify an organization ID."
        )

    return organization_ids[0]


def create_application(data, user_id, organization_id=None):
    selected_organization = _resolve_creation_organization(
        user_id,
        organization_id,
    )

    now = datetime.now(timezone.utc)

    application = {
        **data,
        "organization_id": selected_organization,
        "is_deleted": False,
        "created_at": now,
        "updated_at": now,
    }

    result = application_collection().insert_one(application)
    application["_id"] = result.inserted_id

    return serialize_application(application)


def list_applications(user_id):
    applications = application_collection().find(
        _build_application_filter(user_id)
    ).sort("created_at", -1)

    return [
        serialize_application(application)
        for application in applications
    ]


def get_application(application_id, user_id):
    if not ObjectId.is_valid(application_id):
        return None

    application = application_collection().find_one(
        _build_application_filter(
            user_id,
            {"_id": ObjectId(application_id)},
        )
    )

    if application is None:
        return None

    return serialize_application(application)


def update_application(application_id, data, user_id):
    if not ObjectId.is_valid(application_id):
        return None

    safe_data = dict(data)

    for protected_field in (
        "organization_id",
        "_id",
        "is_deleted",
        "created_at",
    ):
        safe_data.pop(protected_field, None)

    result = application_collection().update_one(
        _build_application_filter(
            user_id,
            {"_id": ObjectId(application_id)},
        ),
        {
            "$set": {
                **safe_data,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    if result.matched_count == 0:
        return None

    return get_application(application_id, user_id)


def delete_application(application_id, user_id):
    if not ObjectId.is_valid(application_id):
        return False

    result = application_collection().update_one(
        _build_application_filter(
            user_id,
            {"_id": ObjectId(application_id)},
        ),
        {
            "$set": {
                "is_deleted": True,
                "status": "inactive",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return result.modified_count > 0
