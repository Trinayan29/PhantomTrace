from django.urls import path
from .views import RiskEvaluateView, RiskExplainView

urlpatterns = [
    path("evaluate/", RiskEvaluateView.as_view(), name="risk-evaluate"),
    path("explain/", RiskExplainView.as_view(), name="risk-explain"),
]
