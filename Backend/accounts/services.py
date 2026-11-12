
import hashlib
import uuid
from datetime import datetime, timezone, timedelta

import jwt

from pymongo import ReturnDocument
from bson import ObjectId
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password

from services.mongodb import get_database


def current_timestamp():
    return datetime.now(timezone.utc)


def serialize_user(user):
    if not user:
        return None

    return {
        "id": str(user["_id"]),
        "full_name": user["full_name"],
        "username": user["username"],
        "email": user["email"],
        "is_active": user["is_active"],
        "is_verified": user["is_verified"],
        "created_at": user["created_at"].isoformat(),
        "last_login": (
            user["last_login"].isoformat()
            if user.get("last_login") else None
        ),
    }


# ---------------- USER MANAGEMENT ----------------

def create_user(full_name, username, email, password):
    db = get_database()

    username = username.strip().lower()
    email = email.strip().lower()

    user = {
        "full_name": full_name.strip(),
        "username": username,
        "email": email,
        "password_hash": make_password(password),
        "is_active": True,
        "is_verified": False,
        "token_version": 0,
        "created_at": current_timestamp(),
        "updated_at": current_timestamp(),
        "last_login": None,
    }

    result = db.users.insert_one(user)
    user["_id"] = result.inserted_id

    return serialize_user(user)


def get_user_by_identifier(identifier):
    db = get_database()
    identifier = identifier.strip().lower()

    return db.users.find_one({
        "$or": [
            {"email": identifier},
            {"username": identifier},
        ]
    })


def authenticate_user(identifier, password):
    user = get_user_by_identifier(identifier)

    if not user or not user.get("is_active", False):
        return None

    if not check_password(password, user["password_hash"]):
        return None

    db = get_database()

    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": current_timestamp()}}
    )

    user["last_login"] = current_timestamp()

    return serialize_user(user)


# ---------------- ACCESS TOKEN ----------------

def generate_access_token(user_id):
    db = get_database()

    user = db.users.find_one({
        "_id": ObjectId(user_id)
    })

    if not user or not user.get("is_active", False):
        raise ValueError("Active user not found.")

    now = current_timestamp()

    payload = {
        "sub": str(user["_id"]),
        "jti": str(uuid.uuid4()),
        "token_version": user.get("token_version", 0),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=30),
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )


# ---------------- REFRESH TOKEN ----------------

def hash_refresh_token(token):
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def generate_refresh_token(user_id):
    db = get_database()

    user = db.users.find_one({
        "_id": ObjectId(user_id)
    })

    if not user or not user.get("is_active", False):
        raise ValueError("Active user not found.")

    now = current_timestamp()
    expires_at = now + timedelta(days=7)
    jti = str(uuid.uuid4())

    payload = {
        "sub": str(user["_id"]),
        "jti": jti,
        "token_version": user.get("token_version", 0),
        "type": "refresh",
        "iat": now,
        "exp": expires_at,
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )

    db.refresh_tokens.insert_one({
        "user_id": user["_id"],
        "jti": jti,
        "token_hash": hash_refresh_token(token),
        "expires_at": expires_at,
        "is_revoked": False,
        "created_at": now,
    })

    return token


def issue_token_pair(user_id):
    return {
        "access": generate_access_token(user_id),
        "refresh": generate_refresh_token(user_id),
    }

def rotate_refresh_token(refresh_token):
    try:
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
            options={
                "require": [
                    "sub", "jti", "type",
                    "iat", "exp", "token_version"
                ]
            }
        )
    except jwt.ExpiredSignatureError:
        raise ValueError("Refresh token has expired.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid refresh token.")

    if payload.get("type") != "refresh":
        raise ValueError("Invalid token type.")

    user_id = payload["sub"]

    if not ObjectId.is_valid(user_id):
        raise ValueError("Invalid user identifier.")

    db = get_database()
    user_object_id = ObjectId(user_id)

    user = db.users.find_one({
        "_id": user_object_id,
        "is_active": True
    })

    if not user:
        raise ValueError("User not found or inactive.")

    if payload.get("token_version") != user.get(
        "token_version", 0
    ):
        raise ValueError("Refresh token has been revoked.")

    now = current_timestamp()

    # Atomic update prevents the same refresh token
    # from being successfully rotated twice.
    old_token = db.refresh_tokens.find_one_and_update(
        {
            "user_id": user_object_id,
            "jti": payload["jti"],
            "token_hash": hash_refresh_token(refresh_token),
            "is_revoked": False,
            "expires_at": {"$gt": now},
        },
        {
            "$set": {
                "is_revoked": True,
                "revoked_at": now,
            }
        },
        return_document=ReturnDocument.BEFORE
    )

    if old_token is None:
        raise ValueError(
            "Refresh token is invalid, revoked, or already used."
        )

    return issue_token_pair(user_id)


