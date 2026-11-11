
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Incident


class DetectionAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_get_api(self):
        response = self.client.get("/api/detect/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    def test_detect_suspicious_activity(self):
        response = self.client.post(
            "/api/detect/",
            {
                "event_type": "suspicious_login",
                "source_ip": "192.0.2.10",
                "failed_attempts": 5
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["is_suspicious"])
        self.assertEqual(Incident.objects.count(), 1)
