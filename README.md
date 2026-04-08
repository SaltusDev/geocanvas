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

const map = document.getElementById('map');
const geo = new GeoCanvas(map);
```

## Package Exports

- `@saltusdev/geocanvas`: primary ESM entry
- `@saltusdev/geocanvas/dist/geocanvas.min.js`: prebuilt minified ESM bundle

## Workspace Development

Inside this repository:

- `npm test` runs the library test suite
- `npm run build` writes `dist/geocanvas.min.js`

## Documentation

Canonical documentation lives under `docs/`:

- `docs/api-reference.md`
- `docs/behavior-reference.md`

## License

MIT
