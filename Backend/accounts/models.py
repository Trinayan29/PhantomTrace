from django.db import models
from datetime import datetime, timezone


AUTH_COLLECTIONS = {
    "users": {
        "unique_indexes": [
            ("username", 1),
            ("email", 1),
        ]
    },
    "organizations": {},
    "roles": {
        "unique_indexes": [("name", 1)]
    },
    "permissions": {
        "unique_indexes": [("code", 1)]
    },
    "organization_memberships": {
        "unique_indexes": [
            ("user_id", 1),
            ("organization_id", 1),
        ]
    },
    "role_permissions": {
        "unique_indexes": [
            ("role_id", 1),
            ("permission_id", 1),
        ]
    },
    "refresh_tokens": {
        "unique_indexes": [("jti", 1)]
    },
}


DEFAULT_ROLES = [
    "super_admin",
    "organization_admin",
    "security_analyst",
    "auditor",
    "viewer",
]


def current_timestamp():
    return datetime.now(timezone.utc)


