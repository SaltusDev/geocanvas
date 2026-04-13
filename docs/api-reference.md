# GeoCanvas API Reference

## Export

Published package import for bundlers or other npm-aware tooling:

```js
import { GeoCanvas } from '@saltusdev/geocanvas';
```

Published prebuilt minified bundle subpath:

```js
import { GeoCanvas } from '@saltusdev/geocanvas/dist/geocanvas.min.js';
```

Notes:

- Published package consumers should prefer `@saltusdev/geocanvas`.
- Use `@saltusdev/geocanvas/dist/geocanvas.min.js` when you specifically want the prebuilt minified bundle through the package surface.
- `src/` is repository source, not a published package entrypoint.
- Run `npm run build` to generate `dist/geocanvas.min.js` inside the repository workspace.

Quick navigation:

- For a first working map, start with [`README.md`](../README.md).
- For canonical integration patterns, use [`recipes.md`](./recipes.md).

## Constructor

### Signature

```js
const geo = new GeoCanvas(target, options);
```

### `target`

Type: `HTMLElement | HTMLCanvasElement`

Notes:

- If `target` is an element container, GeoCanvas creates and owns a `<canvas>` inside it.
- If `target` is an existing canvas, GeoCanvas renders into that canvas.
- Responsive auto-resize follows the container size when a container is used.

### `options`

Type:

```js
{
  background?: string,
  padding?: number,
  view?: ViewOptions,
  defaults?: GlobalDefaults,
  styleFeature?: (feature) => FeatureStyle,
  styleMarker?: (marker) => MarkerStyle,
  hoverFeatureStyle?: FeatureStyle | ((item, hoverTarget) => FeatureStyle | null),
  hoverMarkerStyle?: MarkerStyle | ((item, hoverTarget) => MarkerStyle | null),
  markerLabels?: MarkerLabelOptions,
  markerClusters?: MarkerClusterOptions,
  initialZoom?: number,
  initialCenter?: { lon: number, lat: number } | null,
  showControls?: boolean,
  controlsPosition?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center',
  homeIconSvg?: string | null,
  minZoom?: number,
  maxZoom?: number,
  projection?: 'fit' | 'mercator' | 'albers' | 'albers-usa' | 'albers-usa-territories' | 'portugal-composite' | 'spain-composite' | 'france-composite' | 'equal-earth' | 'miller' | 'natural-earth-1' | 'globe',
  panEnabled?: boolean,
  pinchZoomEnabled?: boolean,
  doubleTapZoomEnabled?: boolean,
  scrollWheelZoomEnabled?: boolean,
  animationDuration?: number,
  hoverTransitionDuration?: number,
  hoverTrail?: boolean,
  hoverRegionToFront?: boolean,
  zoomStep?: number,
  restoreLayerVisibilityOnHome?: boolean,
  includePolygonIds?: string[] | string | Set<string>,
  excludePolygonIds?: string[] | string | Set<string>,
  tooltip?: TooltipOptions,
  legend?: LegendOptions,
  width?: number,
  height?: number
}
```

Notes:

- `width` and `height` are initial sizing fallbacks. The map remains responsive to its container after initialization.
- `view` groups camera, controls, and gesture options. Legacy flat fields such as `projection`, `initialZoom`, `showControls`, and `homeIconSvg` remain supported as aliases.
- `defaults` defines global marker, region, and line defaults that layers and items can inherit from.
- Constructor-level `includePolygonIds` and `excludePolygonIds` act as fallback defaults for layers that do not provide their own polygon filters.
- `projection: 'fit'` means raw coordinate fit, not a geographic projection.

## Constructor Options

### `background`

Type: `string`

Default: `'#f7fbff'`

Notes:

- Used as the visible canvas background fill on each render.

### `padding`

Type: `number`

Default: `16`

Notes:

- Applied to fit-to-viewport calculations.
- Also used when `setGeoJSON(..., { fit: true, padding })` recomputes view state.

### `styleFeature`

Type: `(feature) => FeatureStyle`

Default: `null`

Notes:

- Called for normalized GeoJSON features during render.
- Applies to polygon, line, and point features loaded from GeoJSON.
- The feature object may also include `region`, `bindings`, `layerId`, `layerName`, and `source`.
- Runs before hover style overrides.

### `styleMarker`

Type: `(marker) => MarkerStyle`

Default: `null`

Notes:

- Called for both global and layer-owned custom markers.
- Runs before marker-level `style` and before hover style overrides.

### `hoverFeatureStyle`

Type: `FeatureStyle | ((item, hoverTarget) => FeatureStyle | null)`

Default: `null`

Notes:

- Applied to hovered GeoJSON polygons, GeoJSON lines, GeoJSON points, and custom lines.
- Hover matching is group-aware for multipolygons. Hovering one polygon part highlights the full multipolygon group.
- Omitted hover style fields keep using the resolved non-hover value for that same field.

### `hoverMarkerStyle`

Type: `MarkerStyle | ((item, hoverTarget) => MarkerStyle | null)`

Default: `null`

Notes:

- Applied to hovered custom markers.
- Omitted hover style fields keep using the resolved non-hover value for that same field.

### `markerLabels`

Type: `MarkerLabelOptions`

Default: disabled

Notes:

- Legacy alias for `defaults.markers.labels`.
- Applies to global markers added through `setMarkers()` or `addMarker()`.
- Layer-owned markers can override this through `layer.defaults.markers.labels`, `layer.markerLabels`, or `setLayerMarkerLabels()`.
- Label text resolves from the marker binding context and defaults to `title`, `name`, `label`, then `id`.

### `markerClusters`

Type: `MarkerClusterOptions`

Default: disabled

Notes:

- Legacy alias for `defaults.markers.clusters`.
- Applies to global markers added through `setMarkers()` or `addMarker()`.
- Layer-owned markers can override this through `layer.defaults.markers.clusters`, `layer.markerClusters`, or `setLayerMarkerClusters()`.
- Clustering is computed in screen space from the current rendered marker positions.

### `view`

Type: `ViewOptions`

Notes:

- Groups camera, control, and gesture options under one object.
- Supports `projection`, `initialZoom`, `initialCenter`, `minZoom`, `maxZoom`, `controls`, `gestures`, `animationDuration`, `hoverTransitionDuration`, `hoverTrail`, `hoverRegionToFront`, `zoomStep`, and `restoreLayerVisibilityOnHome`.
- Flat constructor options with the same meaning remain supported as legacy aliases.

### `defaults`

Type: `GlobalDefaults`

Notes:

- Defines global marker, region, and line defaults.
- Layers inherit from these defaults unless they provide their own `layer.defaults` overrides.
- For disableable groups such as labels, clustering, and click interaction, use `false` to turn the inherited behavior off.
- Bindings win over explicit item style values when both resolve the same field.

### `initialZoom`

Type: `number`

Default: unset

Notes:

- If unset, home view uses fit-to-data zoom.
- If set, home view becomes explicit and `resetView()` returns to this configured zoom.

### `initialCenter`

Type: `{ lon: number, lat: number } | null`

Default: `null`

Notes:

- If unset, home view uses the data-derived center.
- If set, home view becomes explicit and `resetView()` returns to this configured center.

### `showControls`

Type: `boolean`

Default: `false`

Notes:

- Controls are the built-in `+`, `-`, and `H` buttons.

### `controlsPosition`

Type: `'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'`

Default: `'top-right'`

Notes:

- Controls render inside the map container.
- `top-center` and `bottom-center` render the controls in a centered horizontal row.

### `homeIconSvg`

Type: `string | null`

Default: `null`

Notes:

- Legacy alias for `view.controls.homeIconSvg`.
- Accepts inline SVG markup for the built-in home button.
- Leave unset or `null` to keep the default `H` label.
- If the SVG uses `currentColor`, GeoCanvas resolves it against the control icon color before encoding it as a data URL.

### `minZoom`

Type: `number`

Default: `0.5`

