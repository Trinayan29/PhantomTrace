
from django.urls import path

from .views import (
    IdentityListCreateView,
    IdentityDetailView
)

urlpatterns = [
    path(
        "",
        IdentityListCreateView.as_view(),
        name="identity-list-create"
    ),
    path(
        "<str:identity_id>/",
        IdentityDetailView.as_view(),
        name="identity-detail"
    ),
]
