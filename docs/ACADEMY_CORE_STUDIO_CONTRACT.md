# Cristian Cyber Academy ↔ Academy Core Content Studio contract

## Verified source

This contract was checked against `Crohnoz/Crohnoz-academy` on 2026-08-20, specifically the Django/DRF backend routes, serializers, viewsets and models.

Cristian must not invent a second LMS. The white-label product consumes the existing Academy Core and adds its cyber-specific experience on top.

## Verified endpoints

Authenticated Content Studio resources:

- `GET/POST /api/v1/studio/competencies/`
- `GET/POST /api/v1/studio/courses/`
- `GET/PATCH/DELETE /api/v1/studio/courses/<id>/`
- `POST /api/v1/studio/courses/<id>/transition/`
- `GET/POST /api/v1/studio/learning-paths/`
- `GET/PATCH/DELETE /api/v1/studio/learning-paths/<id>/`
- `POST /api/v1/studio/learning-paths/<id>/transition/`
- `GET/POST /api/v1/studio/modules/`
- `GET/PATCH/DELETE /api/v1/studio/modules/<id>/`
- `GET/POST /api/v1/studio/lessons/`
- `GET/PATCH/DELETE /api/v1/studio/lessons/<id>/`
- `GET/POST /api/v1/studio/assessments/`
- `GET/PATCH/DELETE /api/v1/studio/assessments/<id>/`

Learner persistence routes used by the Cristian adapter:

- `GET/POST /api/v1/enrollments/`
- `GET/POST/PATCH /api/v1/lesson-progress/`
- `GET/POST /api/v1/assessment-attempts/`
- `GET /api/v1/certificates/`

## Verified editorial workflow

Academy Core owns publication state:

```text
DRAFT -> REVIEW -> APPROVED -> PUBLISHED -> ARCHIVED
           |           |
           -> DRAFT    -> DRAFT
ARCHIVED -> DRAFT
```

Rules enforced by the backend:

- authors create/edit only their own draft content;
- reviewers cannot create/edit content and cannot publish;
- a reviewer cannot approve content they own;
- coordinators/admins execute allowed publication transitions;
- direct editing is rejected after content leaves `draft`;
- course/path transitions are transactional and revision-aware;
- publication is never implemented by PATCHing `status` directly.

Cristian Studio therefore only offers:

1. local draft authoring;
2. explicit draft synchronization when Core is safely enabled;
3. explicit `draft -> review` submission;
4. read-only UI once the authoritative Core status is not `draft`.

The Cristian frontend intentionally has no direct `approved` or `published` action.

## Field mapping

### Course

Cristian local model → Academy Core:

- `slug` → `slug`
- `title` → `title_es` + `title_en` compatibility value until the bilingual authoring UI lands
- `summary` → `description_es` + `description_en`
- `foundation` → Core `initial`
- `intermediate` → `intermediate`
- `advanced` → `advanced`
- calculated lesson minutes → `duration_minutes`

### Module

- parent remote course ID → `course`
- generated slug → `slug`
- title → `title_es` + `title_en`
- visual ordering → `order`

The current Academy Core `Module` model has no objective/description field. Cristian therefore keeps `module.objective` as local presentation metadata and must not pretend it has been persisted remotely.

### Lesson

- parent remote module ID → `module`
- generated slug → `slug`
- title → `title_es` + `title_en`
- body → `body_es` + `body_en`
- local `lesson` → Core `lesson`
- local `lab` → Core `practice`
- local `video` → Core `resource`
- local `quiz` → Core `assessment` lesson kind
- order → `order`
- duration → `estimated_minutes`

Assessment answer keys/configuration remain server-owned through `/studio/assessments/`. A quiz lesson is not considered complete authoring until its assessment configuration exists and passes backend validation.

## Tenant boundary implementation

The backend work is isolated in:

```text
Crohnoz/Crohnoz-academy
branch: feat/content-tenant-scope-cristian
```

It is **not merged or deployed** yet.

The branch introduces server-side organization ownership for `Course` and `LearningPath`. Modules, lessons, assessments, enrollments, progress and certificates inherit scope through their parent course. The API resolves the active content space from:

```http
X-Academy-Organization: <organization-slug>
```

Cristian declares the expected slug separately:

```js
academyCore: {
  enabled: false,
  apiBaseUrl: '',
  contentTenantScoped: false,
  organizationSlug: 'cristian-demo'
}
```

The adapter only adds the custom header to tenant-sensitive academic/catalog/Studio calls. Login, `/me`, password lifecycle and global operations remain outside this transport.

### Backend invariants implemented in the feature branch

- organization content links are server-side relations, not browser prefixes;
- white-label catalog queries return only content linked to the active organization;
- requests without organization context continue to see only global Academy content;
- non-members cannot enter another organization content space;
- global `admin` may enter an organization only when explicitly selecting its slug;
- course/path creation links the new object atomically to the active organization;
- modules, lessons and assessments reject cross-tenant parents;
- learner enrollment/progress/assessment queries inherit the same content scope;
- deleting a scoped draft removes its ownership relation transactionally;
- organizations with linked content cannot be deleted and silently turn private content global;
- tenant coordinators can read the reusable global competency catalog but cannot mutate it;
- organization identity is included in dedicated content-scope audit events;
- CORS explicitly permits `X-Academy-Organization`.

Tests covering these boundaries are present on the backend feature branch, but this document does **not** mark the release gate green until the Django/PostgreSQL suite is executed successfully.

## Fail-closed frontend behavior

`academy-core.adapter.js` now rejects a tenant-sensitive call with `CONTENT_SCOPE_NOT_CONFIGURED` unless both conditions are true:

1. `contentTenantScoped === true`;
2. an explicit `organizationSlug` is available.

This prevents an accidental backend URL change from silently falling back to global academic content.

## Activation sequence

Do not activate remote Academy Core merely because the code exists. The sequence is:

1. run Academy Core Django tests including `test_content_scope.py`;
2. run migration drift checks and the PostgreSQL gate;
3. review the tenant feature branch and merge it independently;
4. deploy Academy Core to a staging app server with explicit CORS origin for the Cristian staging frontend;
5. create/verify organization `cristian-demo` server-side;
6. add intended users as organization members without changing Academy RBAC implicitly;
7. verify login + scoped catalog + Studio draft + `draft -> review` + learner enrollment/progress;
8. only then set Cristian development/staging config to `contentTenantScoped: true`, configure an API URL and enable Academy Core;
9. production remains blocked until Cristian approves the visible demo and the normal release checklist is completed.

## Deployment rule

None of this work changes the current Cristian demo deployment. Development remains on `dev/platform-functional-v1`; `main` and the frozen demo reference remain untouched until explicit approval.
