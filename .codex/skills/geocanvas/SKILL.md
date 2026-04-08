---
name: geocanvas
description: Use this skill when working with the GeoCanvas library in this repository, especially to generate examples, integrations, docs, demos, or feature work that should follow the library's preferred public API patterns and published package shape.
---

# GeoCanvas Skill

Use this skill when the task is about integrating, documenting, extending, or demonstrating GeoCanvas.

## First Checks

- Read [`README.md`](../../../README.md) for the quickstart and package-level positioning.
- Read [`docs/recipes.md`](../../../docs/recipes.md) for canonical integration patterns.
- Read [`docs/api-reference.md`](../../../docs/api-reference.md) only for exact option names, method signatures, and input shapes.
- Read [`docs/behavior-reference.md`](../../../docs/behavior-reference.md) when behavior details matter, such as hover semantics, drilldown visibility, tooltips, projections, or hit-testing.

## Preferred Patterns

- For the simplest single-dataset example, use `setGeoJSON(...)`.
- When multiple thematic layers share the same geometry, use `setSources(...)` plus `setLayers(...)`.
- Put joined app data in `regions` and connect presentation through `bindings`.
- Use layer-owned `markers` when marker visibility should follow the layer.
- Use global `setMarkers(...)` only when markers are intentionally outside layer visibility.
- For generic examples, prefer `projection: 'mercator'` unless a country-specific composite projection or `globe` is the point of the example.
- For drilldowns, prefer declarative layer visibility via click interaction defaults instead of custom imperative glue when the built-in behavior is sufficient.

## Packaging And Imports

- For published usage, import from `@saltusdev/geocanvas`.
- The explicit built bundle subpath is `@saltusdev/geocanvas/dist/geocanvas.min.js`.
- Do not suggest `src/` imports for package consumers.
- When editing package-facing docs or examples, keep them aligned with the dist-based published entrypoints in `package.json`.

## Example Conventions

- Include explicit container sizing in HTML examples so the map can render visibly.
- Keep layer ids, marker ids, and region ids explicit.
- Prefer compact but realistic GeoJSON examples over placeholders with omitted coordinates.
- Prefer tooltip templates and binding functions over undocumented ad hoc fields.
- When showing event handling, use `featureclick`, `markerclick`, and `zoomend` unless another event is specifically relevant.

## Documentation Guidance

- Treat `README.md` as the first-stop quickstart.
- Treat `docs/recipes.md` as the canonical source for copy-pasteable patterns.
- Treat `docs/api-reference.md` and `docs/behavior-reference.md` as canonical truth for details and edge cases.
- If you add or change a public-facing pattern, update docs and examples together so agents and humans see one consistent story.

## Validation

- Run `npm test` after meaningful library changes.
- Run `npm run build` after changes that affect the published bundle or package examples.
- When package shape or publish contents change, verify with `npm pack --dry-run --cache /tmp/geocanvas-npm-cache`.
