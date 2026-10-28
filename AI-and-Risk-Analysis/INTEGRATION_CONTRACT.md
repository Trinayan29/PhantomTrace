
# PhantomTrace — Member 3 Integration Contract

## 1. Purpose

This document defines the current interface for Member 3's AI and Risk Analysis module.

The module provides:
- Rule-based risk scoring.
- Risk levels and supporting evidence.
- Evidence-based explanations.
- Review and remediation recommendations.

This is a proposed contract for team integration. The backend API endpoints have not yet been implemented.

## 2. Current Python Functions

### Risk scoring

File: `risk_engine.py`

Function:

```python
score_finding(finding: dict) -> dict
```

Input: A dictionary containing the available security finding fields.

Output:

```json
{
  "score": 85,
  "level": "Critical",
  "evidence": [
    {
      "signal": "residual_access",
      "points": 30,
      "details": "The account is active, but the employee has departed or the contractor's engagement has ended."
    }
  ],
  "recommendations": [
    "Verify the person's status and review whether the active account is still authorized."
  ],
  "disclaimer": "This score is a rule-based estimate for investigation, not proof of an attack or a guarantee of security."
}
```

The output above illustrates the structure; the number and content of evidence items depend on the input.

### Security Assistant

File: `security_assistant.py`

Function:

```python
explain_finding(finding: dict) -> dict
```

The assistant calls `score_finding()` and returns:
- `summary`
- `risk_score`
- `risk_level`
- `evidence`
- `recommendations`
- `assistant_type`
- `disclaimer`

The current implementation uses deterministic Python rules. It does not call an external language model.

## 3. Supported Input Fields

| Field | Expected value | Purpose |
|---|---|---|
| `employment_status` | String, e.g. `departed` or `contract_ended` | Identifies a possible residual-access situation |
| `account_active` | Boolean | Indicates whether the account is active |
| `privilege_level` | String, e.g. `admin`, `superadmin`, `elevated` | Evaluates elevated privileges |
| `resource_sensitivity` | `low`, `medium`, `high`, or `critical` | Represents the sensitivity of accessible resources |
| `owner_known` | Boolean | Indicates whether the account owner is known |
| `suspicious_activity` | Boolean or list of signals | Accepts activity signals supplied by Member 4 |

Fields can be omitted when unavailable. Missing data must not be interpreted as proof that an account is safe.

## 4. Risk Scoring Rules

| Evidence signal | Points |
|---|---:|
| Active account for a departed employee or ended contractor | 30 |
| Admin or superadmin privilege | 25 |
| Elevated privilege | 15 |
| Low resource sensitivity | 0 |
| Medium resource sensitivity | 8 |
| High resource sensitivity | 15 |
| Critical resource sensitivity | 20 |
| Unknown account owner | 10 |
| Suspicious-activity signal supplied to the risk engine | 15 |

The total score is capped at 100.

Risk levels:
- Low: 0–24
- Medium: 25–49
- High: 50–74
- Critical: 75–100

These weights are initial prototype rules and require review before production use.

## 5. Proposed Backend Integration

Member 2 should coordinate the final API request and response formats before implementation.

Suggested flow:

1. The backend receives or retrieves a security finding.
2. The backend validates the input and access permissions.
3. The backend passes the finding to Member 3's Python function.
4. The risk engine returns the score, level, evidence, and recommendations.
5. The backend returns the result to authorized frontend consumers.

Suggested endpoint, subject to team agreement:

`POST /api/risk-analysis/evaluate/`

This endpoint is a proposal only. It does not currently exist.

Suggested JSON request:

```json
{
  "employment_status": "departed",
  "account_active": true,
  "privilege_level": "admin",
  "resource_sensitivity": "critical",
  "owner_known": false,
  "suspicious_activity": false
}
```

For this example, the current risk engine should return a score of 85 and a `Critical` risk level.

## 6. Integration Requirements

- Reuse `risk_engine.py`; do not duplicate its scoring rules in the backend.
- Reuse `security_assistant.py` for explanations.
- Agree on a shared API schema with Member 2 before connecting the frontend.
- Validate incoming data and reject malformed requests appropriately.
- Enforce authentication and authorization in the backend.
- Do not expose credentials, tokens, or confidential records in responses or logs.
- Treat risk scores as estimates, not proof of compromise.
- Require authorized human review before consequential access changes.
- Keep evidence and recommendations linked to the finding that produced them.

## 7. Tests

Run the current Member 3 test suite from the repository root:

```powershell
py -m unittest discover -s .\AI-and-Risk-Analysis -p "test_*.py" -v
```

The current suite contains 10 automated tests.

## 8. Current Limitations

The module is a standalone prototype. The following have not yet been implemented:
- Backend API endpoints.
- Database persistence.
- Authentication or authorization within this module.
- External language-model integration.
- Live application-provider connections.
- Automated remediation.

These capabilities require coordinated implementation and testing with the relevant team members.
