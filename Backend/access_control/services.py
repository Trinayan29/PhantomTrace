
from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError, PyMongoError

from services.mongodb import get_database
from accounts.services import (
    get_user_access_context,
    get_user_organization_scope,
)


def now():
    return datetime.now(timezone.utc)


def serialize_organization(organization):
    if not organization:
        return None

    organization["id"] = str(organization.pop("_id"))

    return organization


def _validate_object_id(value, field_name="ID"):
    if not ObjectId.is_valid(str(value)):
        raise ValueError(f"Invalid {field_name}.")

    return ObjectId(str(value))


def _get_active_user(user_id):
    db = get_database()
    user_object_id = _validate_object_id(user_id, "user ID")

    user = db.users.find_one({
        "_id": user_object_id,
        "is_active": True,
    })

    if not user:
        raise ValueError("User not found or inactive.")

    return user


def _get_user_membership(user_id, organization_id):
    db = get_database()

    return db.organization_memberships.find_one({
        "user_id": _validate_object_id(user_id, "user ID"),
        "organization_id": _validate_object_id(
            organization_id,
            "organization ID",
        ),
        "is_active": True,
    })

def _is_global_super_admin(user_id):
    contexts = get_user_access_context(user_id)

    return any(
        context["assignment_type"] == "global"
        and context["role"] == "super_admin"
        for context in contexts
    )
def _is_organization_admin_membership(membership):
    db = get_database()

    role = db.roles.find_one({
        "_id": membership["role_id"],
    })

    return bool(
        role and role.get("name") == "organization_admin"
    )
def _has_permission(user_id, permission, organization_id=None):
    """
    Check global or organization-specific permissions.
    """
    contexts = get_user_access_context(user_id)

    for context in contexts:
        if (
            context["assignment_type"] == "global"
            and context["role"] == "super_admin"
        ):
            return True

        if context["assignment_type"] != "organization":
            continue

        if organization_id is not None:
            if context["organization_id"] != str(organization_id):
                continue

        if permission in context["permissions"]:
            return True

    return False


def create_organization(user_id, data):
    """
    Create an organization.
    Only a global Super Admin may create organizations.
    """
    db = get_database()
    _get_active_user(user_id)

    if not _has_permission(user_id, "organizations.create"):
        raise PermissionError(
            "Only a Super Admin can create organizations."
        )

    name = str(data.get("name", "")).strip()

    if not name:
        raise ValueError("Organization name is required.")

    existing = db.organizations.find_one({
        "name": {
            "$regex": f"^{__import__('re').escape(name)}$",
            "$options": "i",
        },
        "is_deleted": {"$ne": True},
    })

    if existing:
        raise ValueError("An organization with this name already exists.")

    organization = {
        "name": name,
        "description": str(data.get("description", "")).strip(),
        "industry": str(data.get("industry", "")).strip(),
        "is_active": True,
        "is_deleted": False,
        "created_by": _validate_object_id(user_id, "user ID"),
        "created_at": now(),
        "updated_at": now(),
    }

    try:
        result = db.organizations.insert_one(organization)
    except DuplicateKeyError:
        raise ValueError("Organization already exists.")

    organization["_id"] = result.inserted_id

    return serialize_organization(organization)


def list_organizations(user_id):
    """
    List organizations visible to the current user.
    """
    db = get_database()
    _get_active_user(user_id)

    scope = get_user_organization_scope(user_id)

    query = {
        "is_active": True,
        "is_deleted": {"$ne": True},
    }

    if not scope["is_super_admin"]:
        query["_id"] = {
            "$in": scope["organization_ids"]
        }

    organizations = db.organizations.find(query).sort(
        "created_at",
        -1,
    )

    return [
        serialize_organization(organization)
        for organization in organizations
    ]


def get_organization(user_id, organization_id):
    """
    Retrieve one organization within the user's access scope.
    """
    db = get_database()
    _get_active_user(user_id)

    organization_object_id = _validate_object_id(
        organization_id,
        "organization ID",
    )

    scope = get_user_organization_scope(user_id)

    query = {
        "_id": organization_object_id,
        "is_active": True,
        "is_deleted": {"$ne": True},
    }

    if not scope["is_super_admin"]:
        if organization_object_id not in scope["organization_ids"]:
            raise PermissionError(
                "You do not have access to this organization."
            )

    organization = db.organizations.find_one(query)

    if not organization:
        raise ValueError("Organization not found.")

    return serialize_organization(organization)


