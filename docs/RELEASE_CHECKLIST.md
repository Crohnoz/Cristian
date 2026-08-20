# Release Checklist — Cristian Cyber Academy

A release is not production-ready because the UI looks finished. Promotion requires evidence across product, security, privacy, data, observability and operations.

## 1. Repository & supply chain

- [ ] Repository visibility appropriate for configured providers/secrets.
- [ ] No secrets, service-role keys, credentials or real target data in git history.
- [ ] Dependency lockfile reviewed when dependencies are introduced.
- [ ] Dependency/security scan completed.
- [ ] Branch/PR review complete.
- [ ] Release version and CHANGELOG updated.

## 2. Automated QA

- [ ] `npm test` passes in a trusted network-capable runner.
- [ ] Learning path catalog parses and validates.
- [ ] Lab manifests satisfy isolation contracts.
- [ ] Privacy/analytics invariants pass.
- [ ] Negative authorization tests pass against staging.
- [ ] No client-authoritative score writes.

## 3. Browser QA

Desktop:
- [ ] Chromium current.
- [ ] Firefox current.
- [ ] Safari/WebKit current where available.

Responsive:
- [ ] 1440px desktop.
- [ ] 1024px tablet/compact desktop.
- [ ] 768px tablet.
- [ ] 390px mobile.

Flows:
- [ ] learner Mission Control;
- [ ] Academy navigation;
- [ ] Phishing Lab completion;
- [ ] Range demo completion;
- [ ] Mentor interaction;
- [ ] achievement/certificate gate;
- [ ] Instructor Console;
- [ ] evidence export;
- [ ] Privacy Center controls;
- [ ] PWA/offline shell.

## 4. HTTP/AppSec

- [ ] HTTPS only.
- [ ] CSP observed on real deployment.
- [ ] `frame-ancestors 'none'` / X-Frame-Options effective.
- [ ] nosniff effective.
- [ ] Permissions-Policy effective.
- [ ] Referrer-Policy effective.
- [ ] COOP effective.
- [ ] No unexpected third-party requests.
- [ ] DOM XSS review complete.
- [ ] Sensitive pages never expose secrets in client source.

## 5. Supabase / data plane

- [ ] Staging organization/project explicitly selected.
- [ ] Cost confirmed before provisioning.
- [ ] Migrations 001–003 applied cleanly.
- [ ] Supabase security advisors reviewed.
- [ ] Performance advisors reviewed.
- [ ] Auth configured.
- [ ] MFA policy defined for privileged roles.
- [ ] RLS verified with learner/instructor/owner negative cases.
- [ ] Instructor cannot grant owner membership.
- [ ] Cross-tenant cohort/module/lab references rejected.
- [ ] Learner cannot write authoritative attempt score.
- [ ] Certificate subject must belong to tenant.
- [ ] Backup/restore plan defined.

## 6. Privacy & analytics

- [ ] Session recording remains OFF.
- [ ] Consent UX reviewed.
- [ ] Remote analytics defaults OFF before consent.
- [ ] Event names match allowlist.
- [ ] Properties match allowlist.
- [ ] No raw mentor prompts in analytics.
- [ ] No message/email contents in analytics.
- [ ] No credentials/tokens/cookies in analytics.
- [ ] Data retention documented.
- [ ] Privacy Center accurately reflects implementation.

## 7. PostHog rollout

- [ ] `cca-premium-experience` evaluated as intended.
- [ ] `cca-ai-mentor-live` remains OFF until AI security gate passes.
- [ ] `cca-cyber-range-live` remains OFF until Range gate passes.
- [ ] Rollback owner identified.
- [ ] Rollback procedure tested.

## 8. AI Mentor gate

Before enabling `cca-ai-mentor-live`:

- [ ] provider configured outside repo;
- [ ] tenant/course/lab-scoped retrieval;
- [ ] prompt retention policy approved;
- [ ] product analytics excludes raw prompts;
- [ ] tool access absent or allowlisted;
- [ ] abuse/red-team tests complete;
- [ ] cost/token budgets configured;
- [ ] model failure/fallback behavior tested;
- [ ] local mentor fallback remains available.

## 9. Cyber Range gate

Before enabling `cca-cyber-range-live`:

- [ ] orchestrator deployed in separate infrastructure boundary;
- [ ] API accepts catalog `lab_id`, never arbitrary target parameters;
- [ ] approved image catalog;
- [ ] synthetic targets only;
- [ ] deny-egress validated technically;
- [ ] no production secrets/mounts/network;
- [ ] per-session identity/isolation;
- [ ] CPU/RAM/concurrency limits;
- [ ] hard TTL;
- [ ] automatic destroy;
- [ ] lifecycle audit logs;
- [ ] orphan cleanup/reaper tested;
- [ ] cost circuit breaker configured.

## 10. Commercial/operational

- [ ] Tenant branding approved by Cristian.
- [ ] Curriculum/content approved by instructor.
- [ ] Support contact/process defined.
- [ ] Customer onboarding flow documented.
- [ ] License/pricing decision recorded.
- [ ] Incident response owner defined.
- [ ] Release notes ready.

## Promotion decision

Only promote when all mandatory controls for the enabled feature set have evidence. Feature-gated capabilities do not block a release if they remain OFF and cannot be reached accidentally.