### `maxZoom`

Type: `number`

Default: `8`

### `projection`

Type: `'fit' | 'mercator' | 'albers' | 'albers-usa' | 'albers-usa-territories' | 'portugal-composite' | 'spain-composite' | 'france-composite' | 'equal-earth' | 'miller' | 'natural-earth-1' | 'globe'`

Default: `'fit'`

Notes:

- Applies to GeoJSON features, markers, lines, hit-testing, hover, tooltips, and camera behavior.
- `albers` uses the library's built-in defaults. Projection-specific tuning is not exposed in the public API yet.
- `albers-usa` uses a built-in composite of the contiguous U.S., Alaska, Hawaii, and Puerto Rico.
- `albers-usa-territories` extends that composite with Guam / Northern Mariana Islands, American Samoa, and the U.S. Virgin Islands.
- `portugal-composite` uses a built-in mainland + Madeira + Azores inset layout tuned for better landscape viewport usage.
- `spain-composite` uses a built-in mainland + Balearic Islands + Canary Islands inset layout.
- `france-composite` uses a built-in metropolitan France + major overseas groups inset layout.
- Composite inset projections scale each inset from the visible geometry inside that inset when possible, which usually reduces wasted space from large empty geographic envelopes.
- Composite projections still fit the visible source data only. If a source omits an island or overseas group, GeoCanvas does not reserve empty viewport space for that missing inset.
- `globe` renders an orthographic hemisphere instead of a flat map.
- In `globe` mode, `center` represents the center of the visible hemisphere and drag interaction rotates the globe instead of translating a flat camera.

### `panEnabled`

Type: `boolean`

Default: `true`

Notes:

- Enables drag-pan for mouse and touch/pointer interaction.
- In `globe` mode, enables drag-to-rotate interaction.
- Pan and center changes are clamped to the current projected data bounds so the map cannot be dragged completely out of the viewport.

### `pinchZoomEnabled`

Type: `boolean`

Default: `true`

Notes:

- Enables two-finger pinch zoom on touch/pointer devices.
- Pinch zoom anchors around the pinch midpoint and respects camera clamping.

### `doubleTapZoomEnabled`

Type: `boolean`

Default: `true`

Notes:

- Enables double-click zoom for mouse/pointer input and double-tap zoom for touch input.
- Double-tap and double-click zoom in using the configured `zoomStep`.

### `scrollWheelZoomEnabled`

Type: `boolean`

Default: `false`

Notes:

- Enables mouse wheel and trackpad wheel zoom.
- Wheel zoom anchors around the pointer location and applies immediately without view animation.

### `animationDuration`

Type: `number`

Default: `500`

Notes:

- Used for animated view changes such as zoom in, zoom out, set center, and reset home.
- Camera animations use an ease-out curve, so they move quickly at the start and settle more gently near the end.

### `hoverTransitionDuration`

Type: `number`

Default: `140`

Notes:

- Used for hover-in and hover-out style interpolation on polygons, GeoJSON lines, GeoJSON points, custom lines, and custom markers.
- The transition blends base and hover styles for fill, stroke, stroke width, opacity, and radius where applicable.
- Set to `0` to disable the hover transition and restore immediate hover style changes.

### `hoverTrail`

Type: `boolean`

Default: `true`

Notes:

- Controls whether previously hovered targets keep animating their hover colors out after the pointer has already moved onto another target.
- When `true`, hover colors can trail across multiple recently hovered polygons, lines, points, and markers while each target eases back to its base style independently.
- When `false`, entering a new hover target clears those trailing color fades immediately, while hover-out to empty space can still animate from the current interpolated state.
- Tooltip triggering and tooltip persistence are unchanged. This option only affects hover-style color and style interpolation.

### `hoverRegionToFront`

Type: `boolean`

Default: `false`

Notes:

- When `true`, the hovered polygon region is rendered after the rest of the polygon pass so its hover border stays visible above neighboring region borders.
- Multipart hovered regions keep their internal source order and move together as one hover group.
- The option only changes polygon draw order while a polygon region is hovered.
- Hit-testing, tooltip grouping, feature data, lines, points, and markers are unchanged.

### `zoomStep`

Type: `number`

Default: `1.2`

Notes:

- Used by `zoomIn()` and `zoomOut()` when no explicit step is provided.

### `restoreLayerVisibilityOnHome`

Type: `boolean`

Default: `false`

Notes:

- When true, `resetView()` and the built-in home button restore the layer visibility snapshot captured after `setLayers()` or `addLayer()`.
- Useful for drilldown flows where clicking a region reveals a detail layer and home should return to the original overview state.

### `includePolygonIds`

Type: `string[] | string | Set<string>`

Default: empty

Notes:

- Matches `feature.id` first, then `properties.id`.
- Restricts visible polygon and multipolygon features to the listed ids.

### `excludePolygonIds`

Type: `string[] | string | Set<string>`

Default: empty

Notes:

- Matches `feature.id` first, then `properties.id`.
- Exclusion wins if the same id appears in both include and exclude lists.

### `tooltip`

Type:

```js
{
  enabled?: boolean,
  template?: string,
  mode?: 'follow' | 'fixed' | 'interactive-fixed',
  trigger?: 'hover' | 'click' | 'none',
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right',
  followPointer?: boolean,
  interactive?: boolean,
  showPointer?: boolean,
  offsetX?: number,
  offsetY?: number,
  className?: string,
  regions?: {
    visibility?: 'all' | 'joined-only'
  },
  style?: {
    background?: string,
    color?: string,
    borderRadius?: string,
    padding?: string,
    border?: string,
    boxShadow?: string,
    fontFamily?: string,
    fontSize?: string,
    lineHeight?: string,
    minWidth?: string,
    maxWidth?: string
  } | null,
  render?: (payload) => string | null
}
```

Default:

```js
{
  enabled: false,
  template: '{name}',
  mode: 'follow',
  trigger: 'hover',
  position: 'auto',
  followPointer: true,
  interactive: false,
  showPointer: true,
  offsetX: 12,
  offsetY: 12,
  className: '',
  regions: {
    visibility: 'all'
  },
  style: null,
  render: null
}
```

Notes:

- `render` takes precedence over `template`.
- Template placeholders resolve `payload.properties[key]`, then `payload.data[key]`, then `payload.region[key]`, then `payload.layer[key]`, then `payload.source[key]`, then `''`.
- If a hovered item provides a resolved tooltip binding or item tooltip override, that item-specific tooltip content is used before the global `tooltip.template`.
- The resolved item tooltip value is also exposed as `tooltipContent` while rendering the active template, so templates such as `XXX {tooltipContent} XXX` can wrap marker, region, or line tooltip content.
- Layer definitions may also provide `tooltip` presentation overrides. Item tooltip content still wins first, then `layer.tooltip.template`, then the global `tooltip.template`.
- `trigger: 'hover'` shows tooltips from pointer hover, `trigger: 'click'` shows them on click, and `trigger: 'none'` disables them.
- `regions.visibility: 'joined-only'` suppresses tooltips for visible polygon features that do not have joined region data in the active layer.

### `legend`

Type:

```js
{
  enabled?: boolean,
  type?: 'layers' | 'custom',
  interaction?: 'none' | 'toggle-layer-visibility',
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
  size?: 'sm' | 'md' | 'lg',
  entries?: LegendEntry[]
}
```

Default:

```js
{
  enabled: false,
  type: 'layers',
  interaction: 'none',
  position: 'bottom-right',
  size: 'md',
  entries: []
}
```

Notes:

- Legends are global overlays for the current `GeoCanvas` instance.
- `type: 'layers'` mirrors the current layer list and derives each swatch color from that layer's resolved joined-region fill.
- `type: 'custom'` renders the supplied `entries`.
- `interaction: 'toggle-layer-visibility'` only applies to `type: 'layers'`.
- Legend interactions only change layer visibility. They do not affect tooltip behavior.
- `position` controls whether the tooltip is placed above, below, left, right, or auto-resolved around the anchor point.
- `showPointer` toggles the tooltip arrow pointer.
- `style` provides convenience inline styling while `className` remains the best option for full CSS control.
- Tooltip HTML is inserted as raw HTML.