def update_organization(user_id, organization_id, data):
    """
    Update an organization.
    Super Admin can update any organization.
    Organization Admin can update assigned organizations.
    """
    db = get_database()

    organization = get_organization(
        user_id,
        organization_id,
    )

    allowed_fields = {
        "name",
        "description",
        "industry",
    }

    updates = {
        key: value.strip() if isinstance(value, str) else value
        for key, value in data.items()
        if key in allowed_fields
    }

    if not updates:
        raise ValueError("No valid organization fields supplied.")

    if not _has_permission(
        user_id,
        "organizations.update",
        organization_id,
    ):
        raise PermissionError(
            "You do not have permission to update this organization."
        )

    if "name" in updates and not updates["name"]:
        raise ValueError("Organization name cannot be empty.")

    if "name" in updates:
        duplicate = db.organizations.find_one({
            "_id": {"$ne": _validate_object_id(organization_id)},
            "name": {
                "$regex": f"^{__import__('re').escape(updates['name'])}$",
                "$options": "i",
            },
            "is_deleted": {"$ne": True},
        })

        if duplicate:
            raise ValueError("Organization name already exists.")

    db.organizations.update_one(
        {"_id": _validate_object_id(organization_id)},
        {
            "$set": {
                **updates,
                "updated_at": now(),
            }
        },
    )

    return get_organization(user_id, organization_id)


def deactivate_organization(user_id, organization_id):
    """
    Soft-delete an organization.
    Only a global Super Admin may deactivate organizations.
    """
    db = get_database()
    _get_active_user(user_id)

    if not _has_permission(user_id, "organizations.delete"):
        raise PermissionError(
            "Only a Super Admin can deactivate organizations."
        )

    organization_object_id = _validate_object_id(
        organization_id,
        "organization ID",
    )

    result = db.organizations.update_one(
        {
            "_id": organization_object_id,
            "is_active": True,
            "is_deleted": {"$ne": True},
        },
        {
            "$set": {
                "is_active": False,
                "is_deleted": True,
                "updated_at": now(),
            }
        },
    )

    if result.modified_count != 1:
        raise ValueError("Organization not found or already inactive.")

    return True


def add_organization_member(
    user_id,
    organization_id,
    member_user_id,
    role_name,
):
    """
    Assign an existing platform user to an organization.

    Only Super Admin or an Organization Admin with users.create
    permission in the target organization may add members.
    """
    db = get_database()

    _get_active_user(user_id)

    organization_object_id = _validate_object_id(
        organization_id,
        "organization ID",
    )

    member_object_id = _validate_object_id(
        member_user_id,
        "member user ID",
    )

    organization = db.organizations.find_one({
        "_id": organization_object_id,
        "is_active": True,
        "is_deleted": {"$ne": True},
    })

    if not organization:
        raise ValueError("Organization not found or inactive.")

    if not _has_permission(
        user_id,
        "users.create",
        organization_id,
    ):
        raise PermissionError(
            "You cannot add members to this organization."
        )

    member = db.users.find_one({
        "_id": member_object_id,
        "is_active": True,
    })

    if not member:
        raise ValueError("Member user not found or inactive.")

    if role_name == "super_admin":
        raise PermissionError(
            "Super Admin cannot be assigned through organization membership."
        )
    if (
    role_name == "organization_admin"
    and not _is_global_super_admin(user_id)
    ):
        raise PermissionError(
        "Only a Super Admin can assign the Organization Admin role."
    )

    role = db.roles.find_one({
        "name": role_name,
    })

    if not role:
        raise ValueError("Invalid role.")

    if role_name not in {
        "organization_admin",
        "security_analyst",
        "auditor",
        "viewer",
    }:
        raise ValueError("Unsupported organization role.")

    membership = {
        "user_id": member_object_id,
        "organization_id": organization_object_id,
        "role_id": role["_id"],
        "is_active": True,
        "created_by": _validate_object_id(user_id, "user ID"),
        "created_at": now(),
        "updated_at": now(),
    }

    try:
        result = db.organization_memberships.insert_one(membership)
    except DuplicateKeyError:
        raise ValueError(
            "This user already has a membership in this organization."
        )

    membership["_id"] = result.inserted_id

    return {
        "id": str(membership["_id"]),
        "user_id": str(member_object_id),
        "organization_id": str(organization_object_id),
        "role": role_name,
        "is_active": True,
    }