def revoke_refresh_token(refresh_token):
    try:
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
            options={
                "require": [
                    "sub", "jti", "type",
                    "iat", "exp", "token_version"
                ]
            }
        )
    except jwt.InvalidTokenError as error:
        raise ValueError("Invalid or expired refresh token.") from error

    if payload.get("type") != "refresh":
        raise ValueError("Invalid token type.")

    user_id = payload.get("sub")

    if not ObjectId.is_valid(user_id):
        raise ValueError("Invalid user identifier.")

    db = get_database()

    result = db.refresh_tokens.update_one(
        {
            "user_id": ObjectId(user_id),
            "jti": payload["jti"],
            "token_hash": hash_refresh_token(refresh_token),
            "is_revoked": False,
            "expires_at": {"$gt": current_timestamp()},
        },
        {
            "$set": {
                "is_revoked": True,
                "revoked_at": current_timestamp(),
            }
        }
    )

    return result.modified_count == 1



def get_user_access_context(user_id):
    """
    Return active organization memberships and global roles.
    """
    if not ObjectId.is_valid(str(user_id)):
        raise ValueError("Invalid user ID.")

    db = get_database()
    user_object_id = ObjectId(str(user_id))

    user = db.users.find_one({
        "_id": user_object_id,
        "is_active": True
    })

    if not user:
        raise ValueError("User not found or inactive.")

    access_context = []

    super_admin_role = db.roles.find_one({
        "name": "super_admin"
    })

    if super_admin_role:
        global_assignment = db.platform_role_assignments.find_one({
            "user_id": user_object_id,
            "role_id": super_admin_role["_id"],
            "is_active": True
        })

        if global_assignment:
            access_context.append({
                "organization_id": None,
                "role": "super_admin",
                "permissions": ["*"],
                "assignment_type": "global"
            })

    memberships = db.organization_memberships.find({
        "user_id": user_object_id,
        "is_active": True
    })

    for membership in memberships:
        role = db.roles.find_one({
            "_id": membership["role_id"]
        })

        if not role:
            continue

        role_permission_records = list(
            db.role_permissions.find({
                "role_id": role["_id"]
            })
        )

        permission_ids = [
            item["permission_id"]
            for item in role_permission_records
        ]

        permission_documents = list(
            db.permissions.find({
                "_id": {"$in": permission_ids}
            })
        )

        permission_codes = [
            permission["code"]
            for permission in permission_documents
        ]

        organization_id = membership.get("organization_id")

        access_context.append({
            "organization_id": (
                str(organization_id)
                if organization_id else None
            ),
            "role": role["name"],
            "permissions": permission_codes,
            "assignment_type": "organization"
        })

    return access_context


def get_user_roles_and_permissions(user_id):
    """
    Return consolidated roles and permissions.
    """
    memberships = get_user_access_context(user_id)

    roles = sorted({
        membership["role"]
        for membership in memberships
    })

    permissions = sorted({
        permission
        for membership in memberships
        for permission in membership["permissions"]
    })

    is_super_admin = any(
        membership["role"] == "super_admin"
        and membership["assignment_type"] == "global"
        for membership in memberships
    )

    return {
        "roles": roles,
        "permissions": permissions,
        "is_super_admin": is_super_admin,
        "memberships": memberships
    }


def get_user_organization_scope(user_id):
    """
    Return organizations accessible to a user.
    """
    if not ObjectId.is_valid(str(user_id)):
        raise ValueError("Invalid user ID.")

    db = get_database()
    user_object_id = ObjectId(str(user_id))

    user = db.users.find_one({
        "_id": user_object_id,
        "is_active": True
    })

    if not user:
        raise ValueError("User not found or inactive.")

    super_admin_role = db.roles.find_one({
        "name": "super_admin"
    })

    if super_admin_role:
        global_assignment = db.platform_role_assignments.find_one({
            "user_id": user_object_id,
            "role_id": super_admin_role["_id"],
            "is_active": True
        })

        if global_assignment:
            return {
                "is_super_admin": True,
                "organization_ids": []
            }

    memberships = db.organization_memberships.find({
        "user_id": user_object_id,
        "is_active": True
    })

    organization_ids = []

    for membership in memberships:
        organization_id = membership.get("organization_id")

        if not organization_id:
            continue

        role = db.roles.find_one({
            "_id": membership["role_id"]
        })

        if not role:
            continue

        if role.get("name") == "super_admin":
            continue

        if organization_id not in organization_ids:
            organization_ids.append(organization_id)

    return {
        "is_super_admin": False,
        "organization_ids": organization_ids
    }


def build_organization_filter(user_id, field="organization_id"):
    """
    Build a MongoDB organization filter.
    """
    scope = get_user_organization_scope(user_id)

    if scope["is_super_admin"]:
        return {}

    return {
        field: {
            "$in": scope["organization_ids"]
        }
    }
