import unittest

from security_assistant import explain_finding


class SecurityAssistantTests(unittest.TestCase):

    def test_critical_finding_is_explained(self):
        finding = {
            "employment_status": "departed",
            "account_active": True,
            "privilege_level": "admin",
            "resource_sensitivity": "critical",
            "owner_known": False,
        }

        result = explain_finding(finding)

        self.assertEqual(result["risk_score"], 85)
        self.assertEqual(result["risk_level"], "Critical")
        self.assertIn("85/100", result["summary"])

    def test_evidence_is_included(self):
        finding = {
            "employment_status": "departed",
            "account_active": True,
        }

        result = explain_finding(finding)

        signals = [
            item["signal"] for item in result["evidence"]
        ]

        self.assertIn("residual_access", signals)

    def test_recommendations_are_provided(self):
        finding = {
            "employment_status": "departed",
            "account_active": True,
        }

        result = explain_finding(finding)

        self.assertGreater(len(result["recommendations"]), 0)

    def test_empty_finding_does_not_claim_account_is_safe(self):
        result = explain_finding({})

        self.assertEqual(result["risk_score"], 0)
        self.assertIn("does not prove", result["summary"])

    def test_disclaimer_is_present(self):
        result = explain_finding({})

        self.assertIn("does not confirm", result["disclaimer"])
        self.assertEqual(result["assistant_type"], "rule_based")


if __name__ == "__main__":
    unittest.main()