import sys
from pathlib import Path

from django.conf import settings


AI_MODULE_PATH = (
    Path(settings.BASE_DIR).parent / "AI-and-Risk-Analysis"
)

if not AI_MODULE_PATH.is_dir():
    raise ImportError(
        f"AI module directory not found: {AI_MODULE_PATH}"
    )

module_path = str(AI_MODULE_PATH)

if module_path not in sys.path:
    sys.path.insert(0, module_path)


from risk_engine import score_finding
from security_assistant import explain_finding


def evaluate_finding(finding):
    risk = score_finding(finding)
    explanation = explain_finding(finding)

    return {
        "risk": risk,
        "assistant": explanation,
    }
