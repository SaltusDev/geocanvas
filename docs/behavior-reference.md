# GeoCanvas Behavior Reference

## Rendering Model

### Visible Canvas

GeoCanvas draws the user-visible map to a canvas using the current data, projection, styles, and camera view.

### Hidden Hit-Test Canvas

GeoCanvas also draws an off-screen hit-test canvas with encoded colors for each interactive target.

Notes:

- Picking uses per-target color ids for O(1) lookup.
- Hover, click, tooltip, and cursor behavior all depend on this hit-test layer.
- Polygon hit areas are validated against the polygon fill at the pointer location before hover or click behavior is accepted.
- Polygon hit-testing uses fill coverage only on the hidden canvas; widened edge strokes are reserved for line-like targets such as lines and markers.
- When a border pixel resolves ambiguously, GeoCanvas samples nearby hit pixels and prefers a polygon that actually contains the pointer in screen space.

## Render Order

Visible render order:

1. GeoJSON polygons across visible layers in layer order
2. GeoJSON lines across visible layers in layer order
3. layer-owned custom lines in layer order
4. global custom lines
4. GeoJSON points across visible layers in layer order
5. layer-owned custom markers in layer order
6. global custom markers

Notes:

- Later items visually appear on top of earlier items.
- Hit-testing follows the same draw order because each target gets its own hit layer paint.

## Layer Model

GeoCanvas can render multiple GeoJSON layers together.

Current rules:

- global inheritance can be updated at runtime through `setDefaults(...)`
- layer inheritance can be updated at runtime through `setLayerDefaults(...)`
- layer tooltip presentation can be updated at runtime through `setLayerTooltipOptions(...)`
- layer order is insertion order
- a layer may reference reusable GeoJSON through `sourceId` or provide inline `geojson`
- inline layer `geojson` and reusable source `geojson` may be passed as parsed objects or as valid JSON strings
- a layer may define inheritable defaults through `layer.defaults.markers`, `layer.defaults.regions`, and `layer.defaults.lines`
- a layer may define `regionJoinField` to join polygons by a source-side `properties.*` field instead of the default id field
- a layer may define `tooltip` presentation overrides for fallback template, class name, and inline style
- a layer may also own `regions`, `markers`, and `lines`
- the legacy layer aliases `labels`, `markerLabels`, `markerClusters`, `interaction`, `regionStyle`, and `bindings` still map into the new defaults model
- only visible layers contribute to rendering and hit-testing
- only visible layers with `contributeToBounds !== false` contribute their GeoJSON features to visible-bounds calculations
- each layer can define its own `includePolygonIds` and `excludePolygonIds`
- region data is joined to polygon features by `regionJoinField`
- when `regionJoinField === 'id'`, GeoCanvas checks `feature.id` first, then `properties.id`
- polygon filters are evaluated per layer, not globally across the full map
- if all layers are hidden, GeoCanvas keeps the current view instead of fitting empty bounds

### Reusable Sources

- sources are normalized once and can be shared across multiple layers
- valid JSON strings are parsed into source GeoJSON records during normalization
- multiple layers can point at the same `sourceId` while carrying different region data, markers, lines, and visibility
- removing a source does not delete its layers, but those layers stop rendering GeoJSON features until the source is available again

## Multipolygon Hover And Tooltip Grouping

GeoJSON multipolygons are flattened internally for rendering and hit-testing, but they behave as a grouped interactive feature.

Current behavior:

- hovering one polygon part highlights the full multipolygon group
- moving between parts of the same multipolygon does not trigger a leave/enter transition
- tooltip payload metadata stays aligned to the grouped feature rather than changing per polygon part

This makes multipolygons feel like one region even though they render as multiple polygon paths.

## Tooltip Semantics

### Template Resolution

Tooltip templates use `{key}` placeholders.

Lookup order:

1. `payload.properties[key]`
2. `payload.data[key]`
3. `payload.region[key]`
4. `payload.layer[key]`
5. `payload.source[key]`
6. `''`

Tooltip HTML is inserted as raw HTML.

### Layer Tooltip Bindings

