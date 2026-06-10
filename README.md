# Dragon Scale Studio

Dragon Scale Studio is a local-first web tool for planning dragon scale binding
artworks. The current baseline includes:

- Project planning docs.
- A React/TypeScript/Vite app shell.
- A first binding geometry module.
- Unit tests for derived dimensions, leaf placement, pixel conversion, and
  validation.
- A working first-screen geometry workspace.

## Development

Install dependencies:

```sh
npm install
```

Start the dev server:

```sh
npm run dev
```

Run verification:

```sh
npm test
npm run lint
npm run build
```

## Project Docs

- `AGENTS.md`: project operating rules for agent work.
- `docs/product-plan.md`: product scope and implementation phases.
- `docs/craft-spec.md`: dragon scale binding geometry and craft terms.
- `docs/export-spec.md`: project, image, PDF, README, and manifest export
  contracts.

## Current Implementation

The implementation starts with `src/modules/binding/geometry.ts`. It keeps the
binding math separate from React so editor, preview, and export code can reuse
the same tested formulas.
