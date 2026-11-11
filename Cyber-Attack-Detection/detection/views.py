
from rest_framework import generics
from .models import SecurityEvent
from .serializers import SecurityEventSerializer


class SecurityEventListAPI(generics.ListAPIView):

    serializer_class = SecurityEventSerializer

    def get_queryset(self):
        queryset = SecurityEvent.objects.all().order_by('-timestamp')

        event_type = self.request.query_params.get('event_type')

        if event_type:
            queryset = queryset.filter(event_type=event_type)

        return queryset


class SecurityEventDetailAPI(generics.RetrieveAPIView):

    queryset = SecurityEvent.objects.all()

    serializer_class = SecurityEventSerializer
    from rest_framework.permissions import IsAdminUser
    permission_classes = [IsAdminUser]