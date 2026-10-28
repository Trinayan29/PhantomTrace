
"""
PhantomTrace - Member 3: AI and Risk Analysis

This module calculates transparent risk scores from supplied evidence.
It does not independently detect cyberattacks or modify user accounts.
"""

from typing import Any


def score_finding(finding: dict[str, Any]) -> dict[str, Any]:
    """Calculate a risk score from 0 to 100 for one security finding."""

    evidence: list[dict[str, Any]] = []
    recommendations: list[str] = []

    # 1. Active account belonging to a departed employee or contractor
    employment_status = str(
        finding.get("employment_status", "unknown")
    ).strip().lower()

    account_active = finding.get("account_active", False) is True

    if account_active and employment_status in {
        "departed",
        "contract_ended",
    }:
        evidence.append({
            "signal": "residual_access",
            "points": 30,
            "details": (
                "The account is active, but the employee has departed "
                "or the contractor's engagement has ended."
            ),
        })
        recommendations.append(
            "Verify the person's status and review whether the active "
            "account is still authorized."
        )

    # 2. Privilege level
    privilege_level = str(
        finding.get("privilege_level", "unknown")
    ).strip().lower()

    if privilege_level in {"admin", "superadmin"}:
        evidence.append({
            "signal": "high_privilege",
            "points": 25,
            "details": (
                f"The account has the privilege level: {privilege_level}."
            ),
        })
        recommendations.append(
            "Review whether administrative privileges are necessary "
            "and properly authorized."
        )

    elif privilege_level == "elevated":
        evidence.append({
            "signal": "elevated_privilege",
            "points": 15,
            "details": "The account has elevated privileges.",
        })
        recommendations.append(
            "Confirm that the elevated permissions match the person's role."
        )

    # 3. Sensitivity of accessible resources
    sensitivity = str(
        finding.get("resource_sensitivity", "unknown")
    ).strip().lower()

    sensitivity_points = {
        "low": 0,
        "medium": 8,
        "high": 15,
        "critical": 20,
    }

    points = sensitivity_points.get(sensitivity, 0)

    if points > 0:
        evidence.append({
            "signal": "resource_sensitivity",
            "points": points,
            "details": (
                f"The accessible resource has {sensitivity} sensitivity."
            ),
        })
        recommendations.append(
            "Confirm that access to this resource is appropriate "
            "for the person's responsibilities."
        )

    # 4. Missing account ownership
    if finding.get("owner_known") is False:
        evidence.append({
            "signal": "unknown_owner",
            "points": 10,
            "details": "The account's owner is not known.",
        })
        recommendations.append(
            "Identify the account owner and document its business purpose."
        )

    # 5. Suspicious-activity signals supplied by Member 4's module
    suspicious_activity = finding.get("suspicious_activity", False)

    if suspicious_activity is True or (
        isinstance(suspicious_activity, list)
        and len(suspicious_activity) > 0
    ):
        if isinstance(suspicious_activity, list):
            details = (
                "The detection module supplied these signals: "
                + ", ".join(str(signal) for signal in suspicious_activity)
                + "."
            )
        else:
            details = (
                "The detection module flagged suspicious activity."
            )

        evidence.append({
            "signal": "suspicious_activity",
            "points": 15,
            "details": details,
        })
        recommendations.append(
            "Review the supporting activity records before deciding "
            "whether further action is necessary."
        )

    # Sum the evidence-based points, capped at 100
    score = min(
        sum(item["points"] for item in evidence),
        100,
    )

    # Convert the score into a risk category
    if score >= 75:
        level = "Critical"
    elif score >= 50:
        level = "High"
    elif score >= 25:
        level = "Medium"
    else:
        level = "Low"

    return {
        "score": score,
        "level": level,
        "evidence": evidence,
        "recommendations": recommendations,
        "disclaimer": (
            "This score is a rule-based estimate for investigation, "
            "not proof of an attack or a guarantee of security."
        ),
    }
