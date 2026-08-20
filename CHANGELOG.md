# Changelog

All notable product changes for Cristian Cyber Academy are documented here.

## [0.3.3] — 2026-08-19

### Added

- Student 360 learner-intelligence workspace at `/student`.
- Learner selector with identity, account posture and last-access context.
- Academic progress, enrollments, cohort context and certificate evidence aggregation.
- Cyber Skill Graph preview with explicit `PREVIEW SYNTHETIC` labeling.
- Next Best Action / intervention recommendation surface.
- Learner-specific audit timeline.
- Data-boundary panel documenting prohibited sensitive fields.
- Clean Netlify `/student` route and PWA cache coverage.
- Dedicated Student 360 contract test.

### Security & integrity

- Student 360 requires `manage_users` and the early route bootstrap limits it to coordinator/admin.
- Login return routing allows `/student` only as a same-origin allowlisted destination and preserves authorized query context.
- Remote mode never fabricates cyber Skill Graph scores; it shows `PENDING CYBER DATA` until the server-side cyber evidence contract exists.
- Remote mode does not create a fake assignment when the server-side assignment API is unavailable.
- User-controlled content is rendered with DOM/textContent APIs rather than `innerHTML`.
- Student 360 never exposes passwords, tokens, raw prompts, cookies or sensitive lab content.

### Changed

- Product preview version is now `0.3.3-learner-intelligence-preview`.
- Identity Operations links directly into Student 360.
- Offline shell advanced to `cca-shell-v8`.

### Known gates

- Student 360 contract tests are written but not claimed as executed in the current runner.
- Server-side Cyber Skill Graph persistence is still pending; only preview mode displays synthetic skill values.
- Server-side recommendation/assignment persistence is not yet connected to Student 360.
- Human desktop/mobile QA remains required before production.

## [0.3.2] — 2026-08-19

### Added

- Explicit account suspension/reactivation controls in `/users`.
- Remote Academy Core actions for `suspend` and `reactivate`.
- Account access posture with `ACTIVE` / `SUSPENDED` and last-login context.
- Dedicated lifecycle styling and PWA cache coverage.
- Negative authorization tests in Academy Core for self-suspension, admin protection and generic `is_active` PATCH bypass.

### Security

- Suspension is a dedicated audited action, not a generic profile mutation.
- Suspending an account revokes its DRF authentication token.
- Operators cannot suspend their own account.
- Coordinators cannot suspend administrator accounts.
- Suspended accounts cannot have role/cohort changes made from the Cristian operator UI until reactivated.
- Academy Core keeps `is_active` read-only in the managed-profile serializer.

### Changed

- Product preview version is now `0.3.2-account-lifecycle-preview`.
- Identity Operations now surfaces account lifecycle and access activity as first-class posture.

### Known gates

- Latest contract tests remain written but not claimed as executed in this runner.
- Academy Core Django/SQLite + PostgreSQL release gates remain mandatory before merge.
- MFA/step-up authentication remains a production gate for sensitive administrative actions.

## [0.3.1] — 2026-08-19

### Added

- Identity & Cohort Operations at `/users` for coordinator/admin roles.
- Academic user directory with role, cohort, onboarding and progress posture.
- Invitation creation/revocation and one-time activation-link fallback.
- `/activate` account activation flow.
- Preview-created identities with PBKDF2-SHA256, random salt and Web Crypto.
- Preview invitation lifecycle: activation, profile creation, optional cohort assignment and immediate login.
- Academy Core operations adapter for profiles, invitations, cohorts, memberships, enrollments, certificates and audit events.
- Explicit permission model separating `teach` from `manage_users` and `manage_cohorts`.
- Identity administration contract tests.
- Identity operations architecture/runbook.

### Security

- Cristian preview operator is represented as `coordinator`, not an overpowered generic instructor.
- Instructor Console now enforces instructor/coordinator/admin access.
- Only coordinator/admin receives the user-administration entry point.
- Administrators never enter or see learner passwords.
- Preview-created passwords are not persisted in plaintext.
- Account activation consumes invitation state.
- Existing same-origin allowlist protects post-login `next` routing against open redirects.

### Academy Core integration

A separate Academy Core draft PR extends the reusable account lifecycle with:

- password reset request/confirmation;
- invitation email delivery through configurable SMTP;
- tenant-specific activation/reset frontend URLs;
- login `last_login` update;
- successful-login audit event;
- read-only activity posture in managed profiles.

### Known gates

- Identity contract tests are committed but not claimed as executed in this runner.
- Academy Core Django/PostgreSQL release gates remain mandatory before merge.
- SMTP delivery is not configured in the public preview.
- MFA/step-up authentication remains a production roadmap gate.

## [0.3.0] — 2026-08-19

### Added

- Crohnoz Academy Core adapter and reusable academic-core boundary.
- `/login` role-aware access portal.
- `/account` profile/session/security panel.
- `/reset-password` recovery confirmation UI.
- Session state in `sessionStorage`.
- Learner/instructor routing and account navigation.
- Netlify clean routes for identity surfaces.

### Changed

- Cristian Cyber Academy became a specialized cyber tenant on top of Crohnoz Academy rather than a second independent LMS.

## [0.2.1] — 2026-08-19

### Added

- Privacy & Data Control Center.
- Consent-aware analytics boundary with event/property allowlists.
- PostHog rollout governance:
  - `cca-premium-experience` ON;
  - `cca-ai-mentor-live` OFF;
  - `cca-cyber-range-live` OFF.
- Versioned learning path and Cyber Range lab catalogs.
- JSON schemas for learning events and lab manifests.
- Threat model and observability contract.
- Supabase security-hardening migrations for membership privilege boundaries, tenant-coherent foreign keys and server-authoritative scoring.
- AI Mentor policy + feature-gated provider adapter.
- Cyber Range orchestrator OpenAPI contract that only accepts approved catalog `lab_id` values.
- New v0.2.1 standalone premium Vercel showcase.

### Security

- Instructor membership can no longer be used as the basis for owner-level membership administration in the production schema contract.
- Browser writes are no longer authoritative for scored attempts in the hardened data-plane contract.
- Raw mentor question/topic text is excluded from Crohnoz telemetry allowlists.
- Session recording remains explicitly disabled.
- Range manifests enforce synthetic targets, no secrets and isolated/no-egress networking.

### Changed

- Product version bumped from v0.2.0 to v0.2.1.
- Offline shell now caches Privacy Center and analytics policy adapter.
- README and Epic reorganized around production gates rather than demo-only tasks.

### Known gates

- Canonical multi-file Vercel preview still needs external browser/HTTP verification.
- Smoke suite is written but not executed in the current container because outbound DNS cannot resolve GitHub.
- Supabase staging is intentionally not provisioned until organization/cost is explicitly confirmed.

## [0.2.0] — 2026-08-19

### Added

- Premium Mission Control redesign.
- Academy, Phishing Lab, defensive Cyber Range and local AI Mentor.
- Skill Graph, adaptive learning signal, XP/readiness/achievements.
- Instructor Teaching Command Center and CSV evidence export.
- Certificate gate.
- White-label tenant config.
- PWA/offline shell.
- Local Crohnoz telemetry bus.
- Initial multi-tenant Supabase schema with RLS.
- CSP and defensive security headers.