- if a layer item provides a resolved `bindings.tooltip` value or item tooltip override, that item-specific tooltip content is used first
- the resolved item tooltip value is also exposed as `tooltipContent` while rendering the active layer or global tooltip template, so templates can wrap item content with strings such as `XXX {tooltipContent} XXX`
- if no item-level tooltip content resolves, `layer.tooltip.template` is used before the global tooltip template
- `layer.tooltip.className` and `layer.tooltip.style` override the global tooltip presentation for items in that layer
- layer tooltip overrides are presentation-only and do not change global trigger, placement, pointer-follow, interactive persistence, or `regions.visibility`
- string tooltip bindings may be templates with `{key}` placeholders, direct context lookups such as `title`, or literal text / HTML when the string is not a simple lookup key or dotted path
- tooltip binding functions receive the layer binding context

### Trigger And Placement

- `trigger: 'hover'` shows tooltip content during hover
- `trigger: 'click'` shows tooltip content when a target is clicked and hides it when empty canvas space is clicked
- `trigger: 'none'` disables tooltip display entirely
- `regions.visibility: 'joined-only'` allows polygon hover and click behavior to continue while suppressing tooltip display for polygons that have no joined region record in that layer
- `position` controls whether the tooltip is placed above, below, left, right, or auto-resolved around the anchor point
- `followPointer: true` updates the anchor while the pointer moves
- `interactive: true` allows the tooltip to persist while hovered or focused
- `showPointer: true` adds a small tooltip arrow that tracks the resolved placement

### Compatibility Modes

- `mode: 'follow'` maps to hover-triggered pointer-following behavior
- `mode: 'fixed'` maps to hover-triggered anchored behavior
- `mode: 'interactive-fixed'` maps to hover-triggered anchored interactive behavior

### Render Function Precedence

If `tooltip.render(payload)` is provided, it is used instead of `tooltip.template`.

## Legend Overlay

Current behavior:

- legend rendering is global to the `GeoCanvas` instance
- `type: 'layers'` mirrors the current layer order and uses each layer's resolved joined-region fill as the swatch color
- `type: 'custom'` renders the configured custom legend entries in order
- legends can be positioned in any corner of the map surface
- `size` scales the legend card padding, text size, and swatch size together
- `interaction: 'toggle-layer-visibility'` only applies to layer legends and toggles that layer's `visible` state
- hidden layers stay in the legend and render in a dimmed state instead of disappearing from the legend list
- legend interactions do not change tooltip trigger, tooltip persistence, or hover behavior

## Click Interaction

Resolved click interaction is evaluated after the normal click event payload is emitted.

Current behavior:

- marker and region click actions may be inherited from global defaults, overridden by layer defaults, and overridden again per item
- click actions may show, hide, or toggle other layers
- layer visibility targets can be authored as layer ids or as exact unique layer names, which resolve to ids before the visibility change runs
- layer visibility changes preserve the current camera framing instead of re-fitting the remaining visible bounds
- click actions may zoom to the clicked feature or marker
- layer visibility changes are the canonical drilldown mechanism, for example `zoomTo: 'feature'` plus `showLayers: ['australia-detail']`
- when a click interaction both zooms and hides a layer, the hide waits until the zoom completes and then fades the outgoing layer away
- click actions may perform one terminal built-in action: navigate, lightbox, or panel
- built-in action templates resolve against the click payload, including per-item `data.*` fields such as `data.actionContent`
- empty regions can stay hoverable and tooltip-enabled while skipping click behavior by setting `click.emptyRegions: false`
- lightbox content can render trusted HTML or an iframe
- lightboxes render as viewport overlays instead of being clipped to the map surface bounds
- panel content can render trusted HTML or an iframe above, below, left, or right of the map in either `layout` or `overlay` mode
- panel surfaces can override `borderRadius`, and the panel card clips its content to those rounded corners
- built-in lightbox and panel actions animate on open and close with a short fade-and-slide transition
- built-in lightbox and panel transitions respect `prefers-reduced-motion` and become instant when reduced motion is requested
- built-in panels can optionally close when a click lands on an empty region or on empty map background
- custom click handlers receive the payload plus the `GeoCanvas` instance after declarative zoom and visibility changes but before the terminal built-in action
- the built-in home button can optionally restore the captured home visibility snapshot before resetting the view
- the built-in home button shows `H` by default and can render inline SVG markup instead when `view.controls.homeIconSvg` or the legacy `homeIconSvg` alias is set
- the built-in home button also closes any active lightbox or panel UI

## Camera Behavior

GeoCanvas applies camera behavior after projection and fit calculations.

