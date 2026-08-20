# Cristian Cyber Academy · XML Content Format v1

## Purpose

The Academy uses XML as a portable human-readable exchange format for course content. XML is an import/export format for Content Studio; it is not an authorization boundary and it never bypasses Academy Core workflow rules.

## Root

```xml
<academy tenant="cristian-demo" version="1">
  ...
</academy>
```

Supported hierarchy:

```text
academy
└── course[]
    ├── title
    ├── summary
    └── module[]
        ├── title
        ├── objective
        └── lesson[]
            ├── title
            └── body
```

### Course attributes

- `id`: optional portable identifier.
- `slug`: course slug.
- `level`: `foundation`, `intermediate`, or `advanced`.
- `locale`: `es` or `en`.
- `workflow`: only `draft` or `review` is accepted by the browser importer. Publication remains server-governed.

### Module attributes

- `id`: optional portable identifier.
- `order`: visual order. Import currently follows document order as the authoritative sequence.

### Lesson attributes

- `id`: optional portable identifier.
- `order`: visual order. Import currently follows document order.
- `type`: `lesson`, `quiz`, `lab`, or `video`.
- `duration`: estimated minutes, clamped to 1–240.

## Security contract

The browser importer is deliberately restrictive:

- maximum XML size: 2 MB;
- maximum 100 courses per import;
- maximum 40 modules per course;
- maximum 80 lessons per module;
- `DOCTYPE` is rejected;
- `ENTITY` declarations are rejected;
- malformed XML is rejected;
- unknown lesson types fall back to `lesson`;
- imported objects never receive remote IDs or authoritative server status;
- imported content lands in local draft storage and must pass the normal review/publish workflow later.

This prevents the XML exchange layer from becoming a shortcut around tenant scope, RBAC, assessment authority, or publication controls.

## Docker runtime

Run the same frontend locally with:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:8080
```

The container runs Nginx on port 8080, is configured read-only, drops Linux capabilities by default, uses `no-new-privileges`, and exposes a healthcheck.

## No AI agent

This product line explicitly sets `automation.aiAgentEnabled = false`. No AI mentor or autonomous publishing capability is part of the Cristian Academy runtime. Content organization is human-operated through Content Studio and XML exchange.
