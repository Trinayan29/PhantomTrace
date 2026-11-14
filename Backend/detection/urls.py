from django.urls import path
from .views import DetectionEventView

urlpatterns = [
    path(
        "events/",
        DetectionEventView.as_view(),
        name="detection-events",
    ),
]
