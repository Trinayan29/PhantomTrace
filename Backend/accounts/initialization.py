
from datetime import datetime, timezone

from services.mongodb import get_database


def now():
    return datetime.now(timezone.utc)


# Permission catalogue
DEFAULT_PERMISSIONS = [
    {"code": "users.create", "description": "Create users"},
    {"code": "users.read", "description": "View users"},
    {"code": "users.update", "description": "Update users"},
    {"code": "users.delete", "description": "Delete users"},

    {"code": "organizations.create", "description": "Create organizations"},
    {"code": "organizations.read", "description": "View organizations"},
    {"code": "organizations.update", "description": "Update organizations"},
    {"code": "organizations.delete", "description": "Delete organizations"},

    {"code": "identities.create", "description": "Create identities"},
    {"code": "identities.read", "description": "View identities"},
    {"code": "identities.update", "description": "Update identities"},
    {"code": "identities.delete", "description": "Delete identities"},

    {"code": "findings.read", "description": "View security findings"},
    {"code": "findings.update", "description": "Update security findings"},

    {"code": "reports.read", "description": "View reports"},
    {"code": "reports.export", "description": "Export reports"},

    {"code": "audit_logs.read", "description": "View audit logs"},

    {"code": "roles.manage", "description": "Manage roles and permissions"},
]

# Default role definitions
DEFAULT_ROLES = {
    "super_admin": {
        "description": "Full platform administration",
        "permissions": "*",
    },
    "organization_admin": {
    "description": "Manage assigned organization",
    "permissions": [
        "users.create", "users.read", "users.update",
        "organizations.read", "organizations.update",
        "identities.create", "identities.read",
        "identities.update", "identities.delete",
        "findings.read", "findings.update",
        "reports.read", "reports.export",
        "audit_logs.read",
    ],
},
    "security_analyst": {
        "description": "Security analysis and findings",
        "permissions": [
            "identities.read",
            "findings.read", "findings.update",
            "reports.read", "reports.export",
        ],
    },
    "auditor": {
        "description": "Read-only auditing and reporting",
        "permissions": [
            "users.read",
            "organizations.read",
            "identities.read",
            "findings.read",
            "reports.read",
            "audit_logs.read",
        ],
    },
    "viewer": {
        "description": "Restricted read-only access",
        "permissions": [
            "identities.read",
            "findings.read",
            "reports.read",
        ],
    },
}


def create_auth_indexes():
    db = get_database()

    db.users.create_index(
        "username",
        unique=True,
        name="unique_username"
    )

    db.users.create_index(
        "email",
        unique=True,
        name="unique_email"
    )

    db.roles.create_index(
        "name",
        unique=True,
        name="unique_role_name"
    )

    db.permissions.create_index(
        "code",
        unique=True,
        name="unique_permission_code"
    )

    db.organization_memberships.create_index(
        [("user_id", 1), ("organization_id", 1)],
        unique=True,
        name="unique_user_organization"
    )

    db.role_permissions.create_index(
        [("role_id", 1), ("permission_id", 1)],
        unique=True,
        name="unique_role_permission"
    )

    db.refresh_tokens.create_index(
        "jti",
        unique=True,
        name="unique_refresh_token_jti"
    )

    db.refresh_tokens.create_index(
        "expires_at",
        expireAfterSeconds=0,
        name="refresh_token_expiry"
    )

    db.platform_role_assignments.create_index(
    [("role_id", 1)],
    unique=True,
    partialFilterExpression={
        "is_active": True,
        "assignment_type": "global"
    },
    name="unique_active_global_platform_role"
    )


def seed_permissions():
    db = get_database()

    for permission in DEFAULT_PERMISSIONS:
        db.permissions.update_one(
            {"code": permission["code"]},
            {
                "$setOnInsert": {
                    **permission,
                    "created_at": now(),
                }
            },
            upsert=True,
        )


def seed_roles():
    db = get_database()

    for role_name, role_data in DEFAULT_ROLES.items():
        db.roles.update_one(
            {"name": role_name},
            {
                "$setOnInsert": {
                    "name": role_name,
                    "description": role_data["description"],
                    "is_system": True,
                    "created_at": now(),
                }
            },
            upsert=True,
        )


def seed_role_permissions():
    db = get_database()

    permissions = {
        permission["code"]: permission["_id"]
        for permission in db.permissions.find()
    }

    for role_name, role_data in DEFAULT_ROLES.items():
        role = db.roles.find_one({"name": role_name})

        if not role:
            continue

        if role_data["permissions"] == "*":
            assigned_permissions = list(permissions.values())
        else:
            assigned_permissions = [
                permissions[code]
                for code in role_data["permissions"]
                if code in permissions
            ]

        for permission_id in assigned_permissions:
            db.role_permissions.update_one(
                {
                    "role_id": role["_id"],
                    "permission_id": permission_id,
                },
                {
                    "$setOnInsert": {
                        "role_id": role["_id"],
                        "permission_id": permission_id,
                        "created_at": now(),
                    }
                },
                upsert=True,
            )


def initialize_auth_database():
    create_auth_indexes()
    seed_permissions()
    seed_roles()
    seed_role_permissions()
