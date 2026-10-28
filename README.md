# 🛡️ PhantomTrace

### Discover the Digital Access That Should No Longer Exist.

**PhantomTrace** is an AI-powered cybersecurity platform designed to help small businesses discover residual access, identify suspicious activity, assess access-related risks, and manage security remediation across business applications.

It correlates workforce records, application accounts, permissions, and available security logs to provide a centralized view of digital access and potential security threats.

---

## 📌 Problem Statement

Businesses use multiple platforms, such as GitHub, Google Workspace, Microsoft 365, and cloud storage, to manage their daily operations.

When employees leave, contractors finish their engagements, or projects close, their accounts and permissions may remain active. Organizations may also struggle to identify excessive privileges, suspicious access changes, and forgotten credentials across different applications.

Without centralized visibility, these issues can increase the risk of unauthorized access and data exposure.

## 💡 Proposed Solution

PhantomTrace provides a centralized platform that helps organizations:

- Discover potentially unauthorized or forgotten access.
- Compare workforce records with application access inventories.
- Identify suspicious activity using available security logs.
- Visualize relationships between identities, applications, permissions, and resources.
- Prioritize security findings using contextual risk analysis.
- Track remediation and verify changes against refreshed records.
- Generate security reports to support access reviews and audits.

---

## ✨ Key Features

### 1. Residual Access Detection
Identifies accounts that may remain active after an employee leaves or a contractor's engagement ends.

### 2. Cross-Application Access Inventory
Consolidates available account and permission records from multiple business applications to improve access visibility.

### 3. Cyber Attack Detection
Analyzes available security logs and activity records to flag potentially malicious patterns, including:
- Repeated failed login attempts.
- Unexpected privilege escalation.
- Suspicious access changes.
- Unusual account activity.

*Detection depends on the quality and availability of security data. Alerts indicate potential threats and do not independently confirm an attack.*

### 4. Digital Access Relationship Graph
Visualizes relationships between users, applications, permissions, and sensitive resources to make complex access relationships easier to understand.

### 5. Evidence-Based Risk Analysis
Prioritizes findings using available evidence, including employment status, privilege levels, resource sensitivity, and ownership information.

### 6. Access Blast-Radius Estimation
Estimates which connected resources may be affected if an identity is compromised, based on the relationships represented in the available data.

### 7. AI Security Assistant
Explains security findings, summarizes supporting evidence, and recommends review or remediation steps grounded in the available records.

### 8. Verified Remediation
Tracks findings through review, approval, corrective action, and verification using refreshed records or supported provider APIs.

### 9. Permission Optimization
Highlights potentially excessive privileges and recommends reviewing access against an organization's requirements.

### 10. Access Expiration Prediction
Uses recorded contractor end dates, project closures, and permission-expiration dates to identify access that may require review.

### 11. Forgotten Credential Inventory
Flags credential records with missing ownership, unclear purposes, or stale metadata where supporting information is available. Secret values should never be exposed in findings or reports.

### 12. Unusual Access-Change Alerts
Flags noteworthy access changes when relevant activity logs or event records are available.

### 13. Digital Access Health Score
Provides a transparent summary of configured access-security indicators to help organizations monitor their access-management posture.

### 14. What-If Access Simulator
Models potential access changes and estimates their impact on known identity-resource relationships before administrators apply changes.

### 15. Shadow IT Inventory
Highlights applications discovered in available records that are not listed in the organization's approved application inventory.

### 16. Security Reports and Audit Trail
Produces reports containing security findings, supporting evidence, risk priorities, remediation status, and relevant administrative actions.

### 17. Emergency Response Workflow
Supports an authorized administrator-led access suspension or revocation workflow where the relevant provider integration permits it.

---

## 🚀 What Makes PhantomTrace Different?

| Capability | Value |
|---|---|
| Cross-application correlation | Compares workforce records with application access inventories. |
| Relationship-based visibility | Maps identities, applications, permissions, and resources. |
| Contextual risk prioritization | Evaluates findings using available evidence rather than inactivity alone. |
| Cyber attack signal analysis | Flags potentially malicious patterns in available security logs. |
| Access impact estimation | Helps administrators understand the potential reach of an identity's access. |
| Verified remediation | Tracks corrective actions and checks whether changes are reflected in refreshed records. |
| Flexible onboarding | Supports demonstration data, file imports, and authorized provider integrations. |

**Core innovation:** PhantomTrace combines cross-application access discovery, a digital access relationship graph, contextual risk analysis, suspicious-activity detection, and verified remediation in a workflow designed for small businesses.

---

## 🧩 Operating Modes

PhantomTrace is designed to support different levels of integration.

### Demo Mode
Uses fictional sample data to demonstrate detection, risk analysis, relationship visualization, and reporting without requiring access to real organizational systems.

### Import Mode
Allows administrators to import supported CSV files or exported reports containing workforce records, application accounts, permissions, and security activity.

### Connected Mode
Uses authorized provider integrations to retrieve supported records from external applications. Integrations should use the minimum permissions necessary and prefer read-only access during initial deployment.

Live integrations depend on provider API capabilities, permissions, and configuration.

---

## 🏗️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React + TypeScript |
| UI Styling | Tailwind CSS |
| Backend | Django REST Framework |
| Database | PostgreSQL |
| Authentication | Django Authentication + DRF permissions |
| Risk Analysis | Python-based rules and scoring |
| Relationship Analysis | NetworkX |
| Access Graph Visualization | React Flow |
| AI Security Assistant | LLM API grounded in structured evidence |
| Charts and Analytics | Recharts |
| API Testing | Postman |
| Version Control | Git + GitHub |
| Optional Background Jobs | Celery + Redis |

