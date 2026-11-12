
from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from services.mongodb import get_database
from accounts.services import get_user_organization_scope


def identity_collection():
    return get_database()["identities"]


def serialize_identity(identity):
    identity["id"] = str(identity.pop("_id"))

    if isinstance(identity.get("organization_id"), ObjectId):
        identity["organization_id"] = str(identity["organization_id"])

    return identity


def _get_user_scope(user_id):
    """
    Resolve the organizations accessible to the authenticated user.
    """
    return get_user_organization_scope(str(user_id))


def _build_identity_filter(user_id, extra_filter=None):
    """
    Combine organization access restrictions with an identity query.
    Super Admin can access identities across all organizations.
    """
    scope = _get_user_scope(user_id)

    query = {
        "is_deleted": False
    }

    if not scope["is_super_admin"]:
        query["organization_id"] = {
            "$in": scope["organization_ids"]
        }

    if extra_filter:
        query.update(extra_filter)

    return query


def _resolve_creation_organization(user_id, organization_id=None):
    """
    Resolve and validate the organization for a new identity.

    Regular users can only select an organization where they
    have an active membership.

    Super Admin must explicitly select an existing organization.
    """
    db = get_database()
    scope = _get_user_scope(user_id)

    if organization_id:
        if not ObjectId.is_valid(str(organization_id)):
            raise ValueError("Invalid organization ID.")

        selected_id = ObjectId(str(organization_id))

        if not db.organizations.find_one({"_id": selected_id}):
            raise ValueError("Organization does not exist.")

        if not scope["is_super_admin"]:
            if selected_id not in scope["organization_ids"]:
                raise ValueError(
                    "You do not have access to this organization."
                )

        return selected_id

    if scope["is_super_admin"]:
        raise ValueError(
            "Super Admin must specify an organization when creating an identity."
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


def create_identity(data, user_id, organization_id=None):
    collection = identity_collection()

    selected_organization = _resolve_creation_organization(
        user_id,
        organization_id
    )

    now = datetime.now(timezone.utc)

    identity = {
        **data,
        "organization_id": selected_organization,
        "is_deleted": False,
        "created_at": now,
        "updated_at": now,
    }

    result = collection.insert_one(identity)

    identity["_id"] = result.inserted_id

    return serialize_identity(identity)


def list_identities(user_id):
    collection = identity_collection()

    identities = collection.find(
        _build_identity_filter(user_id)
    ).sort("created_at", -1)

    return [
        serialize_identity(identity)
        for identity in identities
    ]


def get_identity(identity_id, user_id):
    if not ObjectId.is_valid(identity_id):
        return None

    identity = identity_collection().find_one(
        _build_identity_filter(
            user_id,
            {"_id": ObjectId(identity_id)}
        )
    )

    if identity is None:
        return None

    return serialize_identity(identity)


def update_identity(identity_id, data, user_id):
    if not ObjectId.is_valid(identity_id):
        return None

    collection = identity_collection()

    # Never allow the client to move an identity between organizations.
    safe_data = dict(data)
    safe_data.pop("organization_id", None)
    safe_data.pop("_id", None)
    safe_data.pop("is_deleted", None)
    safe_data.pop("created_at", None)

    result = collection.update_one(
        _build_identity_filter(
            user_id,
            {"_id": ObjectId(identity_id)}
        ),
        {
            "$set": {
                **safe_data,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    if result.matched_count == 0:
        return None

    return get_identity(identity_id, user_id)


def delete_identity(identity_id, user_id):
    if not ObjectId.is_valid(identity_id):
        return False

    result = identity_collection().update_one(
        _build_identity_filter(
            user_id,
            {"_id": ObjectId(identity_id)}
        ),
        {
            "$set": {
                "is_deleted": True,
                "status": "inactive",
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    return result.modified_count > 0
