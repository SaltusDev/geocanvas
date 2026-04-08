# GeoCanvas Documentation

This `docs/` directory is the canonical source of truth for GeoCanvas behavior and public API.

Use these files as the main reference:

- [API Reference](./api-reference.md): constructor options, methods, events, payloads, and input shapes
- [Behavior Reference](./behavior-reference.md): rendering rules, hover semantics, responsiveness, hit-testing, tooltips, camera behavior, and projections
- [Recipes](./recipes.md): copy-pasteable starting points for common integration patterns

For a quick entry point and starter example, see the project [README](../README.md).

## Start Here

- Humans new to the library: read the project [README](../README.md), then [Recipes](./recipes.md)
- Humans wiring advanced behavior: jump from [Recipes](./recipes.md) to the [API Reference](./api-reference.md)
- AI agents generating code: prefer [Recipes](./recipes.md) for canonical patterns, then use the [API Reference](./api-reference.md) to fill in exact option names and input shapes

## Intended Audience

These docs are written for:

- developers using the library directly
- contributors extending GeoCanvas
- AI agents generating integrations, examples, or follow-up features

## Documentation Conventions

Each reference section should prefer explicit fields over prose-only descriptions:

- `Type`
- `Default`
- `Accepted Values`
- `Notes`
- `Example`

Terminology should match the implementation exactly.
