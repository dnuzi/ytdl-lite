# Security Policy

## Supported Versions

Only the latest published version of `ytdl-lite` receives security updates.

| Version | Supported          |
|---------|--------------------|
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, **please do NOT open a public GitHub issue.**

Instead, report it privately by opening a **GitHub Security Advisory**:

1. Go to the **Security** tab of this repository
2. Click **"Report a vulnerability"**
3. Fill in the details

Or contact the maintainer directly via GitHub: **@DanuZz**

---

## What to Include in Your Report

Please provide as much detail as possible:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact (what an attacker could do)
- Your suggested fix (if any)

---

## Response Time

| Action                        | Timeframe     |
|-------------------------------|---------------|
| Acknowledgement of report     | Within 3 days |
| Status update                 | Within 7 days |
| Patch released (if confirmed) | Within 14 days|

---

## Scope

The following are considered **in scope** for security reports:

- Dependency vulnerabilities that affect users of this package
- Logic bugs that could expose user data or API endpoints
- Issues that could cause unintended code execution

The following are **out of scope:**

- Vulnerabilities in third-party APIs used by this package
- Issues only reproducible on unsupported Node.js versions (< 16)
- Rate limiting or abuse of the underlying YouTube service

---

## Disclosure Policy

- We follow **responsible disclosure** — please give us time to patch before going public
- Once a fix is released, the vulnerability will be documented in [CHANGELOG.md](./CHANGELOG.md)
- Credit will be given to the reporter (unless they prefer to remain anonymous)

---

**Maintained by [@DanuZz](https://github.com/dnuzi)**