## Public Methods

### `setGeoJSON(geojson, options = {})`

Signature:

```js
geo.setGeoJSON(geojson, {
  fit?: boolean,
  padding?: number,
  initialZoom?: number,
  initialCenter?: { lon: number, lat: number } | null,
  includePolygonIds?: string[] | string | Set<string>,
  excludePolygonIds?: string[] | string | Set<string>,
  antimeridianMode?: 'off' | 'auto' | 'unwrap',
  antimeridianReferenceLon?: number | null,
  projection?: 'fit' | 'mercator' | 'albers' | 'albers-usa' | 'albers-usa-territories' | 'portugal-composite' | 'spain-composite' | 'france-composite' | 'equal-earth' | 'miller' | 'natural-earth-1' | 'globe'
});
```

Returns: `GeoCanvas`

Notes:

- `geojson` accepts either a GeoJSON object or a valid JSON string containing a GeoJSON object.
- Replaces the current GeoJSON source with a single default layer.
- This is a compatibility helper for the single-layer case.
- Recomputes projection cache, bounds, and home view.
- Clears hover state and hides any visible tooltip.
- `fit !== false` resets to the recomputed home view.
- `includePolygonIds` and `excludePolygonIds` are attached to that default layer.
- `antimeridianMode` and `antimeridianReferenceLon` are attached to that default layer.

### `setSources(sources = [])`

Signature:

```js
geo.setSources([
  { id, name?, geojson }
]);
```

Returns: `GeoCanvas`

Notes:

- `geojson` accepts either a GeoJSON object or a valid JSON string containing a GeoJSON object.
- Replaces the reusable GeoJSON source registry.
- Sources are normalized once and can be reused by multiple layers via `sourceId`.
- Removing or replacing sources does not remove layers, but layers that reference a missing source stop rendering GeoJSON features until the source is restored.

### `addSource(source)`

Signature:

```js
geo.addSource({ id, name?, geojson });
```

Returns: created source object

Notes:

- `geojson` accepts either a GeoJSON object or a valid JSON string containing a GeoJSON object.

### `removeSource(sourceId)`

Returns: `GeoCanvas`

### `clearSources()`

Returns: `GeoCanvas`

### `getSources()`

Returns:

```js
[
  {
    id: string,
    name: string,
    geojson: object | null
  }
]
```

Notes:

- `defaults` is the canonical inheritable config on each layer.
- Legacy alias fields such as `bindings`, `labels`, `markerLabels`, `markerClusters`, `interaction`, and `regionStyle` may be omitted when that layer is inheriting from global defaults instead of defining its own override.

### `setLayers(layers = [], options = {})`

Signature:

```js
geo.setLayers([
  {
    id,
    name?,
    sourceId?,
    geojson?,
    visible?,
    antimeridianMode?,
    antimeridianReferenceLon?,
    defaults?,
    regions?,
    markers?,
    lines?,
    bindings?,
    labels?,
    markerLabels?,
    markerClusters?,
    interaction?,
    regionStyle?,
    contributeToBounds?,
    includePolygonIds?,
    excludePolygonIds?
  }
], {
  fit?: boolean,
  padding?: number,
  view?: ViewOptions,
  initialZoom?: number,
  initialCenter?: { lon: number, lat: number } | null,
  projection?: 'fit' | 'mercator' | 'albers' | 'albers-usa' | 'albers-usa-territories' | 'portugal-composite' | 'spain-composite' | 'france-composite' | 'equal-earth' | 'miller' | 'natural-earth-1' | 'globe',
  includePolygonIds?: string[] | string | Set<string>,
  excludePolygonIds?: string[] | string | Set<string>
});
```

Returns: `GeoCanvas`

Notes:

- Replaces all current layers.
- A layer can reference reusable source geometry through `sourceId` or provide inline `geojson`.
- Layer `geojson` accepts either a GeoJSON object or a valid JSON string containing a GeoJSON object.
- A layer can define typed inheritable defaults through `defaults.markers`, `defaults.regions`, and `defaults.lines`.
- `antimeridianMode: 'auto'` unwraps dateline-crossing source geometry before flat-map projection, fit bounds, labels, hover, and clicks.
- `antimeridianReferenceLon` biases unwrapped source geometry toward a preferred longitude copy when dateline crossing is detected.
- A layer may contain its own `regions`, `markers`, and `lines`.
- A layer may also define `markerLabels` for its own marker collection.
- A layer may also define `markerClusters` for its own marker collection.
- The legacy layer aliases `labels`, `markerLabels`, `markerClusters`, `interaction`, `regionStyle`, and `bindings` remain supported and map into `layer.defaults`.
- Each layer can carry its own polygon filters through `includePolygonIds` and `excludePolygonIds`.
- The method-level `includePolygonIds` and `excludePolygonIds` act as fallback defaults for layers that do not define their own filters.
- Visible layers contribute to rendering and hit-testing.
- Only visible layers with `contributeToBounds !== false` contribute their GeoJSON features to home-view bounds.

### `addLayer(layer, options = {})`

Signature:

```js
geo.addLayer({
  id,
  name?,
  sourceId?,
  geojson?,
  visible?,
  antimeridianMode?,
  antimeridianReferenceLon?,
  defaults?,
  regions?,
  markers?,
  lines?,
  bindings?,
  labels?,
  markerLabels?,
  markerClusters?,
  interaction?,
  regionStyle?,
  contributeToBounds?,
  includePolygonIds?,
  excludePolygonIds?
}, options?);
```

Returns: created layer object

Notes:

- Layer `geojson` accepts either a GeoJSON object or a valid JSON string containing a GeoJSON object.
- Layer `antimeridianMode` and `antimeridianReferenceLon` use the same behavior as `setLayers(...)`.

### `removeLayer(layerId)`

Returns: `GeoCanvas`

### `clearLayers()`

Returns: `GeoCanvas`

### `getLayers()`

Returns:

```js
[
  {
    id: string,
    name: string,
    sourceId: string | null,
    geojson: object | null,
    visible: boolean,
    order: number,
    antimeridianMode: 'off' | 'auto' | 'unwrap',
    antimeridianReferenceLon: number | null,
    regionJoinField: string,
    defaults: LayerDefaults,
    tooltip: LayerTooltipOptions | undefined,
    regions: RegionData[],
    markers: MarkerObject[],
    lines: LineObject[],
    bindings: LayerBindings,
    labels: LabelOptions,
    markerLabels: MarkerLabelOptions,
    markerClusters: MarkerClusterOptions,
    interaction: LayerInteraction,
    regionStyle: RegionStyleOptions,
    contributeToBounds: boolean,
    includePolygonIds: string[],
    excludePolygonIds: string[]
  }
]
```

### `setLayerVisibility(layerId, visible)`

Returns: `GeoCanvas`

Notes:

- Updates visibility without re-fitting the current camera framing.

### `toggleLayerVisibility(layerId)`

Returns: `GeoCanvas`

### `setLayerFilter(layerId, { includePolygonIds, excludePolygonIds } = {})`

Returns: `GeoCanvas`

Notes:

- Updates polygon filters for one specific layer.
- Matching checks `feature.id` first, then `properties.id`.

### `setLayerRegions(layerId, regions = [], bindings?)`

Returns: `GeoCanvas`

Notes:

- Replaces the region-data collection for one layer.
- If `bindings` is provided, it is shallow-merged into the layer's existing `bindings`.
- Region ids are matched against GeoJSON polygon ids using the resolved region `regionId` binding when provided, otherwise `regionId`.

### `setLayerMarkers(layerId, markers = [])`

Returns: `GeoCanvas`

Notes:

