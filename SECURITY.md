# Security Policy

`@tantainnovative/ndpr-toolkit` ships compliance infrastructure that handles
data-subject PII for Nigerian organisations. Security reports take
priority — please report responsibly.

## Supported versions

| Version  | Supported          |
|----------|--------------------|
| 5.x (latest minor) | ✅ Active           |
| < 5.0    | ❌ End of life      |

Security fixes land on the latest 5.x minor only — upgrade to the newest
release to stay covered. Older majors (4.x and earlier) no longer receive
fixes.

## Reporting a vulnerability

**Do not open a public issue.** Instead:

1. Email **security@tantainnovative.com** with a short description.
2. Include: affected version(s), reproduction steps, the suspected impact,
   and (optionally) a proof-of-concept.
3. We will acknowledge within **72 hours** (NDPA Section 40 deadline for
   our own breach reporting feeds the cadence we hold ourselves to).
4. A fix + advisory will be coordinated with you before public disclosure.
   Typical timelines:
   - Patch: shipped within **7 days** for critical, **14 days** for high,
     **30 days** for medium / low.
   - Public advisory: 7-day window after the fix lands on npm so consumers
     have time to upgrade.

GitHub Security Advisories are the preferred channel once we've triaged —
file a private advisory at <https://github.com/mr-tanta/ndpr-toolkit/security/advisories/new>.

## What's in scope

- Anything in the published `@tantainnovative/ndpr-toolkit` npm package.
- The reference DSR backend at `examples/dsr-backend-reference/` (issues that
  consumers would inherit by copying it as a starting point).
- The docs site if the bug leaks PII or facilitates a CSRF / XSS against
  visitors.

## What's out of scope

- Bugs in apps that import the toolkit (we'll happily forward to the right
  team, but they're not our CVE to file).
- Issues that require physical access or social engineering of the
  maintainer.
- Dependency vulnerabilities for which an upstream patch already exists
  and the toolkit's `pnpm-lock.yaml` resolves to a safe version — file a
  regular issue or PR.

## Recognition

If your report leads to an advisory we'll credit you (under whatever name
or handle you prefer) in the advisory and the next CHANGELOG entry.
