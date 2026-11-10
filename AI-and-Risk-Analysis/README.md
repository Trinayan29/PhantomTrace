# Member 3 Ai And Risk Analysis

## Responsibilities
- Implement evidence-based risk scoring and prioritization.
- Build the AI Security Assistant and grounded explanations.

## Work Area

Add this member's assigned files and implementation here. Coordinate shared API contracts and avoid duplicating modules in the main `frontend/` and `backend/` directories.

## Current Implementation

### 1. Risk Engine
File: `risk_engine.py`

Implements transparent, rule-based security risk scoring.

Supported evidence signals:
- Residual access after employment or a contract ends: 30 points
- Administrator or superadministrator privileges: 25 points
- Elevated privileges: 15 points
- Resource sensitivity: 0–20 points, depending on classification
- Unknown account owner: 10 points
- Suspicious-activity signal supplied by the detection module: 15 points

The total score is capped at 100.

Risk levels:
- Low: 0–24
- Medium: 25–49
- High: 50–74
- Critical: 75–100

These weights are initial prototype values and require review before production use.

### 2. Security Assistant
File: `security_assistant.py`

Provides:
- A summary of the risk finding.
- The calculated risk score and level.
- Supporting evidence and point contributions.
- Recommended review actions.
- A disclaimer explaining the limitations of the findings.

The current assistant uses deterministic Python rules. It does not yet call a large language model.

### 3. Automated Tests

Test files:
- `test_risk_engine.py`
- `test_security_assistant.py`

Run all tests from the repository root using PowerShell:

```powershell
py -m unittest discover -s .\AI-and-Risk-Analysis -p "test_*.py" -v
```

Current status: 12 automated tests passed.

Input validation:
- Rejects non-dictionary findings.
- Validates string and Boolean fields.
- Validates suspicious-activity data formats.

### 4. Integration Notes

The current implementation is a standalone prototype.

The backend integration contract, API endpoints, authentication, database persistence, and live AI provider integration have not yet been implemented.

Before integration, coordinate the input and output formats with Member 2. Security findings must remain evidence-based, and a risk score must not be treated as proof of a cyberattack.