Runtime configuration:

- grouped camera and controls options can be updated through `setViewOptions(...)`
- legacy helpers such as `setProjection(...)`, `setControlsOptions(...)`, and `setInteractionOptions(...)` remain available as compatibility wrappers

Camera features:

- zoom
- center
- home view
- animated transitions
- drag-pan

### Home View

Home view is recomputed when GeoJSON data, projection, polygon filters, or viewport size change.

Rules:

- without `initialZoom` and `initialCenter`, home view is fit-to-data
- with either `initialZoom` or `initialCenter`, home view becomes explicit
- `resetView()` returns to the current home view

### Smooth Animation

The following methods animate by default:

- `zoomIn`
- `zoomOut`
- `setZoom`
- `setCenter`
- `resetView`

Notes:

- animation can be disabled per call with `{ animate: false }`
- a new animation or drag-pan interrupts the previous animation
- camera center changes are clamped to the current projected data bounds
- camera animations use an ease-out timing curve, so movement starts quickly and slows near the end
- animated camera moves interpolate the full screen-space camera transform so zoom-to-target transitions stay smooth and directional without visible arcing
- in `globe` mode, animated center changes rotate the hemisphere along the shortest spherical path instead of interpolating raw longitude/latitude
- completed zoom changes emit `zoomend` after the final zoomed view is committed

### Drag-Pan

Pan behavior:

- enabled by default
- works with pointer input, including mouse drag and touch drag
- uses the current projection, fit transform, and camera zoom
- prevents the fitted GeoJSON bounds from being dragged completely out of the viewport
- if the full dataset already fits inside the viewport at the current zoom, drag-pan keeps the map centered on that axis
- in `globe` mode, the same drag interaction rotates the globe by changing the visible hemisphere center
- globe rotation is immediate and direct; there is no inertial spin

### Gesture Zoom

Current behavior:

- pinch zoom is enabled by default
- double tap / double click zoom is enabled by default
- scroll wheel zoom is disabled by default
- on flat projections, pinch, double tap / click, and wheel zoom anchor around the interaction point
- in `globe` mode, zoom gestures scale the globe around the viewport center instead of translating the camera toward the pointer
- gesture zoom respects the same camera clamping rules as drag-pan and programmatic center changes
- suppresses tooltip display while actively dragging
- pinch emits `zoomend` when the gesture finishes
- double tap / click emits `zoomend` after the zoom animation completes
- wheel zoom emits `zoomend` immediately after the zoomed view is applied

## Projection Model

Supported public projection names:

- `fit`
- `mercator`
- `albers`
- `albers-usa`
- `albers-usa-territories`
- `portugal-composite`
- `spain-composite`
- `france-composite`
- `equal-earth`
- `miller`
- `natural-earth-1`
- `globe`

Rules:

- projections are dependency-free and built into the library
- projection is applied before fit-to-viewport and camera transforms
- bounds are computed in projected space
- markers, custom lines, hover, tooltips, and hit-testing all use the active projection
- flat-map layers use `antimeridianMode: 'auto'` by default, which unwraps source polygons and lines that cross the 180° longitude seam before projection
- `antimeridianReferenceLon` can bias those unwrapped shapes toward a preferred longitude copy
- `globe` uses an orthographic render instead of a flat projected plane
- in `globe` mode, only the visible hemisphere participates in drawing, hover, click, and tooltip hit-testing
- globe polygon clipping follows the visible horizon arc instead of closing clipped shapes with a straight limb chord, which reduces edge artifacts while rotating near the hemisphere boundary

### `fit`

`fit` is not a geographic projection. It uses raw input coordinates directly and fits them to the viewport.

Rules:

- when `antimeridianMode` unwraps a source feature, `fit` uses that unwrapped longitude-continuous copy for bounds, labels, hover, and click hit-testing

### `albers`

`albers` uses built-in defaults. Projection-specific parameter tuning is not part of the current public API.

### `albers-usa`

`albers-usa` is a built-in composite projection for U.S.-focused maps.

Rules:

- uses separate equal-area conic insets for the contiguous U.S., Alaska, Hawaii, and Puerto Rico
- keeps click, hover, tooltip, and inverse projection behavior working across the inset layout

### `albers-usa-territories`

`albers-usa-territories` extends `albers-usa` with additional U.S. territory insets.

Rules:

- adds Guam / Northern Mariana Islands, American Samoa, and the U.S. Virgin Islands
- useful for congressional-district or national-jurisdiction maps that need all major U.S. territories visible in one view

### `portugal-composite`

`portugal-composite` is a built-in composite projection for Portugal-focused maps.

Rules:

- uses separate conformal inset layouts for mainland Portugal, Madeira, and the Azores
- useful when Atlantic islands should appear close to the mainland in one map view
- the built-in inset layout is tuned to use more of a typical landscape viewport than a raw Portugal-wide geographic extent
- each inset scales from the visible geometry inside that inset when data is available, so large empty ocean portions inside the inset envelope do not compress the drawn Portuguese regions as much

### `spain-composite`

`spain-composite` is a built-in composite projection for Spain-focused maps.

Rules:

- uses separate conformal inset layouts for mainland Spain, the Balearic Islands, and the Canary Islands
- useful when the Canary Islands should be shown near the mainland without distorting the rest of Iberia
- each inset scales from the visible geometry inside that inset when data is available, which helps the drawn shapes use more of the allocated inset box
- fits the visible data only, so mainland-heavy datasets can still end up height-limited on wide screens

### `france-composite`

`france-composite` is a built-in composite projection for France-focused maps.

Rules:

- uses a metropolitan France inset plus major overseas groups such as the Caribbean, French Guiana, Indian Ocean territories, and Pacific territories
- intended for all-France overview maps rather than locally accurate regional cartography for one overseas collectivity
- each inset scales from the visible geometry inside that inset when data is available, which reduces wasted space from broad overseas inset envelopes
- if a source only includes metropolitan France or another subset of French territories, fit-to-viewport uses only the visible subset instead of reserving space for missing overseas insets

### `globe`

`globe` renders an orthographic hemisphere centered on the current view center.

Rules:

- the view center acts as the visible hemisphere center, not as a flat pan offset
- drag interaction rotates the globe when `panEnabled` is true
- pinch, double tap / click, and wheel zoom change globe scale without introducing flat-map panning
- polygons, lines, points, and markers on the back hemisphere are not rendered or hit-testable
- polygons that intersect the limb close along the horizon arc instead of a straight chord
- labels are currently suppressed in globe mode, including near the horizon

## Polygon Filtering

Polygon filtering only affects polygon and multipolygon GeoJSON features.

Rules:

- filtering is stored on each layer independently
- line and point features are not filtered by polygon id filters
- matching checks `feature.id` first, then `properties.id`
- exclusion wins over inclusion
- filtered-out polygons do not contribute to bounds, home view, hit-testing, hover, or tooltips

## Responsiveness And Resize Behavior

GeoCanvas is responsive to its container.

Current behavior:

- if a container element is used, GeoCanvas creates a canvas styled to fill that container
- a `ResizeObserver` watches the container when available
- resizing updates the drawing buffer, hit-test buffer, base transform, and rendered output
- if `resize()` is called without arguments, the library measures the container first and then falls back to the canvas box

Notes:

- explicit `resize(width, height)` sets a concrete viewport size
- auto-resize does not permanently force fixed CSS pixel sizing when the library owns the canvas

## Event Semantics

### Enter And Leave

- `featureenter` and `markerenter` fire when the pointer enters a new interactive target
- `featureleave` and `markerleave` fire when the pointer leaves a target
- grouped multipolygon movement does not cause redundant leave/enter transitions across its own parts

### Move

- `featuremove` and `markermove` fire while the pointer stays over a target
- payload `screenX` and `screenY` continue updating even when grouped feature metadata stays stable

### Hover Transition

- hovered targets animate between their base style and hover style instead of switching instantly
- the same transition runs for hover enter and hover leave
- `hoverTransitionDuration` controls the length of that interpolation in milliseconds
- `hoverTransitionDuration: 0` disables the transition and keeps the previous immediate behavior
- `hoverTrail: true` lets previously hovered targets keep easing their hover colors back out even after the pointer has already entered a different target
- `hoverTrail: false` clears those overlapping hover-color trails when a new target is entered, but hover-out to empty space still animates from the current interpolated state
- `hoverRegionToFront: true` redraws the currently hovered polygon region after the rest of the polygon pass so its hover border is not hidden under neighboring region borders
- hover-trail behavior only affects hover style interpolation and does not change tooltip trigger, tooltip persistence, or tooltip grouping behavior
- hover-region-to-front behavior changes polygon draw order only while a polygon region is hovered; it does not change hit-testing, tooltip grouping, or line/marker order

