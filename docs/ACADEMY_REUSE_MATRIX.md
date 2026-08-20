# Academy reuse matrix

| Capability | Crohnoz Academy source | Cristian strategy |
|---|---|---|
| Auth/session | Academy Django/DRF `/api/v1/auth/*` | Reuse via `academy-core.adapter.js` |
| Profile/onboarding | `/api/v1/me/` + Academy onboarding UX | Reuse model and flow; cyber-brand the presentation |
| Course catalog | Courses / learning paths API | Reuse as canonical academic catalog |
| Enrollment/progress | Enrollments + lesson progress | Reuse; remove browser-authoritative progress over time |
| Assessments | Server-graded assessment attempts | Reuse; browser never writes authoritative scores |
| Certificates | UUID issue/revoke/verify | Reuse academic certificate engine; add cyber metadata |
| Cohorts | Academic operations | Reuse for Cristian's client/company cohorts |
| Instructor scope | Cohort-scoped instructor access | Reuse; map Cristian to tenant instructor/owner role |
| Content Studio | draft → review → approved → published | Reuse for cyber course authoring/review |
| Audit | Academy AuditEvent | Reuse for academic mutations; keep cyber runtime audit separate |
| i18n | ES/EN Academy foundation | Reuse for bilingual cyber content |
| Design system | `prototype/design-system.css` | Extract tokens/components; apply Cristian cyber skin |
| Enterprise dashboard | `academy-enterprise-dashboard.css/js` | Reuse information architecture, not visual branding verbatim |
| Brand runtime | `academy-brand-runtime.js` + config | Generalize into tenant theme runtime |
| Audio/accessibility | `academy-audio.js`, reduced-motion UX | Reuse where applicable |
| Digital instructor | Academy avatar pipeline | Reuse pipeline architecture with Cristian-specific consent/assets |
| Mentor presentation | Instructor inside lesson; mentor on demand | Reuse pedagogy; connect Cyber Mentor retrieval/policy |
| Phishing Lab | — | Cristian-only cyber extension |
| Cyber Skill Graph | — | Cristian-only cyber extension |
| Cyber Range | — | Cristian-only isolated practice engine |
| Range orchestration | — | Separate service boundary; Academy tracks assignment/progress only |
| Cyber telemetry | — | Cristian/Crohnoz observability layer with minimization |

## Rule

**Generic education belongs in Academy Core. Specialized cyber practice belongs in Cristian Cyber Layer.**

Do not fork generic academic logic into Cristian unless a hard product requirement cannot be modeled by Academy Core.
