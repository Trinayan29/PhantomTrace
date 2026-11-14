from django.urls import path

from .views import (
    ApplicationListCreateView,
    ApplicationDetailView,
)

urlpatterns = [
    path(
        "",
        ApplicationListCreateView.as_view(),
        name="application-list-create",
    ),
    path(
        "<str:application_id>/",
        ApplicationDetailView.as_view(),
        name="application-detail",
    ),
]
