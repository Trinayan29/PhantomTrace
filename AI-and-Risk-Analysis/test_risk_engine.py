
import unittest

from risk_engine import score_finding


class RiskEngineTests(unittest.TestCase):

    def test_critical_residual_access(self):
        finding = {
            "employment_status": "departed",
            "account_active": True,
            "privilege_level": "admin",
            "resource_sensitivity": "critical",
            "owner_known": False,
        }

        result = score_finding(finding)

        self.assertEqual(result["score"], 85)
        self.assertEqual(result["level"], "Critical")

    def test_empty_finding_has_zero_score(self):
        result = score_finding({})

        self.assertEqual(result["score"], 0)
        self.assertEqual(result["level"], "Low")

    def test_active_departed_employee_scores_30(self):
        finding = {
            "employment_status": "departed",
            "account_active": True,
        }

        result = score_finding(finding)

        self.assertEqual(result["score"], 30)
        self.assertEqual(result["level"], "Medium")

    def test_suspicious_activity_is_recorded(self):
        finding = {
            "suspicious_activity": ["repeated_failed_logins"],
        }

        result = score_finding(finding)

        self.assertEqual(result["score"], 15)
        self.assertEqual(result["level"], "Low")
        self.assertTrue(
            any(
                item["signal"] == "suspicious_activity"
                for item in result["evidence"]
            )
        )

    def test_unknown_owner_adds_evidence(self):
        result = score_finding({"owner_known": False})

        self.assertEqual(result["score"], 10)
        self.assertEqual(result["level"], "Low")
        self.assertTrue(
            any(
                item["signal"] == "unknown_owner"
                for item in result["evidence"]
            )
        )
    def test_invalid_input_raises_type_error(self):
        invalid_inputs = [None, [], "invalid"]

        for finding in invalid_inputs:
            with self.subTest(finding=finding):
                with self.assertRaises(TypeError):
                    score_finding(finding)    

    def test_invalid_field_types_raise_type_error(self):
        invalid_findings = [
            {"employment_status": 123},
            {"privilege_level": 25},
            {"account_active": "yes"},
            {"owner_known": "false"},
            {"suspicious_activity": ["failed_login", 123]},
            {"suspicious_activity": "failed_login"},
        ]

        for finding in invalid_findings:
            with self.subTest(finding=finding):
                with self.assertRaises(TypeError):
                    score_finding(finding)
                    
if __name__ == "__main__":
    unittest.main()
