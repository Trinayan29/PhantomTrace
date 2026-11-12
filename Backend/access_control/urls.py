
from django.urls import path

from .views import (
    OrganizationListCreateView,
    OrganizationDetailView,
    OrganizationMembersView,
    OrganizationMemberDetailView,
)


urlpatterns = [
    path(
        "",
        OrganizationListCreateView.as_view(),
        name="organization-list-create",
    ),
    path(
        "<str:organization_id>/",
        OrganizationDetailView.as_view(),
        name="organization-detail",
    ),
    path(
    "<str:organization_id>/members/",
    OrganizationMembersView.as_view(),
    name="organization-members",
    ),
    path(
    "<str:organization_id>/members/<str:member_user_id>/",
    OrganizationMemberDetailView.as_view(),
    name="organization-member-detail",
    ),
]
