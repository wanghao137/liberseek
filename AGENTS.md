# LiberSeek Dragon Scale Studio - Agent Guide

These instructions apply to work inside `D:\codesolo\liberseek`.

## Project Intent

This project is a digital creation tool for dragon scale binding, also known as
xuanfeng binding. It should help users upload scroll artwork and page images,
lay them out as a dragon scale artwork, preview the structure, export printable
assets, and preserve editable project files.

The project priorities are:

1. Accurate binding geometry and craft rules.
2. Reliable printable exports.
3. Clear editing experience.
4. Local-first project storage.
5. Account, cloud, payment, and service workflows only after the local tool is
   useful.

## Reference Boundary

Dayu is a public reference for product shape, terminology, and feasibility.
Do not copy Dayu source code, private implementation details, hard-coded keys,
branding, visual identity, paid-flow wording, or commercial mechanics.

Dragon scale binding and xuanfeng binding are traditional craft concepts and may
be implemented independently. Treat modern patent or product details as risk
and research signals, not as copyable design.

## Working Rules

- Read the real repo state before changing files.
- Keep changes scoped to this project.
- Do not commit, push, deploy, publish, or initialize external services unless
  the user explicitly asks.
- Do not introduce login, payment, order, cloud sync, template marketplace, or
  print-service back office unless the current task explicitly requires it.
- Prefer reversible local files and documented decisions over hidden setup.
- Do not claim frontend-only encryption prevents asset extraction. Use precise
  language such as project package, password protection, or local archive.
- Keep Chinese product terminology consistent, but source code identifiers should
  stay ASCII unless an existing file already requires otherwise.

## MVP Scope

The MVP must support:

- New project creation and size presets.
- Front scroll image, back scroll image, and inner page image upload.
- Batch upload for inner pages.
- Page ordering, replacement, and removal.
- Per-image crop, scale, rotation, and position transforms.
- Dragon scale binding geometry calculation.
- A 2D WYSIWYG layout surface.
- Local draft persistence.
- Project import and export.
- High-resolution image package export.
- PDF export.
- README assembly instructions export.

The MVP must not include:

- Account login.
- Payment or subscription.
- Order management.
- Cloud project storage.
- Community publishing.
- Template marketplace.
- Print fulfillment operations.
- DRM-style promises.

## Technical Direction

Default stack:

- Vite.
- React.
- TypeScript.
- Zustand for editor state.
- Dexie and IndexedDB for local projects and image blobs.
- Canvas 2D for the first editor and printable rendering path.
- Three.js with react-three-fiber for later 3D preview.
- JSZip or fflate for project and export packages.
- jsPDF or pdf-lib for PDF export.
- Vitest for geometry and export logic.
- Playwright for browser verification.

Use centimeters as the canonical design unit. Convert to pixels only at render
and export boundaries with an explicit DPI.

## Architecture Boundaries

Keep these module boundaries:

- `binding`: geometry, dimension conversion, craft rules, page placement.
- `assets`: image upload, decode, validation, and local blob handling.
- `editor`: 2D editing surface and interaction.
- `preview`: page flip and scroll preview.
- `export`: PNG, PDF, ZIP, and README generation.
- `project`: project schema, import, export, and version migration.
- `recorder`: screen recording and watermarking after the MVP export path works.

Geometry and export planning must be pure functions where possible. React
components consume calculated layouts; they should not own binding math.

## Craft Accuracy

Always distinguish these terms:

- Artwork height.
- Scroll artwork length.
- Visible page width.
- Physical page width.
- Paste width.
- Slice or exposed width.
- Leaf count.
- Page structure count.
- Scroll margin.
- Print DPI.
- PDF physical page size.

Before changing export behavior, check:

- Image resolution requirements.
- Physical page size.
- PDF size and orientation.
- Leaf count and frame count.
- Paste width and slice width validity.
- Project export/import round trip.
- README instructions versus actual generated assets.

## Quality Gates

For code changes, run relevant gates exposed by the repo:

- TypeScript typecheck.
- Lint.
- Unit tests.
- Build.
- Playwright browser check.

Frontend changes should be checked at desktop and mobile widths. Use `390x844`
as one default mobile viewport.

Export changes must verify:

- Image package downloads and extracts.
- PDF physical dimensions are correct.
- Project import/export round trip preserves settings and transforms.
- README parameters match generated assets.

If a gate is skipped, report the reason.

## Documentation First

Before initializing the implementation project, establish these docs:

- `docs/product-plan.md`.
- `docs/craft-spec.md`.
- `docs/export-spec.md`.

These docs define the product, craft model, and export contract. Keep them
updated when implementation decisions change the project baseline.

## Security And Secrets

- Do not write real API keys, tokens, passwords, cookies, or bearer credentials
  into code, docs, examples, or chat.
- Keep secrets in ignored `.env.local` files or provider-managed secret stores.
- If project password protection is added, derive keys from user-provided
  passphrases. Never use hard-coded shared encryption keys.
- Treat credentials committed to git history as exposed and require rotation.
