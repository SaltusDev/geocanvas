# @saltusdev/geocanvas

Dependency-free GeoJSON rendering for HTML canvas with interactive polygons, markers, lines, labels, tooltips, legends, smooth camera controls, and built-in flat plus globe projections.

## Install

```bash
npm install @saltusdev/geocanvas
```

## Usage

Bundler/npm import:

```js
import { GeoCanvas } from '@saltusdev/geocanvas';
```

## Quickstart

```js
import { GeoCanvas } from '@saltusdev/geocanvas';

const container = document.getElementById('map');

const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'pt',
      properties: { name: 'Portugal' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-9.6, 36.8],
          [-6.2, 36.8],
          [-6.2, 42.2],
          [-9.6, 42.2],
          [-9.6, 36.8]
        ]]
      }
    }
  ]
};

const geo = new GeoCanvas(container, {
  projection: 'mercator',
  padding: 24,
  tooltip: {
    enabled: true,
    template: '<strong>{name}</strong>'
  }
});

geo.setGeoJSON(geojson, { fit: true });

geo.on('featureclick', (payload) => {
  console.log('Clicked feature:', payload.properties?.name);
});
```

Expected HTML:

```html
<div id="map" style="width: 100%; height: 480px;"></div>
```

For multi-layer maps, reusable sources, joined region data, custom markers, and drilldown interactions, start with the recipes in [`docs/recipes.md`](./docs/recipes.md).

## Package Exports

- `@saltusdev/geocanvas`: primary published entry
- `@saltusdev/geocanvas/dist/geocanvas.min.js`: explicit prebuilt minified subpath

## Workspace Development

Inside this repository:

- `npm test` runs the library test suite
- `npm run build` writes `dist/geocanvas.min.js`

## Documentation

Canonical documentation lives under `docs/`:

- `docs/index.md`
- `docs/api-reference.md`
- `docs/behavior-reference.md`
- `docs/recipes.md`

## AI Skill

This repository includes a repo-local Codex skill at [`/.codex/skills/geocanvas/SKILL.md`](./.codex/skills/geocanvas/SKILL.md).

Use it when an AI agent is generating GeoCanvas integrations, examples, docs, or feature work and should follow the library's preferred API patterns, import paths, and validation flow.

## License

MIT
