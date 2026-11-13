
from django.urls import path
from .views import AccessGraphView

urlpatterns = [
    path("", AccessGraphView.as_view(), name="access-graph"),
]