- Replaces the marker collection owned by one layer.
- Marker visibility follows the layer visibility.
- Layer markers use the same `MarkerObject` shape as `setMarkers()` and `addMarker()`.

### `setLayerMarkerLabels(layerId, markerLabels = {})`

Returns: `GeoCanvas`

Notes:

- Replaces `layer.defaults.markers.labels` for one layer.
- Applies only to markers owned by that layer.

### `setLayerMarkerClusters(layerId, markerClusters = {})`

Returns: `GeoCanvas`

Notes:

- Replaces `layer.defaults.markers.clusters` for one layer.
- Applies only to markers owned by that layer.

### `setLayerRegionDefaults(layerId, regions = {})`

Returns: `GeoCanvas`

Notes:

- Canonical runtime setter for `layer.defaults.regions`.

### `setLayerMarkerDefaults(layerId, markers = {})`

Returns: `GeoCanvas`

Notes:

- Canonical runtime setter for `layer.defaults.markers`.

### `setLayerLineDefaults(layerId, lines = {})`

Returns: `GeoCanvas`

Notes:

- Canonical runtime setter for `layer.defaults.lines`.

### `setLayerLines(layerId, lines = [])`

Returns: `GeoCanvas`

Notes:

- Replaces the line collection owned by one layer.
- Line visibility follows the layer visibility.
- Layer lines use the same `LineObject` shape as `setLines()` and `addLine()`.

### `captureHomeState()`

Returns: `GeoCanvas`

Notes:

- Captures the current layer visibility as the home-state visibility snapshot.
- Use this if your app intentionally changes the "overview" visibility after initial setup and you want home/reset to return to that newer state.

### `setMarkers(markers = [])`

Signature:

```js
geo.setMarkers([
  { id, lon, lat, type?, image?, animation?, properties?, data?, style? }
]);
```

Returns: `GeoCanvas`

Notes:

- Replaces all custom markers.
- `type` defaults to `'circle'`.
- Image markers use `type: 'image'` plus an `image` object.
- `animation` accepts built-in canvas marker effects such as `pulse`, `breathe`, and `spin`.
- Markers can also inherit `animation` from resolved `defaults.markers.animation`.
- Global marker labels are controlled through the constructor `markerLabels` option or `setMarkerLabelOptions()`.
- Global marker clustering is controlled through the constructor `markerClusters` option or `setMarkerClusterOptions()`.

### `addMarker(marker)`

Signature:

```js
geo.addMarker({ id?, lon, lat, type?, image?, animation?, properties?, data?, style? });
```

Returns: created marker object

Notes:

- Adds one marker and renders immediately.

### `clearMarkers()`

Returns: `GeoCanvas`

### `setLines(lines = [])`

Signature:

```js
geo.setLines([
  { id, coordinates?, markerRefs?, pathMode?, data?, style? }
]);
```

Returns: `GeoCanvas`

Notes:

- Replaces all custom lines.
- `coordinates` should be an array of `[lon, lat]` points.
- `markerRefs` can be used instead of `coordinates` to derive the line from existing markers.
- `pathMode` accepts `'polyline'` or `'geodesic'`. When unset, globe projection defaults custom lines to geodesic rendering.

### `addLine(line)`

Signature:

```js
geo.addLine({ id?, coordinates?, markerRefs?, pathMode?, data?, style? });
```

Returns: created line object

### `clearLines()`

Returns: `GeoCanvas`

### `setTooltipOptions(options = {})`

Returns: `GeoCanvas`

Notes:

- Merges into the existing tooltip options.
- Re-renders the active tooltip if one is already visible.
- Supports region-specific visibility filtering such as `regions.visibility: 'joined-only'`.

### `setLegendOptions(options = {})`

Returns: `GeoCanvas`

Notes:

- Merges into the existing legend options.
- Pass `false` or `null` to disable the legend.
- Re-renders the legend overlay immediately.
- `interaction: 'toggle-layer-visibility'` only has an effect for `type: 'layers'`.

### `setDefaults(defaults = {})`

Returns: `GeoCanvas`

Notes:

- Canonical runtime setter for global `defaults`.
- Re-resolves current markers, lines, and layers against the updated defaults.
- Use this when you want to update global marker, region, or line inheritance without recreating the map.

### `setLayerDefaults(layerId, defaults = {})`

Returns: `GeoCanvas`

Notes:

- Canonical runtime setter for one layer's `defaults`.
- Re-resolves that layer's current regions, markers, and lines against the updated defaults.

### `setLayerTooltipOptions(layerId, tooltip = {})`

Returns: `GeoCanvas`

Notes:

- Canonical runtime setter for one layer's tooltip presentation overrides.
- Supports only `template`, `className`, and `style`.
- Does not change global tooltip trigger, position, pointer-follow, interactive persistence, or `regions.visibility`.
- Pass `null` to clear the layer override and fall back to global tooltip presentation again.

### `setViewOptions(view = {}, options = {})`

Returns: `GeoCanvas`

Notes:

- Canonical runtime setter for grouped `view` options.
- Supports `projection`, `initialZoom`, `initialCenter`, `minZoom`, `maxZoom`, `controls`, `gestures`, `animationDuration`, `hoverTransitionDuration`, `hoverTrail`, `hoverRegionToFront`, `zoomStep`, and `restoreLayerVisibilityOnHome`.
- If `projection` changes, the map is reprojected. Use `options.resetView` to control whether the current view resets during reprojection.

### `setMarkerLabelOptions(markerLabels = {})`

Returns: `GeoCanvas`

Notes:

- Replaces the global marker-label defaults used by markers added through `setMarkers()` and `addMarker()`.
- Updates `defaults.markers.labels`.
- Compatibility helper on top of `setDefaults({ markers: { labels } })`.
- Does not change layer-owned marker label overrides.

### `setMarkerClusterOptions(markerClusters = {})`

Returns: `GeoCanvas`

Notes:

- Replaces the global marker clustering defaults used by markers added through `setMarkers()` and `addMarker()`.
- Updates `defaults.markers.clusters`.
- Compatibility helper on top of `setDefaults({ markers: { clusters } })`.
- Does not change layer-owned cluster overrides.

### `setHoverTargetStyles({ hoverFeatureStyle, hoverMarkerStyle } = {})`

Returns: `GeoCanvas`

Notes:

- Updates runtime hover styling without replacing the underlying data.

### `setControlsOptions({ showControls, controlsPosition, homeIconSvg } = {})`

Returns: `GeoCanvas`

Notes:

- Compatibility helper on top of `setViewOptions({ controls: ... })`.

### `setPolygonFilter({ layerId, includePolygonIds, excludePolygonIds } = {})`

Returns: `GeoCanvas`

Notes:

- Compatibility helper for polygon filtering.
- If `layerId` is provided, filtering is applied only to that layer.
- If `layerId` is omitted, filtering is applied to all current layers.
- Recomputes projected features and home view.

### `setProjection(projection, options = {})`

Signature:

```js
geo.setProjection(projection, { resetView?: boolean });
```

Returns: `GeoCanvas`

Notes:

- Reprojects current GeoJSON features and redraws the map.
- Accepted values: `'fit'`, `'mercator'`, `'albers'`, `'albers-usa'`, `'albers-usa-territories'`, `'portugal-composite'`, `'spain-composite'`, `'france-composite'`, `'equal-earth'`, `'miller'`, `'natural-earth-1'`, `'globe'`.
- Switching to `'globe'` changes drag behavior from flat-map panning to globe rotation.
- Compatibility helper on top of `setViewOptions({ projection }, options)`.

### `setPanEnabled(enabled)`

Returns: `GeoCanvas`

Notes:

- Equivalent to `setInteractionOptions({ panEnabled: enabled })`.

### `setInteractionOptions({ panEnabled, pinchZoomEnabled, doubleTapZoomEnabled, scrollWheelZoomEnabled } = {})`

Signature:

