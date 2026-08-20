# Cristian Cyber Academy ↔ Academy Core Content Studio contract

## Verified source

This contract was checked against `Crohnoz/Crohnoz-academy` `main` on 2026-08-20, specifically the Django/DRF backend routes, serializers, viewsets and models.

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

The browser adapter now exposes these routes, but remote Content Studio remains disabled in Cristian until the tenant boundary described below is server-side.

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

## Critical tenant boundary

The verified Academy Core `Course`, `Module` and `Lesson` models are currently global academic content. Organization support exists for memberships/cohorts/operational context, but organization membership does not scope Content Studio rows.

That is acceptable for Crohnoz Academy's global catalog but is not sufficient to activate a customer white-label Content Studio without an explicit content ownership boundary.

Therefore Cristian config contains:

```js
academyCore: {
  enabled: false,
  apiBaseUrl: '',
  contentTenantScoped: false
}
```

### Release requirement

Before `contentTenantScoped` may become `true`, Academy Core must enforce the boundary server-side, for example through a dedicated tenant/content-space relation and queryset/serializer validation. A browser slug prefix or frontend filtering is **not** an authorization boundary.

Required server invariants:

- every mutable white-label content object belongs to an authorized content space/tenant;
- Studio querysets are scoped server-side to that content space;
- parent relationships cannot cross content spaces;
- transitions reject cross-tenant access;
- coordinator/admin authority is bounded to the intended Academy administrative scope;
- audit events preserve tenant/content-space identity;
- tests prove that a Cristian user cannot read, mutate, transition or delete another tenant's private drafts.

Until those invariants exist and pass tests, Cristian continues using local draft persistence and Academy Core remains disabled in this frontend.

## Deployment rule

None of this work changes the current Cristian demo deployment. Development remains on `dev/platform-functional-v1`; `main` and the frozen demo reference remain untouched until explicit approval.