### Click

- click events fire only when the pointer-up sequence is not treated as a drag-pan gesture

### View End

- `zoomend` fires once for each completed zoom change, regardless of whether the zoom came from API calls, controls, gestures, or declarative click interactions
- `zoomend` does not fire for pure pans or center-only camera updates

## Styling Resolution

Style resolution order:

### Inheritance Rules

- `undefined` and `null` mean inherit from the level above
- `false` disables inheritable groups such as labels, clustering, and click interaction
- literal visual values such as `fill: 'transparent'` and `opacity: 0` are treated as real style values, not inheritance markers
- bindings win over explicit item style values when both resolve the same field

### GeoJSON Features

1. built-in default feature style
2. resolved global and layer region defaults for joined or empty polygons
3. `styleFeature(feature)` result
4. explicit region item `style`
5. resolved bindings such as `fill`, `stroke`, or `opacity`
6. resolved hover defaults and explicit item `hoverStyle`
7. active hover feature style and hover bindings

### Custom Markers

1. built-in default marker style
2. resolved global and layer marker defaults
3. `styleMarker(marker)` result
4. marker object `style`
5. resolved bindings
6. resolved hover defaults and marker `hoverStyle`
7. active hover marker style

Current behavior:

- markers default to `type: 'circle'`
- markers can inherit default `type` and `image` settings from resolved marker defaults
- markers can also inherit default `animation` settings from resolved marker defaults
- image markers use `type: 'image'` and render with `image.src` or inline `image.svg`
- inline SVG image markers that use `currentColor` resolve that color from the marker's active `fill`, so hover fill overrides can recolor the same SVG asset
- image marker anchors can use named presets such as `bottom`, `center`, `topLeft`, and `bottomRight`
- image marker anchors also support explicit `image.anchorX` and `image.anchorY`, measured from the image's top-left corner
- if both preset and numeric anchors are provided, `image.anchorX` and `image.anchorY` win
- anchors scale proportionally if the rendered image size changes
- inline SVG image markers that recolor on hover reuse stable base / hover image variants so hover transitions do not flash the circle fallback while a recolored image is loading
- image markers keep screen-space sizing during zoom, like circle markers
- loaded image markers use the rendered image alpha mask for hit-testing, so transparent parts of the asset do not trigger hover or tooltips
- image marker alpha-mask hit-testing is isolated per marker, so transparent padding in one image marker does not erase other markers or regions from the shared hit map
- while an image asset is still loading or has failed, image marker hit-testing temporarily falls back to the image bounding box
- if an image marker asset is still loading or fails to load, GeoCanvas temporarily falls back to a circle marker so the marker remains visible and interactive
- markers can opt into canvas-rendered animation through `marker.animation`
- `pulse` draws a ring around the base marker without increasing the marker's hit area
- `breathe` scales the rendered marker while keeping hit-testing anchored to the base marker radius or image bounds
- `spin` rotates the rendered image marker while keeping its hit-testing anchored to the unrotated image box
- animated markers only schedule animation frames while at least one visible animated marker is present
- marker animations respect `prefers-reduced-motion` and become static when reduced motion is requested
- marker labels can be configured globally or per layer through `markerLabels`
- marker clustering can be configured globally or per layer through `markerClusters`
- cluster bubbles are rendered as synthetic circle markers with a count label
- cluster hit-testing uses the same marker event path as regular markers

### Custom Lines

1. built-in default feature style
2. resolved global and layer line defaults
3. line object `style`
4. resolved bindings
5. line `hoverStyle`
6. active hover feature style

Current behavior:

- custom lines can be authored from explicit `coordinates` or from ordered `markerRefs`
- `markerRefs` resolve against global markers by `markerId`, or against layer-owned markers by `layerId` plus `markerId`
- linked lines follow marker display positions, so layer transforms and future marker moves are reflected automatically
- if fewer than two linked marker refs resolve, the line is skipped until enough markers are available
- custom lines accept `pathMode: 'polyline' | 'geodesic'`
- on `globe`, custom lines default to geodesic rendering when `pathMode` is not set
- geodesic globe lines are sampled along the great-circle path before clipping to the visible hemisphere, which keeps them visually anchored to the globe while rotating

