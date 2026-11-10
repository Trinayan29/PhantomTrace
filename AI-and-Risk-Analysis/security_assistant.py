
"""
PhantomTrace - Member 3: AI Security Assistant

Generates explanations and recommendations from the risk engine.
This initial version uses rules, not an external AI model.
"""

from typing import Any

from risk_engine import score_finding


def explain_finding(finding: dict[str, Any]) -> dict[str, Any]:
    """Explain a security finding using the available evidence."""

    result = score_finding(finding)

    score = result["score"]
    level = result["level"]
    evidence = result["evidence"]
    recommendations = result["recommendations"]

    if evidence:
        summary = (
            f"This finding has a {level.lower()} risk rating "
            f"with a score of {score}/100. "
            f"The rating is based on {len(evidence)} "
            f"evidence signal(s) identified by the configured rules."
        )
    else:
        summary = (
            "The current rules did not identify any risk signals "
            "in the supplied information. This does not prove that "
            "the account is safe. Relevant information may be missing "
            "or some risks may not be covered by the current rules."
        )

    evidence_explanations = [
        {
            "signal": item["signal"],
            "points": item["points"],
            "details": item["details"],
        }
        for item in evidence
    ]

    return {
        "summary": summary,
        "risk_score": score,
        "risk_level": level,
        "evidence": evidence_explanations,
        "recommendations": recommendations,
        "assistant_type": "rule_based",
        "disclaimer": (
            "This explanation uses only the supplied information "
            "and configured rules. A risk rating does not confirm "
            "a cyberattack. An authorized administrator should "
            "review the evidence before taking action."
        ),
    }
