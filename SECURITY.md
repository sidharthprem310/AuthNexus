# Security Policy

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues. Instead, report them privately to the maintainers.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Measures

- **Passwords**: Never stored in plain text. We use Bcrypt with appropriate work factors.
- **MFA**: We recommend all users enable 2FA immediately.
- **Recovery**: Recovery codes are one-time use only.
- **Sessions**: JWTs have short expiration times (default 15 mins for access).
