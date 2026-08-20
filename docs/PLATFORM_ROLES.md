# Cristian Cyber Academy — Platform Surfaces & Roles

## Product topology

Cristian Cyber Academy should operate as three clearly separated surfaces that share branding and design language but not authorization boundaries.

## 1. Public Site / Showcase

**Audience:** prospects, students before enrollment, companies, partners, invited viewers.

**Authentication:** none.

**Purpose:** explain and sell the Academy experience without exposing private academic or operational information.

### Public content

- instructor profile and generic/public-safe avatar;
- Academy positioning and methodology;
- selected courses and learning paths;
- sample lesson formats: video, live, replay, simulation, lab, quiz;
- screenshots / synthetic examples;
- certification model;
- FAQs and contact / access CTA;
- public schedule examples if explicitly intended for publication.

### Never public

- learner identities;
- cohort rosters;
- individual progress;
- Student 360;
- private instructor notes;
- operational audit events;
- tokens, cookies, reset/invitation secrets;
- sensitive lab payloads;
- real Range infrastructure details.

## 2. Student Campus / Student Intranet

**Audience:** authenticated learners.

**Primary role:** `learner`.

### Main surfaces

- Mission Control;
- Academy catalog and enrolled paths;
- Course workspace;
- Lesson Player;
- live-class schedule and join flow;
- replays;
- defensive/synthetic labs;
- quizzes and assessments;
- resources;
- Skill Graph;
- individual progress;
- achievements;
- certificates;
- account and privacy controls;
- learner support.

### Core student journey

1. Activation / login.
2. Onboarding.
3. Mission Control.
4. Assigned/enrolled course.
5. Mixed-format learning week.
6. Assessment/lab evidence.
7. Feedback.
8. Skill Graph update.
9. Next Best Action.
10. Certification.

## 3. Teacher / Operations Intranet

**Audience:** instructors, coordinators and administrators.

### `instructor`

Can:
- teach;
- access assigned cohorts/learners when server scope exists;
- view relevant academic evidence;
- run live sessions;
- manage teaching content within granted scope;
- create teaching notes/interventions when backend contract exists.

Cannot by default:
- administer all identities;
- assign privileged roles;
- suspend accounts;
- access unrelated tenants/cohorts.

### `coordinator`

Includes teaching capabilities plus:
- manage users within tenant policy;
- invitations;
- cohort management;
- Student 360;
- enrollment operations;
- reports;
- lifecycle suspend/reactivate for allowed roles;
- content oversight.

Cannot:
- elevate to admin unless policy explicitly permits it;
- bypass tenant scope;
- suspend own identity.

### `admin`

Tenant-level administration:
- identity and role administration;
- cohort and enrollment operations;
- lifecycle controls;
- reporting/audit access;
- platform settings;
- content governance.

High-impact actions should require MFA/step-up in production.

### Optional specialist roles

`author`:
- create/edit educational content;
- no learner administration by default.

`reviewer`:
- review/approve content;
- no learner administration by default.

## Shared design, separated boundaries

All surfaces should reuse:
- brand system;
- typography;
- navigation grammar;
- course artwork system;
- cards/panels;
- status colors;
- responsive rules.

But public, learner and staff applications must maintain separate authorization and data contracts.

## Recommended URL model

Public:
- `/`
- `/academy`
- `/courses/<slug>`
- `/methodology`
- `/instructor`
- `/access`

Authenticated campus:
- `/campus`
- `/campus/course/<id>`
- `/campus/lesson/<id>`
- `/campus/live`
- `/campus/progress`
- `/campus/certificates`
- `/campus/account`

Staff:
- `/staff`
- `/staff/cohorts`
- `/staff/students`
- `/staff/student/<id>`
- `/staff/content`
- `/staff/live`
- `/staff/reports`
- `/staff/users`

The current static preview may retain legacy `.html` routes while the production router converges on this model.

## Public demo policy

The shareable commercial demo should never depend on a viewer having a Vercel or Academy account. If the viewer wants to inspect the student or teacher experience, provide one of two modes:

1. **Guided public simulation:** static/synthetic screens with no private data and no authentication.
2. **Demo tenant login:** explicit synthetic demo credentials, isolated from production identities.

For sales/shareability, guided public simulation is the preferred default.
