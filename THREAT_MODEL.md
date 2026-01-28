# Threat Model

Analysis using **STRIDE** methodology.

## 1. Spoofing Identity
*   **Threat**: Attacker impersonates a user.
*   **Mitigation**: 
    - Strong password hashing (Bcrypt).
    - **MFA Enforcement**: Even with a password, attacker needs the physical device (TOTP).
    - JWT Signatures preventing token forgery.

## 2. Tampering with Data
*   **Threat**: Modifying recovery codes or user balances.
*   **Mitigation**:
    - Recovery codes are hashed (only verify, never read).
    - Database access restricted to Backend API.

## 3. Repudiation
*   **Threat**: User performs malicious action and denies it.
*   **Mitigation**:
    - **Audit Logging**: All critical actions (Login, MFA change, OAuth grant) are logged with IP & Timestamp to `audit_logs` table.

## 4. Information Disclosure
*   **Threat**: Leaking user emails or tokens.
*   **Mitigation**:
    - Exceptions are caught and generic error messages returned ("Invalid credentials" vs "User not found" - partially implemented logic to prevent enumeration).
    - Production config should enable HTTPS (SSL).

## 5. Denial of Service
*   **Threat**: Brute forcing login to crash server.
*   **Mitigation**:
    - **Rate Limiting**: `Flask-Limiter` restricts login attempts (5/min).
    - **Account Lockout**: Locks account after 5 failed attempts.

## 6. Elevation of Privilege
*   **Threat**: Regular user accesses Admin endpoints.
*   **Mitigation**:
    - Role-based checks (Foundation laid, requires expansion).
