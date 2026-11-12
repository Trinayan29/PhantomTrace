
from django.contrib import admin
from django.urls import path, include
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication
    path(
        "api/v1/auth/login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),
    path(
        "api/v1/auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    # Identity Management
    path(
        "api/v1/identities/",
        include("identities.urls")
    ),

    # API Documentation
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema"
    ),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui"
    ),
    path("api/v1/auth/", include("accounts.urls")),
    # Identity Management
    path(
        "api/v1/identities/",
        include("identities.urls")
    ),
    # Organization Management
    path(
        "api/v1/organizations/",
        include("access_control.urls")
    ),
    
]