```js
geo.setInteractionOptions({
  panEnabled?: boolean,
  pinchZoomEnabled?: boolean,
  doubleTapZoomEnabled?: boolean,
  scrollWheelZoomEnabled?: boolean
});
```

Returns: `GeoCanvas`

Notes:

- Updates the corresponding interaction toggles at runtime.
- Useful for builder-style UIs that need to enable or disable drag-pan and gesture zoom behavior without recreating the map.
- In `globe` mode, `panEnabled` controls drag-to-rotate instead of flat-map panning.
- Compatibility helper on top of `setViewOptions({ gestures: ... })`.

### `zoomIn(step = this.options.zoomStep, options = {})`

Signature:

```js
geo.zoomIn(step?, { animate?: boolean, duration?: number });
```

Returns: `GeoCanvas`

### `zoomOut(step = this.options.zoomStep, options = {})`

Signature:

```js
geo.zoomOut(step?, { animate?: boolean, duration?: number });
```

Returns: `GeoCanvas`

### `setZoom(zoom, options = {})`

Signature:

```js
geo.setZoom(zoom, { animate?: boolean, duration?: number });
```

Returns: `GeoCanvas`

### `setCenter(center, options = {})`

Signature:

```js
geo.setCenter({ lon, lat }, { animate?: boolean, duration?: number });
```

Returns: `GeoCanvas`

Notes:

- The requested center is clamped to the current projected data bounds.
- If the current zoom level shows the full fitted dataset, `setCenter(...)` keeps the map centered.
- In `globe` mode, the center describes the visible hemisphere center rather than a flat camera offset.

### `resetView(options = {})`

Signature:

```js
geo.resetView({ animate?: boolean, duration?: number });
```

Returns: `GeoCanvas`

Notes:

- Returns to the current home view.
- Home view is data-fit-based unless explicit `initialZoom` or `initialCenter` was configured.
- Accepts `restoreLayerVisibility?: boolean` to restore the captured home visibility snapshot before animating.
- Closes any built-in click lightbox or panel UI before the reset animation begins.

### `zoomToFeature(targetOrPayload, options = {})`

Signature:

```js
geo.zoomToFeature(targetOrPayload, {
  padding?: number,
  maxZoom?: number,
  minZoom?: number,
  animate?: boolean,
  duration?: number
});
```

Returns: `GeoCanvas`

Notes:

- Fits the target feature bounds into view using the current projection.
- Multipolygon clicks zoom to the grouped feature bounds.
- Animated zooms follow a straight screen-space camera path instead of zooming first and then visibly correcting sideways.
- In `globe` mode, the target region is brought onto the visible hemisphere and the globe scales to fit the visible projected shape.
- In `globe` mode, animated rotations follow the shortest spherical path between the current and target hemisphere centers.

### `zoomToMarker(targetOrPayload, options = {})`

Signature:

```js
geo.zoomToMarker(targetOrPayload, {
  zoomScale?: number,
  maxZoom?: number,
  animate?: boolean,
  duration?: number
});
```

Returns: `GeoCanvas`

Notes:

- Centers the view on the marker and zooms to the requested scale.
- Animated zooms follow a straight screen-space camera path instead of zooming first and then visibly correcting sideways.
- In `globe` mode, the marker is rotated onto the visible hemisphere center before zooming.
- In `globe` mode, animated rotations follow the shortest spherical path between the current and target hemisphere centers.

### `getView()`

Returns:

```js
{
  zoom: number,
  center: { lon: number, lat: number },
  home: {
    zoom: number,
    center: { lon: number, lat: number },
    explicit: boolean
  },
  projection: 'fit' | 'mercator' | 'albers' | 'albers-usa' | 'albers-usa-territories' | 'portugal-composite' | 'spain-composite' | 'france-composite' | 'equal-earth' | 'miller' | 'natural-earth-1' | 'globe',
  panEnabled: boolean,
  layers: [
    {
      id: string,
      name: string,
      visible: boolean,
      order: number
    }
  ]
}
```

Notes:

- In `globe` mode, `center` is the visible hemisphere center used by the orthographic projection.

### `getViewOptions()`

Returns:

```js
{
  projection: 'fit' | 'mercator' | 'albers' | 'albers-usa' | 'albers-usa-territories' | 'portugal-composite' | 'spain-composite' | 'france-composite' | 'equal-earth' | 'miller' | 'natural-earth-1' | 'globe',
  initialZoom: number | undefined,
  initialCenter: { lon: number, lat: number } | null,
  minZoom: number,
  maxZoom: number,
  controls: {
    enabled: boolean,
    position: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center',
    homeIconSvg: string | null
  },
  gestures: {
    panEnabled: boolean,
    pinchZoomEnabled: boolean,
    doubleTapZoomEnabled: boolean,
    scrollWheelZoomEnabled: boolean
  },
  animationDuration: number,
  hoverTransitionDuration: number,
  hoverTrail: boolean,
  hoverRegionToFront: boolean,
  zoomStep: number,
  restoreLayerVisibilityOnHome: boolean
}
```

### `getDefaults()`

Returns: `GlobalDefaults`

### `getLegendOptions()`

Returns: `LegendOptions`

### `getLayerDefaults(layerId)`

Returns: `LayerDefaults | null`

### `getLayerTooltipOptions(layerId)`

Returns: `LayerTooltipOptions | null`

### `stopAnimation(commitCurrent = true)`

Returns: `GeoCanvas`

Notes:

- Stops any in-flight camera animation.
- If `commitCurrent` is true, the current interpolated frame becomes the active view.

### `on(eventName, handler)`

Signature:

```js
const unsubscribe = geo.on(eventName, handler);
```

Returns: unsubscribe function

Accepted values:

- `featureenter`
- `featureleave`
- `featuremove`
- `featureclick`
- `markerenter`
- `markerleave`
- `markermove`
- `markerclick`
- `zoomend`

Notes:

- Throws if `handler` is not a function.

### `off(eventName, handler)`

Returns: `void`

### `resize(width?, height?)`

Returns: `void`

Notes:

- Recomputes the drawing buffer and base fit transform.
- If `width` and `height` are omitted, GeoCanvas measures the container or canvas box.

### `render()`

Returns: `void`

Notes:

- Redraws visible and hit-test canvases.

### `destroy()`

Returns: `void`

Notes:

- Removes listeners, tooltip DOM, control DOM, resize observer, and hit-map state.

## Input Shapes

### `FeatureStyle`

```js
{
  fill?: string,
  stroke?: string,
  strokeWidth?: number,
  opacity?: number,
  lineDash?: number[],
  radius?: number,
  cursor?: string
}
```

### `MarkerStyle`

Same shape as `FeatureStyle`, with two marker-only size fields:

```js
{
  fill?: string,
  stroke?: string,
  strokeWidth?: number,
  opacity?: number,
  lineDash?: number[],
  radius?: number,
  width?: number,
  height?: number,
  cursor?: string
}
```

Notes:

- Circle markers use `radius`.
- Image markers use `image.width` / `image.height` by default.
- `width` and `height` in `MarkerStyle` override the image marker size and can be used by `hoverMarkerStyle`.

### MarkerImage

```js
{
  src?: string | null,
  svg?: string | null,
  anchor?: 'top' | 'topLeft' | 'topRight' | 'center' | 'centerRight' | 'centerLeft' | 'bottomLeft' | 'bottom' | 'bottomRight',
  width?: number,
  height?: number,
  anchorX?: number,
  anchorY?: number
}
```

Notes:

- Provide either `src` or `svg`.
- `svg` accepts inline SVG markup and is converted to a data URL internally.
- Inline SVG markup that uses `currentColor` is colorized from the resolved marker `fill`, including hover-state `fill` overrides.
- `anchor` accepts named presets such as `bottom`, `center`, and `topLeft`.
- `anchorX` and `anchorY` default to the image center.
- When `anchor` is provided, it resolves to preset pixel coordinates inside the image box before any render-time scaling.
- `anchorX` and `anchorY` are measured in image pixels from the top-left corner.
- Explicit `anchorX` and `anchorY` override `anchor` when both are provided.
- When image marker `width` or `height` changes at render time, the anchor is scaled proportionally with the image.

