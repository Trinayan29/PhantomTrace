
from pymongo.errors import PyMongoError
from rest_framework.permissions import BasePermission

from .services import (
    get_user_access_context,
    get_user_roles_and_permissions,
)


def get_authenticated_user(request):
    user = getattr(request, "user", None)

    if not user or not user.is_authenticated:
        return None

    return user


def get_requested_organization_id(request, view):
    """
    Resolve the organization context from the URL, query parameters,
    or request body.

    The resulting ID is only a selection. Membership verification
    must still happen before granting access.
    """
    kwargs = getattr(view, "kwargs", {})

    organization_id = (
        kwargs.get("organization_id")
        or kwargs.get("org_id")
        or request.query_params.get("organization_id")
        or request.data.get("organization_id")
    )

    return str(organization_id) if organization_id else None


def get_user_organization_memberships(user_id):
    """
    Retrieve the authenticated user's active organization roles.
    """
    memberships = get_user_access_context(str(user_id))

    return [
        membership
        for membership in memberships
        if membership["assignment_type"] == "organization"
    ]


class HasPermission(BasePermission):
    """
    Check a permission globally for Super Admin or within
    the relevant organization for other users.
    """

    required_permission = None

    def has_permission(self, request, view):
        user = get_authenticated_user(request)

        if user is None:
            return False

        required = (
            getattr(view, "required_permission", None)
            or self.required_permission
        )

        if not required:
            return False

        try:
            access = get_user_roles_and_permissions(user.id)

            if access["is_super_admin"]:
                return True

            memberships = get_user_organization_memberships(user.id)

            organization_id = get_requested_organization_id(
                request,
                view
            )

            if organization_id:
                memberships = [
                    membership
                    for membership in memberships
                    if membership["organization_id"] == organization_id
                ]

            return any(
                required in membership["permissions"]
                for membership in memberships
            )

        except (PyMongoError, ValueError):
            # Fail closed if authorization data cannot be verified.
            return False


class IsSuperAdmin(BasePermission):
    """
    Allow only users with an active global Super Admin assignment.
    """

    def has_permission(self, request, view):
        user = get_authenticated_user(request)

        if user is None:
            return False

        try:
            access = get_user_roles_and_permissions(user.id)
            return access["is_super_admin"]

        except (PyMongoError, ValueError):
            return False


class IsOrganizationAdmin(BasePermission):
    """
    Allow users with an Organization Admin role in the
    requested organization.

    If no organization is specified, any active organization
    membership with this role is sufficient for this role check.
    """

    def has_permission(self, request, view):
        user = get_authenticated_user(request)

        if user is None:
            return False

        try:
            memberships = get_user_organization_memberships(user.id)

            organization_id = get_requested_organization_id(
                request,
                view
            )

            if organization_id:
                memberships = [
                    membership
                    for membership in memberships
                    if membership["organization_id"] == organization_id
                ]

            return any(
                membership["role"] == "organization_admin"
                for membership in memberships
            )

        except (PyMongoError, ValueError):
            return False
