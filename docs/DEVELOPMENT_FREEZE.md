# Demo freeze & development workflow

## Frozen demo

The demo currently intended for Cristian remains anchored to:

- branch: `main`
- commit: `bada1f423c03082b6dade27a174cf0679e697e09`
- immutable reference branch: `release/demo-cristian-2026-08-20`

No development work should be merged into `main`, promoted to production, or used to replace the current demo until Cristian has reviewed the existing demo and Crohnoz Labs explicitly approves a promotion.

## Active development branch

All product work after the freeze continues in:

`dev/platform-functional-v1`

The branch may receive commits, tests, documentation and refactors while the demo remains available.

## Promotion gate

Before a future merge/deploy:

1. Cristian confirms the demo direction.
2. Full local contract suite passes.
3. Desktop and mobile QA is completed.
4. Identity/role boundaries are reviewed.
5. Content Studio draft data is validated.
6. Security headers and CSP are rechecked.
7. No secrets, private biometric assets or production credentials are committed.
8. Academy Core backend connectivity is explicitly configured for the target environment.
9. A final compare against the frozen demo is reviewed.
10. Only then may `main` be updated and a deployment promoted.

## Current development focus

The first post-freeze increment introduces Content Studio: course metadata, modules, lessons, draft/review workflow, local persistence, learner preview, role gating and PWA shell integration. Remote publication remains intentionally disabled until Academy Core is connected and validated.
