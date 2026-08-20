# Crohnoz Academy Core → Cristian Cyber Academy

## Decision

Cristian Cyber Academy should reuse **Crohnoz Academy as the academic core** instead of independently rebuilding generic LMS/platform capabilities.

Cristian remains a dedicated white-label cyber tenant/product with its own UX, cyber curriculum, Skill Graph, Phishing Lab, AI Cyber Mentor and isolated Cyber Range.

## Reuse boundary

### Reuse from Crohnoz Academy Core

- authentication/session lifecycle;
- academic profiles;
- learner/instructor/coordinator/admin roles;
- courses and learning paths;
- modules and lessons;
- enrollments and persistent progress;
- server-graded assessments and immutable grading evidence;
- certificate issuance, revocation and exact-code verification;
- cohorts and instructor scoping;
- Content Studio publication workflow;
- academic audit events;
- ES/EN/i18n foundation;
- academic export/integrity tooling;
- local Docker/PostgreSQL release gates.

### Reuse from Academy experience/tooling

- onboarding → home → learning path → lesson → practice → profile journey;
- reduced navigation and next-best-action pedagogy;
- instructor embedded in the lesson;
- mentor hidden until assistance is requested;
- responsive/reduced-motion principles;
- brand runtime/config pattern;
- digital instructor pipeline and audiovisual contract.

### Cristian-only Cyber Layer

- Mission Control cyber dashboard;
- Crohnoz Skill Graph specialized for cyber competencies;
- synthetic Phishing Lab;
- safe scenario engine;
- AI Cyber Mentor policy and cyber retrieval;
- Cyber Range catalog and orchestrator;
- lab manifest security constraints;
- attack/defend educational loop;
- cyber-specific readiness/risk signals;
- cyber evidence/reporting.

## Target architecture

```text
                    ┌──────────────────────────┐
                    │ Crohnoz Academy Core     │
                    │ Django + DRF + Postgres  │
                    ├──────────────────────────┤
                    │ Auth / Profiles          │
                    │ Courses / Paths          │
                    │ Progress / Assessments   │
                    │ Certificates / Cohorts   │
                    │ Content Studio / Audit   │
                    └─────────────┬────────────┘
                                  │ authenticated API
                    ┌─────────────▼────────────┐
                    │ Academy Core Adapter     │
                    │ Cristian tenant scope   │
                    └─────────────┬────────────┘
                                  │
             ┌────────────────────▼────────────────────┐
             │ Cristian Cyber Academy                  │
             │ white-label learner + instructor UX     │
             ├─────────────────────────────────────────┤
             │ Academy views / course player           │
             │ Phishing Lab                            │
             │ Skill Graph                             │
             │ AI Cyber Mentor                         │
             │ Cyber Range                             │
             │ Privacy / Evidence                      │
             └─────────────────────────────────────────┘
```

## Migration path

### Stage A — current premium demo

Keep current `localStorage` state as compatibility fallback.

### Stage B — Academy session adapter

Connect:

- `POST /api/v1/auth/token/`
- `POST /api/v1/auth/logout/`
- `GET/PATCH /api/v1/me/`
- `GET /api/v1/courses/`
- `GET /api/v1/learning-paths/`
- `GET/POST /api/v1/enrollments/`
- `GET/POST/PATCH /api/v1/lesson-progress/`
- `GET/POST /api/v1/assessment-attempts/`
- `GET /api/v1/certificates/`

The browser must never control assessment scores or authoritative evidence.

### Stage C — cyber specialization

Represent cyber curriculum in Academy's course/path/module/lesson model. Cyber labs remain external resources referenced by approved `lab_id`; Academy tracks their pedagogical assignment/progress while the separate Range Orchestrator controls runtime isolation.

### Stage D — Content Studio

Cristian/instructors author and review cyber lessons through the existing draft → review → approved → published workflow instead of hardcoding course content in the learner frontend.

### Stage E — digital instructor

Reuse Academy's avatar architecture:

```text
approved script / grounded AI answer
            ↓
        voice layer
            ↓
      face animation
            ↓
       lip-sync layer
            ↓
   approved video/audio asset
```

For Cristian, biometric references (portrait/voice) require explicit consent and must remain private source assets. Generated/approved delivery assets can be published only after review.

## Data ownership

Academy Core owns:
- identity;
- memberships/roles;
- academic catalog;
- enrollments;
- progress;
- assessments;
- certificates;
- academic audit.

Cristian Cyber Layer owns:
- cyber skill graph;
- phishing simulation outcomes;
- cyber lab session metadata;
- mentor interactions under minimization policy;
- range lifecycle evidence.

No cyber runtime secret or target belongs in Academy Core.

## Commercial consequence

This turns Crohnoz Academy into a reusable product kernel. Cristian Cyber Academy becomes the first specialized vertical/tenant rather than a separate LMS codebase. Future verticals can reuse the same academic engine with different curriculum, branding, instructor and specialized practice engines.
