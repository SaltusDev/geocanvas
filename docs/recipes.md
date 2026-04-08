# GeoCanvas Recipes

This guide collects copy-pasteable integration patterns for both human readers and AI agents.

Use these recipes when you want a concrete starting point before diving into the full API reference.

## Recipe Selection

- Single GeoJSON layer: use `setGeoJSON(...)`
- Reusable geometry across multiple visual layers: use `setSources(...)` plus `setLayers(...)`
- Joined polygon data with tooltip fields and choropleth styling: use `regions` plus layer `bindings`
- Layer-owned markers and clusters: use `markers` plus `markerClusters`
- Drilldown interactions: use layer `interaction` defaults plus `zoomToFeature()` or declarative layer visibility changes
- Globe view: set `projection: 'globe'`

## Minimal Map

```js
import { GeoCanvas } from '@saltusdev/geocanvas';

const geo = new GeoCanvas(document.getElementById('map'), {
  projection: 'mercator',
  padding: 24
});

geo.setGeoJSON({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'region-1',
      properties: { name: 'Region 1' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-9, 37],
          [-7, 37],
          [-7, 39],
          [-9, 39],
          [-9, 37]
        ]]
      }
    }
  ]
}, { fit: true });
```

Why this recipe:

- Smallest useful setup for a visible map
- Good first choice for AI-generated examples
- Avoids unnecessary layer/source indirection when you only have one dataset

## Joined Region Data With Tooltips

Use this when your GeoJSON contains geometry and your app data lives in a separate array keyed by id.

```js
import { GeoCanvas } from '@saltusdev/geocanvas';

const geo = new GeoCanvas(document.getElementById('map'), {
  projection: 'mercator',
  tooltip: {
    enabled: true,
    template: '<strong>{name}</strong><br />Population: {population}'
  }
});

geo.setLayers([
  {
    id: 'regions',
    geojson,
    regions: [
      { regionId: 'pt-11', name: 'Lisbon', population: 2948000, value: 82 },
      { regionId: 'pt-13', name: 'Porto', population: 1719000, value: 67 }
    ],
    bindings: {
      regionId: 'regionId',
      fill: (context) => context.region?.value >= 80 ? '#0f766e' : '#93c5fd',
      tooltip: '{name}<br />Population: {population}'
    }
  }
], { fit: true });
```

Notes:

- GeoJSON polygons match region rows by `regionId` unless you override `regionJoinField`
- Tooltip templates can resolve fields from `properties`, joined `region` data, layer metadata, and source metadata
- Binding functions are the clearest choice when styling depends on computed thresholds

## Reusable Source Shared By Multiple Layers

Use this when several layers should reuse the same geometry but carry different region datasets, styles, or visibility.

```js
import { GeoCanvas } from '@saltusdev/geocanvas';

const geo = new GeoCanvas(document.getElementById('map'), {
  projection: 'mercator',
  legend: {
    enabled: true,
    type: 'layers',
    interaction: 'toggle-layer-visibility'
  }
});

geo.setSources([
  { id: 'portugal', geojson }
]);

geo.setLayers([
  {
    id: 'sales',
    name: 'Sales',
    sourceId: 'portugal',
    regions: salesRegions,
    bindings: {
      fill: (context) => context.region?.sales > 100 ? '#0f766e' : '#cbd5e1'
    }
  },
  {
    id: 'coverage',
    name: 'Coverage',
    sourceId: 'portugal',
    visible: false,
    regions: coverageRegions,
    bindings: {
      fill: (context) => context.region?.coverage > 0.9 ? '#1d4ed8' : '#bfdbfe'
    }
  }
], { fit: true });
```

Why this recipe:

- Keeps one canonical geometry source
- Makes drilldowns and alternate thematic views easier to manage
- Gives AI agents a deterministic pattern for source reuse

## Layer-Owned Markers And Clusters

Use this when the markers belong semantically to one layer and should follow that layer's visibility.

```js
import { GeoCanvas } from '@saltusdev/geocanvas';

const geo = new GeoCanvas(document.getElementById('map'), {
  projection: 'mercator'
});

geo.setLayers([
  {
    id: 'offices',
    geojson,
    markers: [
      { id: 'lisbon', lon: -9.1393, lat: 38.7223, data: { name: 'Lisbon Office' } },
      { id: 'porto', lon: -8.6291, lat: 41.1579, data: { name: 'Porto Office' } }
    ],
    markerClusters: {
      enabled: true
    },
    tooltip: {
      template: '<strong>{name}</strong>'
    }
  }
], { fit: true });
```

Notes:

- Layer-owned markers disappear when the layer is hidden
- Cluster bubbles emit the same marker event stream as regular markers
- Use global `setMarkers(...)` only when markers should live outside layer visibility

## Declarative Drilldown

Use this when clicking a region should reveal a detail layer and optionally zoom into the clicked feature.

```js
import { GeoCanvas } from '@saltusdev/geocanvas';

const geo = new GeoCanvas(document.getElementById('map'), {
  projection: 'mercator',
  restoreLayerVisibilityOnHome: true
});

geo.setLayers([
  {
    id: 'countries',
    sourceId: 'world',
    visible: true,
    defaults: {
      regions: {
        click: {
          zoomTo: 'feature',
          showLayers: ['country-detail'],
          hideLayers: ['countries']
        }
      }
    }
  },
  {
    id: 'country-detail',
    sourceId: 'country-detail-source',
    visible: false
  }
], { fit: true });
```

Notes:

- `restoreLayerVisibilityOnHome: true` makes the home button behave like "return to overview"
- Declarative layer visibility is the cleanest pattern for map drilldowns
- If you need custom app-side logic too, attach a `featureclick` listener

## Globe Overview

Use this when the goal is a globe-style overview instead of a flat projected map.

```js
import { GeoCanvas } from '@saltusdev/geocanvas';

const geo = new GeoCanvas(document.getElementById('map'), {
  projection: 'globe',
  initialCenter: { lon: -25, lat: 20 },
  initialZoom: 1.15
});

geo.setGeoJSON(worldGeojson, { fit: true, projection: 'globe' });
```

Notes:

- In globe mode, back-hemisphere features are not rendered or hit-testable
- Labels are currently suppressed in globe mode
- Custom globe lines usually look best with geodesic paths

## Event Handling

Use this when you need the map to drive app state.

```js
geo.on('featureclick', (payload) => {
  console.log('feature', payload.id, payload.properties, payload.region);
});

geo.on('markerclick', (payload) => {
  console.log('marker', payload.markerId, payload.data);
});

geo.on('zoomend', (payload) => {
  console.log('zoom', payload.zoom, payload.center);
});
```

Notes:

- `featureclick` covers polygons, multipolygon groups, GeoJSON lines, GeoJSON points, and custom lines
- `markerclick` covers custom markers and synthetic cluster markers
- `zoomend` fires for completed zoom changes, not for pure pans

## Human And Agent Guidance

When generating new examples, prefer these conventions:

- Use `setGeoJSON(...)` for the simplest one-layer example
- Use `setSources(...)` plus `setLayers(...)` when more than one thematic layer shares geometry
- Keep ids explicit on layers, regions, and markers
- Prefer tooltip templates and binding functions over undocumented ad hoc fields
- Prefer `projection: 'mercator'` in generic examples unless a country-specific or globe example is the point
- Show the container sizing in HTML examples so the map is visibly renderable
