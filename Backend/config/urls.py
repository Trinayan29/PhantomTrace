
from django.contrib import admin
from django.urls import path, include

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication (custom MongoDB JWT)
    path("api/v1/auth/", include("accounts.urls")),

    # Identity Management
    path("api/v1/identities/", include("identities.urls")),

    # Organization Management
    path("api/v1/organizations/", include("access_control.urls")),

    # Access Graph
    path("api/v1/graph/", include("graph_engine.urls")),

    # Security Reports
    path("api/v1/reports/", include("reports.urls")),

    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