## Region Interactivity

Current behavior:

- polygon interactivity can be controlled through resolved region defaults, including `joinedInteractive` and `emptyInteractive`
- "empty" means the polygon is present in GeoJSON but has no joined region record in the layer collection
- empty polygons can still render with `emptyFill` / `emptyStroke` while being removed from normal hover and tooltip targeting
- when `emptyInteractive: false`, empty polygons do not produce hover, tooltip, or built-in click behavior
- `featureclick` still emits for clicked empty polygons so inspection UIs can surface the polygon details without re-enabling hover or declarative click actions
- `regions.transforms[joinId]` can move a polygon or multipolygon region for display without changing the source GeoJSON
- moved regions keep their transformed geometry for rendering, hit-testing, hover, and click behavior
- `feature.geocanvas.regionTransform` is used as a fallback when there is no matching configured `regions.transforms[joinId]`

## Label Rendering

Current behavior:

- labels are rendered per visible layer when `labels.enabled` is true
- labels are currently derived from polygon features
- `source: 'layer-regions'` limits labels to polygons with joined region data
- `source: 'all-features'` labels all visible polygon features in the layer
- label text uses `labels.field` first, then `labels.fallbackFields`
- region labels default to `12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif` for broader accented-glyph coverage on canvas
- `labels.positions[joinId] = { lon, lat }` overrides the computed anchor for that polygon label
- custom label anchors are keyed by the layer’s resolved `regionJoinField`
- when no matching configured anchor exists, GeoCanvas also checks `feature.geocanvas.regionLabel.position`
- grouped multipolygons render one label using the grouped bounds center
- hovering or clicking a region label resolves back to the owning polygon, so feature events, tooltips, hover styling, and declarative click behavior stay consistent
- labels for noninteractive empty polygons still follow the polygon rules: hover remains suppressed, while click inspection can still emit `featureclick`
- labels render above GeoJSON polygons and lines, but below custom overlay lines and markers

## Marker Label Rendering

Current behavior:

- marker labels render after markers, so labels appear above both circle and image markers
- global marker labels use `defaults.markers.labels`, constructor `markerLabels`, or `setMarkerLabelOptions(...)`
- layer-owned marker labels use `layer.defaults.markers.labels`, `layer.markerLabels`, or `setLayerMarkerLabels(...)`
- label text uses `markerLabels.field` first, then `markerLabels.fallbackFields`
- marker labels default to `12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif`
- fallback lookup can resolve from top-level marker fields such as `title`, `name`, and `label`, as well as `properties`, `data`, `layer`, and `source`
- labels support fixed placement through `position`, plus `offsetX`, `offsetY`, and `distance`
- `scaleWithZoom: true` scales marker-label screen styling with zoom and clamps that scaling with `minScale` and `maxScale`
- marker labels also render in `globe` mode for markers on the visible hemisphere

## Marker Clustering

Current behavior:

- clustering is computed in screen space from the current rendered marker positions
- region transforms are applied before marker projection and clustering, so markers inside moved regions cluster at their moved display positions
- clustering can be enabled globally with `defaults.markers.clusters`, constructor `markerClusters`, or `setMarkerClusterOptions(...)`
- layer-owned clustering uses `layer.defaults.markers.clusters`, `layer.markerClusters`, or `setLayerMarkerClusters(...)`
- markers only cluster with other markers from the same collection:
  - layer-owned markers cluster with markers from the same layer
  - global markers cluster with other global markers
- clusters are formed only when a group reaches `minPoints`
- clustering is disabled above `maxZoom` when that option is set
- clicking a cluster zooms in by default when `clickToZoom` is true
- when zooming in reaches the frame where a cluster opens, the cluster stays visible until that frame, then individual member markers animate out from the cluster position into their resolved screen positions
- opening clusters fade out as their member markers animate into place
- when zooming out reaches the frame where individual markers become a cluster, those markers fade out while moving toward the cluster position
- closing clusters fade in as their member markers collapse into place
- cluster expansion transitions respect `prefers-reduced-motion` and become instant when reduced motion is requested
- cluster marker events include a `cluster` payload object with the grouped markers, ids, count, and computed center
- cluster count labels default to `12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif`
- individual marker labels are suppressed for markers that are currently represented by a cluster bubble
