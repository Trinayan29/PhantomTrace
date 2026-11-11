from django.urls import path
from .views import (
    SecurityEventListAPI,
    SecurityEventDetailAPI
)

urlpatterns = [
    path(
        'events/',
        SecurityEventListAPI.as_view(),
        name='security-events'
    ),

    path(
        'events/<int:pk>/',
        SecurityEventDetailAPI.as_view(),
        name='security-event-detail'
    ),
]