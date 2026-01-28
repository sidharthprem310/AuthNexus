# AuthNexus: Secure Identity & Access Management System

AuthNexus is a production-grade Identity and Access Management (IAM) platform built with security at its core. It features robust authentication, Multi-Factor Authentication (MFA), and OAuth 2.0 provider capabilities.

## Features

- **Secure Authentication**: Bcrypt password hashing, JWT session management.
- **Multi-Factor Authentication (MFA)**:
  - Time-based One-Time Password (TOTP) (Google Authenticator, Authy).
  - Backup Recovery Codes.
  - Email OTP Fallback (Simulated).
- **OAuth 2.0 Provider**:
  - Authorization Code Flow.
  - Client Registration & Management.
  - User Consent Screen.
- **Security Hardening**:
  - Rate Limiting (Brute-force protection).
  - Account Lockout Policies.
  - Comprehensive Audit Logging.
- **Modern Frontend**: React SPA with TailwindCSS.

## Tech Stack

- **Backend**: Python, Flask, SQLAlchemy, SQLite (Swappable).
- **Frontend**: React, Vite, TailwindCSS.
- **Containerization**: Docker, Docker Compose.

## Getting Started

### Prerequisites

- Docker & Docker Compose
- *OR* Python 3.11+ & Node.js 18+

### Quick Start (Docker)

1.  Clone the repository.
2.  Run the application:
    ```bash
    docker-compose up --build
    ```
3.  Access the application:
    - **Frontend**: http://localhost
    - **API Docs**: http://localhost:5000/apidocs/index.html

### Manual Setup (Development)

**Backend:**
```bash
cd backend
python -m venv venv
# Activate venv
pip install -r requirements.txt
flask db upgrade
flask run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Security

Please review [SECURITY.md](SECURITY.md) for our security policy and reporting vulnerabilities.
For a detailed threat analysis, see [THREAT_MODEL.md](THREAT_MODEL.md).

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for system design details.