### Marker Object

```js
{
  id?: string,
  lon: number,
  lat: number,
  title?: string | null,
  name?: string | null,
  label?: string | null,
  type?: 'circle' | 'image',
  image?: MarkerImage | null,
  animation?: MarkerAnimation | null,
  properties?: Record<string, any>,
  data?: any,
  style?: MarkerStyle,
  hoverStyle?: MarkerStyle,
  bindings?: LayerBindings,
  tooltip?: string | ((context) => string | null),
  interaction?: LayerInteraction
}
```

Notes:

- `type` defaults to `'circle'`.
- If `type` and `image` are omitted, the marker can inherit them from resolved marker defaults.
- If `type` is omitted and `image.src` or `image.svg` is present, the marker is treated as an image marker.
- Global markers and layer-owned markers share the same marker object shape.
- Marker labels can resolve text from top-level marker fields, `properties`, `data`, layer metadata, or source metadata.
- `animation` is optional and keeps hit-testing anchored to the base marker bounds instead of the animated visual effect.
- Set `animation: false` to disable an inherited marker-default animation for one specific marker.
- `tooltip` strings support templates such as `'<strong>{name}</strong>'`, direct lookups such as `'title'`, and literal text or HTML when the string is not a simple lookup key or dotted path.

### MarkerAnimation

```js
{
  kind: 'pulse' | 'breathe' | 'spin',
  duration?: number,
  delay?: number,
  repeat?: boolean,
  phase?: number,
  easing?: 'linear' | 'ease-in-out' | 'ease-out',
  scaleFrom?: number,
  scaleTo?: number,
  opacityFrom?: number,
  opacityTo?: number,
  degrees?: number
}
```

Notes:

- `kind: 'pulse'` draws an animated ring around the marker and supports `scaleFrom`, `scaleTo`, `opacityFrom`, and `opacityTo`.
- `kind: 'breathe'` scales the rendered marker up and down in a loop and supports `scaleFrom` and `scaleTo`.
- `kind: 'spin'` rotates the rendered marker image and supports `degrees`.
- `duration` is measured in milliseconds.
- `delay` delays the start of each animation sequence in milliseconds.
- `repeat` defaults to `true`.
- `phase` offsets the animation cycle, where `1` equals one full duration.
- `spin` is most useful for image markers, while `pulse` and `breathe` work for both circle and image markers.

### Line Object

```js
{
  id?: string,
  coordinates?: Array<[number, number]>,
  markerRefs?: Array<{
    markerId: string,
    layerId?: string
  }>,
  pathMode?: 'polyline' | 'geodesic',
  data?: any,
  properties?: Record<string, any>,
  region?: any,
  style?: FeatureStyle,
  hoverStyle?: FeatureStyle,
  bindings?: LayerBindings,
  tooltip?: string | ((context) => string | null)
}
```

Notes:

- Provide either `coordinates` or `markerRefs`.
- `markerRefs` resolves line vertices from existing markers in order.
- Use `layerId` when referencing a layer-owned marker. Omit it for global markers added through `setMarkers()` / `addMarker()`.
- If fewer than two marker refs resolve at runtime, the line is skipped.
- `pathMode: 'geodesic'` renders the line as a sampled great-circle path.
- If `pathMode` is unset, custom lines default to `'geodesic'` on `globe` and `'polyline'` on flat projections.
- `tooltip` strings support templates such as `'<strong>{name}</strong>'`, direct lookups such as `'title'`, and literal text or HTML when the string is not a simple lookup key or dotted path.

### ViewOptions

```js
{
  projection?: 'fit' | 'mercator' | 'albers' | 'albers-usa' | 'albers-usa-territories' | 'portugal-composite' | 'spain-composite' | 'france-composite' | 'equal-earth' | 'miller' | 'natural-earth-1' | 'globe',
  initialZoom?: number,
  initialCenter?: { lon: number, lat: number } | null,
  minZoom?: number,
  maxZoom?: number,
  controls?: {
    enabled?: boolean,
    position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center',
    homeIconSvg?: string | null
  },
  gestures?: {
    panEnabled?: boolean,
    pinchZoomEnabled?: boolean,
    doubleTapZoomEnabled?: boolean,
    scrollWheelZoomEnabled?: boolean
  },
  animationDuration?: number,
  hoverTransitionDuration?: number,
  hoverTrail?: boolean,
  hoverRegionToFront?: boolean,
  zoomStep?: number,
  restoreLayerVisibilityOnHome?: boolean
}
```

### GlobalDefaults

```js
{
  markers?: MarkerDefaults,
  regions?: RegionDefaults,
  lines?: LineDefaults
}
```

### LayerDefaults

Same shape as `GlobalDefaults`.

### Source Object

```js
{
  id: string,
  name?: string,
  geojson: object | null
}
```

### Layer Object

```js
{
  id: string,
  name?: string,
  sourceId?: string | null,
  geojson?: object | null,
  visible?: boolean,
  antimeridianMode?: 'off' | 'auto' | 'unwrap',
  antimeridianReferenceLon?: number | null,
  regionJoinField?: string,
  defaults?: LayerDefaults,
  tooltip?: LayerTooltipOptions,
  regions?: RegionData[] | Record<string, RegionData>,
  markers?: MarkerObject[],
  lines?: LineObject[],
  bindings?: LayerBindings,
  labels?: LabelOptions,
  markerLabels?: MarkerLabelOptions,
  markerClusters?: MarkerClusterOptions,
  interaction?: LayerInteraction,
  regionStyle?: RegionStyleOptions,
  contributeToBounds?: boolean,
  includePolygonIds?: string[] | string | Set<string>,
  excludePolygonIds?: string[] | string | Set<string>
}
```

Notes:

- `antimeridianMode` defaults to `'auto'`.
- `antimeridianMode: 'auto'` unwraps dateline-crossing source polygons and lines before flat-map projection.
- `antimeridianMode: 'unwrap'` forces the same longitude-continuity pass even when detection is ambiguous.
- `antimeridianReferenceLon` is optional and biases unwrapped source geometry toward the preferred longitude copy closest to that value.
- `regionJoinField` controls which GeoJSON source-side field is used to match polygons to layer region records.
- `regionJoinField: 'id'` uses `feature.id`, with `properties.id` as a compatibility fallback.
- `tooltip` is layer-scoped presentation only. Supported keys are `template`, `className`, and `style`.
- Layer tooltip overrides do not change trigger, placement, pointer-follow, interactive persistence, or region visibility filtering.

### LayerTooltipOptions

```js
{
  template?: string,
  className?: string,
  style?: {
    background?: string,
    color?: string,
    borderRadius?: string,
    padding?: string,
    border?: string,
    boxShadow?: string,
    fontFamily?: string,
    fontSize?: string,
    lineHeight?: string,
    minWidth?: string,
    maxWidth?: string
  } | null
}
```

### LegendOptions

```js
{
  enabled?: boolean,
  type?: 'layers' | 'custom',
  interaction?: 'none' | 'toggle-layer-visibility',
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
  size?: 'sm' | 'md' | 'lg',
  entries?: LegendEntry[]
}
```

Notes:

- `entries` is used only when `type` is `'custom'`.
- `interaction` is used only when `type` is `'layers'`.

### LegendEntry

```js
{
  id?: string,
  label: string,
  color?: string
}
```

### RegionData

```js
{
  regionId?: string,
  id?: string,
  style?: FeatureStyle,
  hoverStyle?: FeatureStyle,
  bindings?: LayerBindings,
  tooltip?: string | ((context) => string | null),
  interaction?: LayerInteraction,
  [key: string]: any
}
```

Notes:

- Region records are layer-scoped metadata joined to GeoJSON polygons by id.
- If the resolved region `bindings.regionId` is a string, that field name is used instead of `regionId`.
- `tooltip` strings support templates such as `'<strong>{title}</strong>'`, direct lookups such as `'title'`, and literal text or HTML when the string is not a simple lookup key or dotted path.

### LayerBindings

```js
{
  regionId?: string | ((context) => string),
  fill?: string | ((context) => any),
  hoverFill?: string | ((context) => any),
  stroke?: string | ((context) => any),
  hoverStroke?: string | ((context) => any),
  strokeWidth?: string | ((context) => any),
  hoverStrokeWidth?: string | ((context) => any),
  opacity?: string | ((context) => any),
  hoverOpacity?: string | ((context) => any),
  lineDash?: string | ((context) => any),
  hoverLineDash?: string | ((context) => any),
  radius?: string | ((context) => any),
  hoverRadius?: string | ((context) => any),
  cursor?: string | ((context) => any),
  hoverCursor?: string | ((context) => any),
  tooltip?: string | ((context) => string | null)
}
```

Notes:

- String bindings without dots are looked up in `properties`, then `data`, then `region`, then `layer`, then `source`, then the raw `feature`, `marker`, or `line` object.
- String bindings with dots are treated as direct paths on the binding context, for example `region.color`.
- Tooltip bindings may be templates such as `'<strong>{title}</strong>'`, direct lookup keys such as `'title'`, literal text or HTML such as `'this is the tooltip'`, or resolver functions.
- Binding context includes `layer`, `source`, `feature`, `marker`, `line`, `region`, `properties`, and `data`.
- When a binding resolves the same field as an explicit item style, the binding wins.

### LabelOptions

```js
{
  enabled?: boolean,
  source?: 'layer-regions' | 'all-features',
  field?: string | ((context) => any) | null,
  fallbackFields?: Array<string | ((context) => any)>,
  positions?: {
    [regionJoinId: string]: {
      lon: number,
      lat: number
    }
  },
  font?: string,
  color?: string,
  background?: string | null,
  paddingX?: number,
  paddingY?: number,
  borderRadius?: number,
  minZoom?: number | null,
  maxZoom?: number | null
}
```

Notes:

- `source: 'layer-regions'` labels only polygons that have joined region data for that layer.
- `source: 'all-features'` labels every visible polygon feature in the layer.
- Default fallback fields are `title`, `name`, and `id`.
- Default `font` is `12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif` so accented and non-ASCII glyphs have stronger system-font fallback coverage.
- `positions` is keyed by the active layer `regionJoinField`, not always the raw GeoJSON feature id.
- A matching `positions[regionJoinId]` overrides the computed polygon-center anchor for that label.
- Global and layer-owned region label `positions` maps merge shallowly, with layer keys winning.
- When `positions[regionJoinId]` is missing, GeoCanvas also checks `feature.geocanvas.regionLabel.position` on the source GeoJSON feature.
- `font` controls the rendered region-label font string, including size.
- Hovering or clicking a region label emits the same polygon feature payload as interacting with the owning polygon.

### MarkerLabelOptions

```js
{
  enabled?: boolean,
  field?: string | ((context) => any) | null,
  fallbackFields?: Array<string | ((context) => any)>,
  font?: string,
  color?: string,
  background?: string | null,
  paddingX?: number,
  paddingY?: number,
  borderRadius?: number,
  position?: 'center' | 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
  offsetX?: number,
  offsetY?: number,
  distance?: number,
  minZoom?: number | null,
  maxZoom?: number | null,
  scaleWithZoom?: boolean,
  minScale?: number,
  maxScale?: number
}
```

Notes:

- Marker labels are rendered from marker screen positions instead of polygon bounds.
- Default fallback fields are `title`, `name`, `label`, and `id`.
- Default `font` is `12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif`.
- `position` sets the base side of the marker where the label is anchored.
- `offsetX` and `offsetY` apply an additional screen-space offset after `position` is resolved.
- `distance` controls the gap between the marker and the label anchor.
- `scaleWithZoom: true` scales label font, padding, border radius, offsets, and distance with zoom, clamped by `minScale` and `maxScale`.

### MarkerClusterOptions

```js
{
  enabled?: boolean,
  radius?: number,
  minPoints?: number,
  maxZoom?: number | null,
  clickToZoom?: boolean,
  zoomScale?: number | null,
  style?: MarkerStyle,
  labelFont?: string,
  labelColor?: string
}
```

Notes:

- `radius` is the clustering distance in screen pixels.
- `minPoints` is the minimum number of nearby markers required to form a cluster.
- `maxZoom` disables clustering above that zoom level.
- `clickToZoom: true` makes cluster clicks zoom in automatically.
- `zoomScale` overrides the zoom level used for cluster click-to-zoom.
- `style` applies to the rendered cluster bubble.
- Default `labelFont` is `12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif`.
- `labelFont` and `labelColor` style the cluster count text rendered inside the cluster bubble.

### MarkerDefaults

```js
{
  type?: 'circle' | 'image',
  image?: MarkerImage | null,
  animation?: false | MarkerAnimation | null,
  style?: MarkerStyle,
  hoverStyle?: MarkerStyle,
  labels?: false | MarkerLabelOptions,
  clusters?: false | MarkerClusterOptions,
  interaction?: false | LayerInteraction,
  bindings?: LayerBindings
}
```

Notes:

- `animation` sets the default marker animation inherited by markers in that scope.
- Use `animation: false` in layer defaults to explicitly turn off an inherited global marker animation.

### RegionDefaults

```js
{
  joinedStyle?: FeatureStyle,
  joinedHoverStyle?: FeatureStyle,
  emptyStyle?: FeatureStyle,
  emptyHoverStyle?: FeatureStyle,
  joinedInteractive?: boolean,
  emptyInteractive?: boolean,
  transforms?: {
    [regionJoinId: string]: RegionTransform
  },
  labels?: false | LabelOptions,
  interaction?: false | LayerInteraction,
  bindings?: LayerBindings
}
```

Notes:

- `joined*` applies to polygons with joined region data.
- `empty*` applies to polygons that exist in GeoJSON but do not have a joined region record.
- `transforms` is keyed by the active layer `regionJoinField`, not always the raw GeoJSON feature id.
- A matching `transforms[regionJoinId]` moves that region for display without changing the source GeoJSON coordinates.
- Layer-owned region `transforms` override global `transforms` for matching keys.
- Region transforms also affect computed polygon label anchors, builder-authored markers that fall inside the moved region, and line vertices that fall inside the moved region.
- Region transforms override `feature.geocanvas.regionTransform` metadata when both are present for the same region.

### RegionTransform

```js
{
  anchor?: {
    lon: number,
    lat: number
  },
  translate?: {
    lon: number,
    lat: number
  }
}
```

Accepted values:

- `{ lon, lat }` can be used as shorthand for `anchor` when authoring JSON manually in builder-like tools.
- `anchor` moves the region so its computed geographic bounds center lands on that lon/lat.
- `translate` applies a raw lon/lat offset to every coordinate in that region for display.

Notes:

- Multipolygon regions move as one grouped display unit.
- Source marker and line data remain in their original geographic coordinate system; the display transform is applied at render time.
- Region transforms are display-only and do not mutate the original GeoJSON source.

### GeoJSON Feature `geocanvas` Metadata

GeoCanvas also reads optional feature-level metadata from a GeoJSON feature foreign member:

```js
{
  geocanvas: {
    regionLabel?: {
      position?: { lon: number, lat: number }
    },
    regionTransform?: RegionTransform
  }
}
```

Notes:

- `feature.geocanvas.regionLabel.position` acts like a fallback region-label custom anchor when `labels.positions[regionJoinId]` is not provided.
- `feature.geocanvas.regionTransform` acts like a fallback region display transform when `regions.transforms[regionJoinId]` is not provided.

### LineDefaults

```js
{
  style?: FeatureStyle,
  hoverStyle?: FeatureStyle,
  bindings?: LayerBindings
}
```