def list_organization_members(user_id, organization_id):
    """
    List active members of an organization.
    """
    db = get_database()
    _get_active_user(user_id)

    get_organization(user_id, organization_id)

    if not _has_permission(
        user_id,
        "users.read",
        organization_id,
    ):
        raise PermissionError(
            "You cannot view members of this organization."
        )

    organization_object_id = _validate_object_id(
        organization_id,
        "organization ID",
    )

    memberships = db.organization_memberships.find({
        "organization_id": organization_object_id,
        "is_active": True,
    })

    results = []

    for membership in memberships:
        member = db.users.find_one({
            "_id": membership["user_id"],
            "is_active": True,
        })

        role = db.roles.find_one({
            "_id": membership["role_id"],
        })

        if not member or not role:
            continue

        results.append({
            "id": str(membership["_id"]),
            "user_id": str(member["_id"]),
            "full_name": member.get("full_name", ""),
            "username": member.get("username", ""),
            "email": member.get("email", ""),
            "role": role["name"],
            "is_active": membership["is_active"],
            "created_at": membership.get("created_at"),
        })

    return results


def update_organization_member_role(
    user_id,
    organization_id,
    member_user_id,
    role_name,
):
    """
    Change a member's role within an organization.
    """
    db = get_database()
    _get_active_user(user_id)

    get_organization(user_id, organization_id)

    if not _has_permission(
        user_id,
        "users.update",
        organization_id,
    ):
        raise PermissionError(
            "You cannot update members in this organization."
        )

    if role_name == "super_admin":
        raise PermissionError(
            "Super Admin cannot be assigned through organization membership."
        )

    if (
        role_name == "organization_admin"
        and not _is_global_super_admin(user_id)
    ):
        raise PermissionError(
            "Only a Super Admin can assign the Organization Admin role."
        )

    allowed_roles = {
        "organization_admin",
        "security_analyst",
        "auditor",
        "viewer",
    }

    if role_name not in allowed_roles:
        raise ValueError("Unsupported organization role.")

    organization_object_id = _validate_object_id(
        organization_id,
        "organization ID",
    )

    member_object_id = _validate_object_id(
        member_user_id,
        "member user ID",
    )

    membership = db.organization_memberships.find_one({
        "user_id": member_object_id,
        "organization_id": organization_object_id,
        "is_active": True,
    })

    if not membership:
        raise ValueError("Active organization membership not found.")
    if (
    _is_organization_admin_membership(membership)
    and not _is_global_super_admin(user_id)
    ):
        raise PermissionError(
        "Only a Super Admin can modify an Organization Admin membership."
    )

    role = db.roles.find_one({
        "name": role_name,
    })

    if not role:
        raise ValueError("Role not found.")

    db.organization_memberships.update_one(
        {"_id": membership["_id"]},
        {
            "$set": {
                "role_id": role["_id"],
                "updated_at": now(),
                "updated_by": _validate_object_id(
                    user_id,
                    "user ID",
                ),
            }
        },
    )

    return {
        "id": str(membership["_id"]),
        "user_id": str(member_object_id),
        "organization_id": str(organization_object_id),
        "role": role_name,
        "is_active": True,
    }


def deactivate_organization_member(
    user_id,
    organization_id,
    member_user_id,
):
    """
    Deactivate a user's membership in an organization.
    Does not deactivate the platform user account.
    """
    db = get_database()
    _get_active_user(user_id)

    get_organization(user_id, organization_id)

    if not _has_permission(
        user_id,
        "users.update",
        organization_id,
    ):
        raise PermissionError(
            "You cannot remove members from this organization."
        )

    organization_object_id = _validate_object_id(
        organization_id,
        "organization ID",
    )

    member_object_id = _validate_object_id(
        member_user_id,
        "member user ID",
    )

    membership = db.organization_memberships.find_one({
        "user_id": member_object_id,
        "organization_id": organization_object_id,
        "is_active": True,
    })

    if not membership:
        raise ValueError("Active organization membership not found.")
    if (
    _is_organization_admin_membership(membership)
    and not _is_global_super_admin(user_id)
    ):
        raise PermissionError(
        "Only a Super Admin can deactivate an Organization Admin membership."
    )

    result = db.organization_memberships.update_one(
        {"_id": membership["_id"]},
        {
            "$set": {
                "is_active": False,
                "updated_at": now(),
                "updated_by": _validate_object_id(
                    user_id,
                    "user ID",
                ),
            }
        },
    )

    if result.modified_count != 1:
        raise ValueError("Membership could not be deactivated.")

    return True
