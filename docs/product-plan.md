# Dragon Scale Studio Product Plan

Status: planning baseline

## Summary

Dragon Scale Studio is a local-first web application for creating dragon scale
binding artworks. Users upload a front scroll image, a back scroll image, and a
sequence of inner page images. The app calculates the binding structure,
provides an editable visual layout, previews the page/scroll effect, and exports
printable files plus an editable project package.

The first product milestone is not a commercial platform. It is a reliable
creation tool that proves the craft geometry, printable export path, and project
round trip.

## Goals

- Make dragon scale binding layout approachable for artists, designers, craft
  educators, and hobbyists.
- Replace manual offset calculation with deterministic layout rules.
- Preserve the craft model: scroll base, leaves, paste area, visible area, and
  exposed slices.
- Export assets that can be printed and assembled.
- Keep the first version usable without login, network storage, payment, or
  backend services.

## Non-Goals

The MVP will not include:

- User accounts.
- Payment, membership, or subscriptions.
- Cloud project sync.
- Order management or print fulfillment.
- Public community publishing.
- Template marketplace.
- DRM or hard-to-extract project protection claims.
- AI image generation as a required workflow.

These can be explored after the local workflow is useful and verified.

## Reference Findings

Public Dayu documentation confirms the feasibility of this product shape:

- A browser-based editor can upload a front scroll image, a back scroll image,
  and inner page illustrations.
- Default craft parameters can be expressed in physical units such as canvas
  height, page width, and slice width.
- Exports can include project files, frame images, PDF files, and assembly
  instructions.
- Recording and watermarking are useful but should follow the editing/export
  foundation.

The Dayu application bundle also shows a feasible browser stack: React,
Zustand, IndexedDB, ZIP packaging, PDF generation, image cropping, and Three.js
preview. This project should use those as feasibility signals, not as source
code to copy.

## Primary Users

### Craft Creator

Creates physical dragon scale binding artworks. Needs accurate print dimensions,
assembly order, and clear warnings when source images are too small.

### Visual Designer

Creates digital showcases and client previews. Needs strong crop controls,
quick previews, and exportable images/video.

### Educator or Exhibition Producer

Uses the app to explain how dragon scale binding works. Needs readable visual
structure, presets, and predictable demonstration files.

## Product Principles

1. Physical correctness before visual flourish.
2. Local-first by default.
3. Every layout value should be explainable in centimeters.
4. The export contract is part of the product, not an afterthought.
5. Advanced features should not make basic craft setup harder.

## MVP User Flow

1. User opens the app and creates a new project.
2. User selects or accepts a size preset.
3. User uploads:
   - front scroll image,
   - back scroll image,
   - inner page images.
4. User reorders inner pages if needed.
5. User adjusts crop, scale, rotation, and position.
6. User reviews a 2D WYSIWYG layout.
7. User runs export checks.
8. User exports:
   - editable project package,
   - high-resolution image package,
   - PDF,
   - README assembly instructions.
9. User reopens the project package and verifies the layout is preserved.

## MVP Functional Requirements

### Project Setup

- Create a project from default preset.
- Edit title, canvas height, visible page width, paste width, slice width, leaf
  count, edge style, and export DPI.
- Show derived dimensions immediately.
- Warn when values are outside safe bounds.

### Asset Management

- Upload front scroll image.
- Upload back scroll image.
- Batch upload inner page images.
- Reorder inner pages.
- Replace and remove any image.
- Store source images locally in IndexedDB.
- Keep stable asset IDs so transforms survive reordering.

### Image Adjustment

- Support crop, scale, rotate, and drag.
- Store non-destructive transforms.
- Provide a reset action per image.
- Show the paste area separately from visible content.

### 2D Editor

- Render the scroll base and leaves using calculated geometry.
- Show page boundaries, paste area, visible area, and exposed slice offsets.
- Support zoom and pan.
- Keep edit controls usable on desktop and mobile.

### Export

- Export a project package that can be imported later.
- Export print-ready images.
- Export PDF.
- Export README instructions.
- Show export progress and cancellation.
- Release large temporary canvases after each generated page.

## Later Features

### Preview