### LayerInteraction

```js
{
  click?: {
    zoomTo?: false | 'target' | 'feature' | 'marker',
    zoomPadding?: number,
    zoomMax?: number | null,
    zoomScale?: number | null,
    showLayers?: string[] | string,
    hideLayers?: string[] | string,
    toggleLayers?: string[] | string,
    emptyRegions?: boolean,
    action?: false | {
      type: 'navigate' | 'lightbox' | 'panel',
      url?: string | ((payload, geo) => string | null),
      content?: string | ((payload, geo) => string | null),
      title?: string | ((payload, geo) => string | null),
      render?: 'auto' | 'iframe' | 'html' | 'text',
      target?: 'self' | 'blank',
      placement?: 'below' | 'right' | 'left' | 'above',
      mode?: 'layout' | 'overlay',
      className?: string,
      iframe?: {
        sandbox?: string,
        allow?: string,
        loading?: 'eager' | 'lazy',
        referrerPolicy?: string
      },
      lightbox?: {
        width?: string,
        maxWidth?: string,
        height?: string,
        maxHeight?: string,
        padding?: string,
        background?: string,
        color?: string,
        borderRadius?: string,
        boxShadow?: string,
        backdrop?: string,
        closeOnBackdrop?: boolean,
        closeOnEscape?: boolean,
        showCloseButton?: boolean
      },
      panel?: {
        size?: string,
        padding?: string,
        background?: string,
        color?: string,
        border?: string,
        borderRadius?: string,
        gap?: string,
        closeable?: boolean,
        closeOnEmptyRegionClick?: boolean,
        closeOnMapClick?: boolean
      }
    },
    handler?: (payload, geo) => void
  }
}
```

Notes:

- Click interaction runs after the normal `featureclick` or `markerclick` event is emitted.
- Use `false` on an inheritable interaction group to disable the resolved click behavior at that level.
- `showLayers`, `hideLayers`, and `toggleLayers` make overview-to-detail drilldown flows declarative.
- `showLayers`, `hideLayers`, and `toggleLayers` accept layer ids. Exact unique layer names also resolve to their matching ids at runtime.
- When a declarative click interaction both zooms and hides layers, the hide is deferred until the zoom completes and then fades the outgoing layer out.
- `emptyRegions: false` keeps unjoined polygons hoverable if `emptyInteractive` is still enabled, but suppresses click-triggered zoom, layer visibility changes, handlers, and built-in actions for those empty regions.
- `action: false` disables only the inherited terminal built-in action while preserving zoom and visibility side effects.
- `url`, `content`, and `title` accept literal strings, `{field}` templates, or resolver functions.
- string templates resolve against the click payload, so values such as `{data.actionContent}`, `{data.name}`, and `{properties.name}` are valid.
- `render: 'auto'` chooses iframe rendering when `url` resolves and trusted HTML rendering when `content` resolves.
- `panel.mode` defaults to `'layout'`, `panel.placement` defaults to `'below'`, and one shared panel surface is reused per `GeoCanvas` instance.
- `panel.borderRadius` defaults to the built-in mode-specific surface radius when omitted.
- `panel.closeOnEmptyRegionClick: true` closes an open built-in panel when a click lands on an unjoined polygon.
- `panel.closeOnMapClick: true` closes an open built-in panel when a click lands on empty map background.
- `handler(payload, geo)` runs after declarative zoom and visibility changes but before terminal built-in actions such as navigation, lightbox, or panel rendering.

### RegionStyleOptions

```js
{
  defaultFill?: string | null,
  defaultStroke?: string | null,
  defaultStrokeWidth?: number | null,
  defaultOpacity?: number | null,
  emptyFill?: string | null,
  emptyStroke?: string | null,
  emptyStrokeWidth?: number | null,
  emptyOpacity?: number | null,
  interactive?: boolean,
  emptyInteractive?: boolean
}
```

Notes:

- `default*` values apply to polygons that have joined region data in the layer.
- `empty*` values apply to polygons that are present in the GeoJSON source but missing from the joined region collection.
- `emptyInteractive: false` keeps empty polygons visible while removing them from hover, tooltip, and built-in click behavior.
- `featureclick` still emits for those empty polygons, which lets builder-style inspection UIs react to the click without re-enabling hover or click actions.
- `emptyInteractive: true` can be paired with `interaction.click.emptyRegions: false` when empty polygons should still show hover state or tooltips but should not trigger click behavior.

## Events

### Feature Events

Event names:

- `featureenter`
- `featureleave`
- `featuremove`
- `featureclick`

Triggered for:

- GeoJSON polygons
- GeoJSON multipolygon groups
- GeoJSON lines
- GeoJSON points
- custom lines

Notes:

- Hovering or clicking a region label emits the same feature event stream as the owning polygon and keeps `payload.type === 'polygon'`.

### Marker Events

Event names:

- `markerenter`
- `markerleave`
- `markermove`
- `markerclick`

Triggered for:

- custom markers, including both circle and image markers, plus synthetic marker clusters

### View Events

Event names:

- `zoomend`

Triggered for:

- `zoomIn()`
- `zoomOut()`
- `setZoom()`
- `resetView()` when it changes zoom
- `fitProjectedBounds()`
- `zoomToFeature()`
- `zoomToMarker()`
- zoom controls
- home button when it changes zoom
- pinch zoom when the gesture ends
- double tap / double click zoom when the animation ends
- scroll wheel zoom after the immediate zoom update is applied
- layer click drilldown zoom behavior

### Feature And Marker Event Payload

```js
{
  type: 'polygon' | 'line' | 'point' | 'marker',
  id: string,
  regionJoinId: string | null,
  layerId: string | null,
  layerName: string | null,
  geometryType: string,
  properties: Record<string, any>,
  data: any,
  region: RegionData | null,
  layer: { id: string, name: string } | null,
  source: { id: string, name: string } | null,
  cluster?: {
    count: number,
    markerIds: string[],
    markers: Marker[],
    center: { lon: number, lat: number }
  },
  screenX: number,
  screenY: number,
  originalEvent: PointerEvent | MouseEvent
}
```

Notes:

- `geometryType` reflects the source geometry type such as `Polygon`, `MultiPolygon`, `LineString`, `MultiLineString`, `Point`, or `MultiPoint`.
- `regionJoinId` reflects the polygon’s resolved layer join id when available, which can differ from `id` when the layer joins on `properties.*`.
- For grouped multipolygon hover and tooltip behavior, payload metadata remains aligned to the grouped source feature.
- Cluster payloads include a `cluster` object with the grouped markers and computed center.

### `zoomend` Payload

```js
{
  zoom: number,
  previousZoom: number,
  center: { lon: number, lat: number },
  previousCenter: { lon: number, lat: number },
  trigger:
    | 'zoomIn'
    | 'zoomOut'
    | 'setZoom'
    | 'resetView'
    | 'fitProjectedBounds'
    | 'zoomToFeature'
    | 'zoomToMarker'
    | 'double-tap'
    | 'double-click'
    | 'wheel'
    | 'pinch'
}
```

Notes:

- `zoomend` fires once per completed zoom change.
- Pure center-only camera moves such as `setCenter()` do not emit `zoomend`.

## Glossary

### Feature

A normalized GeoJSON-derived item rendered by the library. This includes polygons, lines, and points from GeoJSON.

### Marker

A custom point added through `setMarkers` / `addMarker`, owned by a layer, or represented by a synthetic cluster target during rendering.

### Line

A custom line added through `setLines` / `addLine` or owned by a layer.

### Hover Target

The current interactive item under the pointer. Multipolygon hover targets are grouped so the full feature behaves as one region.

### Home View

The view returned by `resetView()`. It is either fit-to-data or the explicit `initialZoom` and `initialCenter` configuration.

### Projection

The coordinate transformation applied before fit and camera transforms. `fit` means raw coordinate fit.
