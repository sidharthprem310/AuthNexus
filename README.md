<<<<<<< HEAD
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
=======
# 🔐 AuthNexus
### Secure Identity. Unified Access.

AuthNexus is a production-grade **Identity and Access Management (IAM)** platform that implements **OAuth2 with Multi-Factor Authentication (MFA)** using security-first design principles.

This project is built as a **portfolio-quality system**, closely mirroring how authentication and authorization platforms are designed in real enterprise environments.

---

## 🚀 Features

### Authentication & Identity
- Secure password authentication using bcrypt with per-user salts
- OAuth2 Authorization Code Flow
- JWT-based session management
- Role and policy-aware authentication logic

### Multi-Factor Authentication (MFA)
- Time-based One-Time Passwords (TOTP)
- Email OTP fallback
- One-time recovery codes
- Step-up authentication for sensitive actions
- Trusted device recognition

### Security Controls
- Brute-force and credential stuffing protection
- Account lockout policies
- OTP rate limiting and replay protection
- Admin-enforced MFA policies
- Comprehensive audit logging

### Frontend
- React-based authentication UI
- MFA OTP challenge page
- OAuth authorization consent screen
- Trusted device checkbox
- Dark mode security UI
- Next.js SSR implementation for auth flows

### DevOps & Documentation
- Dockerized backend
- OpenAPI (Swagger) API documentation
- Threat model and architecture

## 🧱 Architecture Overview

### Backend
- Python (Flask)
- SQLAlchemy ORM
- OAuth2 Authorization Code Flow
- JWT for access tokens
- Modular security components

### Frontend
- React (SPA)
- Next.js (SSR version)
- Minimal, security-focused UI

### Security
- Defense-in-depth architecture
- Explicit trust boundaries
- Audit-first design

---

## 🔁 Authentication Flow

1. User submits email and password  
2. Credentials are securely verified  
3. MFA challenge is triggered if required  
4. OTP, email OTP, or recovery code is validated  
5. Trusted device may be registered  
6. OAuth authorization consent is shown  
7. Access token is issued  

---

## 🛡️ Threat Model

| Threat | Mitigation |
|------|-----------|
| Credential stuffing | Rate limiting, account lockout |
| Brute-force attacks | MFA + login throttling |
| OTP replay | Time-bound OTPs |
| Database compromise | Salted bcrypt hashing |
| MFA bypass attempts | Step-up authentication |
| Session hijacking | Short-lived JWTs |

See `docs/threat-model.md` for full details.

---

## 📸 Screenshots

### Login Page
![Login](frontend/public/screenshots/login.png)

### MFA Challenge
![MFA](frontend/public/screenshots/mfa.png)

### OAuth Consent
![Consent](frontend/public/screenshots/consent.png)

### Dark Mode UI
![Dark Mode](frontend/public/screenshots/darkmode.png)

---

## 🐳 Run with Docker

```bash
docker build -t authnexus .
docker run -p 5000:5000 authnexus

📘 API Documentation (Swagger)

Once the backend is running, access the API documentation at:

http://localhost:5000/docs

🧪 Attack Simulations

Attack simulation scripts are available in the tests/ directory:

Brute-force login simulation

OTP replay attack simulation

MFA bypass attempt simulation

These scripts demonstrate how AuthNexus detects and mitigates common attacks.

📁 Project Structure
authnexus/
├── backend/
├── frontend/
├── authnexus-ssr/
├── docs/
├── tests/
├── README.md
└── SECURITY.md

🎓 Why This Project Matters

AuthNexus goes beyond basic authentication demos.
It reflects how real-world IAM systems are built with:

Strong security guarantees

Clear separation of concerns

Observable security events

Defensive coding practices

This project is suitable for:

Security engineering portfolios

IAM and Zero Trust demonstrations

MTech or research-level system design

Interview system design discussions

🔐 Security Disclosure

Please report security vulnerabilities responsibly.
See SECURITY.md for disclosure guidelines.

👤 Author

Built as a security-focused portfolio project.
>>>>>>> 25643e6054d84f3dab282897c727b6a672a21368