*Technologies are proposed for the project architecture and may be introduced incrementally during development.*

---

## 📂 Project Structure

```text
PhantomTrace/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   ├── findings/
│   │   │   ├── access-graph/
│   │   │   └── reports/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── tests/
│
├── backend/
│   ├── config/
│   ├── apps/
│   │   ├── organizations/
│   │   ├── identities/
│   │   ├── applications/
│   │   ├── access_inventory/
│   │   ├── detection/
│   │   ├── risk_analysis/
│   │   ├── remediation/
│   │   ├── audit/
│   │   ├── reports/
│   │   └── integrations/
│   ├── tests/
│   ├── media/
│   └── static/
│
├── data/
│   ├── sample_imports/
│   └── sample_logs/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── security/
│
├── scripts/
├── deployment/
├── .github/
│   └── workflows/
│
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Install the following tools before beginning development:

- Python 3.12 or a compatible version supported by the selected Django release.
- Node.js and npm.
- PostgreSQL.
- Git.
- Visual Studio Code or another preferred code editor.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/PhantomTrace.git
cd PhantomTrace
```

Replace `YOUR-USERNAME` with the GitHub username or organization that owns the repository.

### 2. Configure the Backend

Open a terminal in the project directory:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies after creating `requirements.txt`:

```bash
pip install -r requirements.txt
```

Create the Django project configuration and application modules if they have not already been initialized.

Configure the database connection and other required settings using environment variables. Do not commit real credentials or secret keys.

Once the Django project and dependencies are configured, apply migrations and start the development server:

```bash
python manage.py migrate
python manage.py runserver
```

The default local development address is:

```text
http://127.0.0.1:8000/
```

### 3. Configure the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The development address will be displayed in the terminal by the frontend development server.

*Note: The current repository structure is a starting point. The commands above require the corresponding project configuration files, dependency manifests, and application code to be created first.*

---

## 🔐 Security Principles

PhantomTrace is intended to support responsible access management and security monitoring.

- **Least privilege:** Request only the permissions necessary for the configured functionality.
- **Secure authentication:** Enforce appropriate authentication and authorization checks.
- **Credential protection:** Never commit API keys, passwords, access tokens, or other secrets.
- **Secure token storage:** Protect provider tokens and support revocation.
- **Data isolation:** Separate organizational data and enforce tenant-level authorization where applicable.
- **Auditability:** Record relevant administrative actions and remediation events.
- **Evidence-based findings:** Associate alerts with available supporting records.
- **Controlled remediation:** Require appropriate authorization and confirmation before access-changing actions.
- **Data minimization:** Collect and retain only the information necessary for the intended functionality.
- **Safe testing:** Use fictional or authorized test data during development.

PhantomTrace should not be considered a guarantee of security or a replacement for an organization's broader security controls.

---

## 🗺️ Development Roadmap

### Phase 1 — Foundation
- [ ] Initialize the Django REST Framework backend.
- [ ] Configure PostgreSQL.
- [ ] Establish authentication and organization-level access controls.
- [ ] Define API contracts and data models.
- [ ] Implement CSV import functionality.

### Phase 2 — Detection and Risk Analysis
- [ ] Implement residual access detection.
- [ ] Identify potentially excessive privileges.
- [ ] Implement evidence-based risk scoring.
- [ ] Analyze available security logs for suspicious activity.
- [ ] Build the findings and alert APIs.

### Phase 3 — Dashboard and Visualization
- [ ] Develop the React dashboard.
- [ ] Display findings, risk priorities, and alerts.
- [ ] Build the digital access relationship graph.
- [ ] Implement reports and audit history.

### Phase 4 — AI Assistance
- [ ] Integrate an AI Security Assistant.
- [ ] Generate evidence-grounded explanations.
- [ ] Recommend review and remediation steps.
- [ ] Validate AI responses against structured evidence.

### Phase 5 — Integration and Verification
- [ ] Implement one authorized provider integration.
- [ ] Begin with read-only access where possible.
- [ ] Track remediation actions.
- [ ] Verify changes against refreshed records.
- [ ] Add automated tests and security checks.

### Phase 6 — Deployment
- [ ] Configure production environment variables.
- [ ] Harden authentication and authorization.
- [ ] Review logging, backups, and data retention.
- [ ] Deploy the frontend, backend, and database.
- [ ] Document setup and operational procedures.

---

## 🎯 Example Use Case

A developer leaves an organization but still has access to private GitHub repositories and confidential cloud files.

PhantomTrace can compare the organization's workforce records with available application access inventories, flag the discrepancy, map the developer's known access relationships, explain the potential risk, and recommend an access review.

After an authorized administrator removes access, PhantomTrace can check refreshed records to determine whether the change is reflected in the available data.

---

## 👥 Intended Users

- Small and medium-sized businesses.
- IT administrators.
- Security operations teams.
- System and application administrators.
- Organizations seeking better visibility into user access and permissions.

---

## ⚠️ Scope and Limitations

PhantomTrace's findings depend on the completeness, accuracy, and freshness of its input data and connected provider APIs.

Suspicious-activity alerts are indicators for investigation, not definitive proof of an attack. Access blast-radius estimates represent known relationships in the available data, not guaranteed exploitability. Remediation and verification capabilities depend on the permissions and functionality exposed by each integration.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request describing the changes.

Please do not include real organizational data, credentials, API keys, or sensitive security logs in issues or pull requests.

---

## 📄 License

A license has not yet been selected. Add a `LICENSE` file before distributing the project under specific reuse or contribution terms.

---

## 🛡️ PhantomTrace

**Discover the Digital Access That Should No Longer Exist.**

Building clearer access visibility, evidence-based risk analysis, and more accountable cybersecurity workflows for small businesses.
