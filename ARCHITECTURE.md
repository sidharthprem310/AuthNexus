# System Architecture

## Overview

AuthNexus follows a decoupled architecture with a RESTful Flask backend and a React Single Page Application (SPA) frontend.

## Diagram

```mermaid
graph TD
    Client[User Browser]
    
    subgraph Frontend
        SPA[React SPA]
    end
    
    subgraph Backend
        API[Flask API]
        DB[(SQLite/SQLAlchemy)]
    end
    
    Client -->|HTTP/HTTPS| SPA
    SPA -->|REST API (JSON)| API
    API -->|SQL| DB
    
    subgraph Security
        Auth[JWT Manager]
        Limiter[Rate Limiter]
        Audit[Audit Logger]
        Bcrypt[Password Hasher]
    end
    
    API --> Auth
    API --> Limiter
    API --> Audit
    API --> Bcrypt
```

## Data Flow

1.  **Authentication**:
    - User submits credentials -> API validates hash -> Returns JWT Access Token.
    - If MFA Enabled -> API returns temporary token -> User submits OTP -> API returns full Access Token.
    
2.  **OAuth Authorization**:
    - Client redirects User to `/oauth/authorize`.
    - User logs in (if needed) and grants consent.
    - API generates Authorization Code -> Redirects back to Client.
    - Client exchanges Code + Secret for Access Token.

## Database Schema (Key Models)

- **User**: `email`, `password_hash`, `mfa_secret`
- **RecoveryCode**: `user_id`, `code_hash`, `is_used`
- **AuditLog**: `event_name`, `user_id`, `details`, `ip_address`
- **OAuthClient**: `client_id`, `client_secret_hash`, `redirect_uris`
