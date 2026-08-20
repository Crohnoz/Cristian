# Cristian Cyber Academy v1 — End-to-End Readiness

Release candidate: `1.0.0-rc.1`

This document is the release checklist for the commercial/demo v1 shown to Cristian. It separates verified source invariants from checks that require a successful Vercel production build and external browser validation.

## 1. Public boundary

Expected production entry:

```text
/                 public showcase
/showcase.html    public showcase alternate
/auth.html        campus access
```

Release requirements:

- root is generated from `showcase.html`;
- public showcase does not load `auth.session.js`, Student 360, Identity Ops, Teacher Intranet or Operations Console code;
- no learner identities, cohort rosters, progress records or private operational telemetry appear in the public facade;
- no RawGit/GitHack/raw GitHub proxy is allowed in production.

## 2. Learner journey

Expected path:

```text
Public showcase
→ Login
→ First-run onboarding
→ Mission Control
→ Academy
→ Course
→ Lesson / Live / Awareness / Lab / Quiz
→ Container Labs
→ Mi Progreso / Skill Graph
→ Certificate
→ Account / Privacy
```

Container Lab previews:

```text
/container-lab.html   OWASP Juice Shop · Web Security
/api-lab.html         VAmPI · API Security / OpenAPI 3
```

Release requirements:

- first authenticated learner without `cca:onboarding:v1` lands on `/onboarding.html`;
- onboarding accepts only learning preferences and stores no credentials or sensitive content;
- dashboard learner links point to `/progress.html`, not Student 360;
- lesson links use the current `mode=` contract;
- certificate requires an authenticated campus session;
- certificate dynamic criteria render via DOM/textContent, not dynamic `innerHTML`;
- mobile navigation and Command Palette route learner progress to `/progress.html`;
- both Container Lab previews require an authenticated campus session.

## 3. Container Labs

The v1 RC integrates **visual/interactive previews only**. It does not publish vulnerable Docker containers to the Internet.

Allowlisted labs live in `content/container-labs.json`:

- OWASP Juice Shop → `bkimminich/juice-shop:20.2.0`;
- VAmPI → `brightsec/vampi:latest`.

Required RC invariants:

- `runtimeEnabled: false`;
- `ephemeral: true`;
- `networkPolicy: deny-egress`;
- synthetic/dummy data policy;
- `status: preview-only`.

The future launcher must run outside the frontend/backend trust domain, with per-session instances, quotas, short TTL, no production secrets, no Docker socket exposure and no access to production/admin networks. See `docs/CONTAINER_LABS.md`.

## 4. Teacher / coordinator journey

Expected path:

```text
Login
→ Teacher Intranet
→ Today / Agenda
→ Cohorts
→ Student signals
→ Content
→ Teaching insight
```

Advanced tools:

```text
/instructor.html   Operations Console
/student.html      Student 360 · coordinator/admin
/users.html        Identity Ops · coordinator/admin
/studio.html       Content Studio · author/coordinator/admin
```

Release requirements:

- teaching roles default to Teacher Intranet;
- Teacher Intranet remains separate from advanced Operations Console;
- `learner` cannot enter Teacher Intranet, Student 360 or Identity Ops;
- `instructor` does not receive identity-administration privileges;
- `coordinator/admin` can access Student 360 and Identity Ops.

## 5. Security and privacy

Source checks included in the v1 release gate:

- CSP and `X-Content-Type-Options: nosniff` present;
- framing denied;
- Permissions Policy present;
- COOP/CORP present;
- public preview has no real secrets;
- no obvious private-key, GitHub token or OpenAI project-key patterns in the runtime bundle;
- phishing identities and domains remain synthetic;
- public learner dashboard contains no raw operational scan command examples;
- live Cyber Range remains feature-gated;
- Container Lab runtime remains disabled in the public RC;
- remote analytics default OFF;
- session recording OFF;
- mentor questions are persisted only as a coarse `topic_category` through `privacy-hardening.js`;
- Service Worker does not cache failed responses.

## 6. Production build

Vercel configuration:

```text
buildCommand: npm run build
outputDirectory: dist
```

`npm run build` performs:

1. `npm test`
2. `tests/v1-e2e-release.mjs`
3. local runtime/RBAC/link/cache/security validation
4. Container Lab allowlist/isolation validation
5. generation of a reduced `dist/` public artifact
6. promotion of `showcase.html` to `/index.html`
7. preservation of the authenticated legacy learning shell at `/lab.html`

A failed release gate must block the deployment.

## 7. Service Worker / stale-version control

v1 RC cache namespace:

```text
cca-shell-v21-container-labs
```

Required behaviors:

- old cache namespaces are deleted on activation;
- onboarding, Teacher Intranet, certificate, privacy hardening and Container Labs are precached;
- failed HTTP responses are not inserted into cache;
- `/sw.js` is served with revalidation headers.

## 8. Release status

### Source review — completed in current pass

- [x] Public/private topology reviewed.
- [x] Learner vs Student 360 navigation corrected.
- [x] Lesson route contract normalized.
- [x] Teacher Intranet separated from Operations Console.
- [x] Onboarding added.
- [x] Certificate auth bootstrap fixed.
- [x] Certificate dynamic `innerHTML` removed.
- [x] Mentor prompt-fragment persistence hardened.
- [x] Production raw-code proxies prohibited.
- [x] Vercel build gate added.
- [x] Service Worker namespace/cache policy refreshed.
- [x] Production root changed to public showcase at build time.
- [x] Legacy shell isolated at `/lab.html` and protected.
- [x] OWASP Juice Shop Container Lab preview added.
- [x] VAmPI API Container Lab preview added.
- [x] Container Lab runtime kept disabled / ephemeral / deny-egress by contract.
- [x] README / release documentation aligned to v1.

### Requires deployment execution

- [ ] Vercel executes `npm test` successfully.
- [ ] Vercel executes static artifact build successfully.
- [ ] Production domain responds at `/` with public showcase.
- [ ] `/auth.html` is publicly reachable without Vercel collaborator access.
- [ ] learner login succeeds and first-run onboarding is shown.
- [ ] learner can navigate dashboard → catalog → course → lesson → progress → certificate.
- [ ] learner can open Juice Shop and VAmPI previews from Academy.
- [ ] coordinator login lands on Teacher Intranet.
- [ ] coordinator can open Operations Console / Student 360 / Identity Ops.
- [ ] unauthenticated request to a campus route redirects to Academy login.
- [ ] responsive smoke check completed for desktop and mobile widths.
- [ ] no 403 / HTML-as-text / RawGit redirect remains.

Do not label the candidate `1.0.0` final until all deployment execution checks above are green.

## 9. Explicit boundaries of v1

This v1 is a polished commercial/demo product. It deliberately does **not** claim the following as production-complete:

- remote Crohnoz Academy Core persistence;
- MFA/step-up authentication;
- real multi-user server-side data plane;
- real Cyber Range orchestration;
- live Container Lab Launcher;
- autonomous content publication;
- handling of production secrets in this public repository.

Those capabilities stay behind backend/security gates and can be introduced without changing the v1 information architecture.
