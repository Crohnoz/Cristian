# Changelog

All notable product changes for Cristian Cyber Academy are documented here.

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