- Interactive page flip preview.
- Scroll/roll preview.
- Optional 3D preview with react-three-fiber.

### Recording

- Clean canvas recording.
- Direct window recording.
- Watermark text and position settings.

### Templates

- Classical scroll preset.
- Illustration book preset.
- Photography sequence preset.
- Education/demo preset.

### Commercial Layer

- Cloud projects.
- Customer review links.
- Paid high-resolution export.
- Print and assembly service order flow.

## Technical Baseline

- Vite, React, TypeScript.
- Zustand for state.
- Dexie/IndexedDB for local projects and blobs.
- Canvas 2D for editor and print render path.
- JSZip or fflate for project/export packages.
- jsPDF or pdf-lib for PDF.
- Vitest for geometry/export tests.
- Playwright for browser checks.

## Implementation Phases

### Phase 0: Planning and Craft Baseline

Deliverables:

- Project guide.
- Product plan.
- Craft spec.
- Export spec.
- Basic test image set.

Exit criteria:

- Terms and formulas are stable enough to implement.
- Export package contents are defined.
- Known non-goals are documented.

### Phase 1: Local Editor Foundation

Deliverables:

- Vite/React/TypeScript app.
- Project state model.
- Asset upload and IndexedDB storage.
- 2D layout renderer.
- Basic crop/scale/drag transforms.

Exit criteria:

- User can create a project, upload assets, arrange pages, refresh, and recover
  the draft locally.

### Phase 2: Printable Export

Deliverables:

- Project package import/export.
- High-resolution frame image export.
- PDF export.
- README export.
- Export validation checks.

Exit criteria:

- Project export/import round trip is lossless for settings, assets, and
  transforms.
- PDF and image exports use correct physical dimensions.

### Phase 3: Preview and Polish

Deliverables:

- Page flip preview.
- Scroll preview.
- Responsive editor layout.
- Error and empty states.
- Initial visual polish.

Exit criteria:

- App is usable at desktop and `390x844` mobile viewport.
- Preview confirms the same geometry as export.

### Phase 4: Optional Product Expansion

Deliverables depend on user approval:

- Recording.
- Watermarking.
- Templates.
- Cloud/account/commercial layer.

## Risks

### Print Accuracy

Risk: screen layout looks correct but printed assets do not assemble correctly.

Mitigation: keep centimeters as canonical units, generate calibration pages, and
test PDF physical dimensions.

### Browser Memory

Risk: high-resolution images and 300 DPI exports exhaust memory.

Mitigation: render pages one at a time, cap image sizes, use progress/cancel
controls, and release canvases.

### Misleading Security Claims

Risk: frontend-only encrypted project files are marketed as copy-proof.

Mitigation: avoid DRM claims. Use optional password protection only with
user-provided passphrases.

### Scope Creep

Risk: payment, cloud, AI, templates, and recording delay the core tool.

Mitigation: keep these outside MVP unless explicitly approved.

## Acceptance Criteria

- A test project with one front scroll image, one back scroll image, and 23 inner
  pages can be created.
- Changing slice width updates page placement and export dimensions.
- Project package export and import preserve settings, assets, order, and
  transforms.
- Image package contains deterministic frame names and assembly metadata.
- PDF dimensions match configured centimeter values.
- README values match exported assets.
- App builds successfully.
- Geometry unit tests cover default and edge-case dimensions.
- Browser check covers desktop and `390x844` mobile width.

## Research Links

- Dayu docs: https://dayu.liberseek.com/docs/
- Dayu quick start: https://dayu.liberseek.com/docs/guide/getting-started.html
- Dayu binding specs: https://dayu.liberseek.com/docs/guide/binding-specs.html
- Dayu editor docs: https://dayu.liberseek.com/docs/guide/editor.html
- Dayu import/export docs:
  https://dayu.liberseek.com/docs/guide/export-import.html
- Dayu recording docs: https://dayu.liberseek.com/docs/guide/recording.html
- Dayu parameter docs: https://dayu.liberseek.com/docs/guide/specs.html
- Palace Museum xuanfeng binding entry:
  https://www.dpm.org.cn/lemmas/242384.html
