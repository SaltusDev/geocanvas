const DEFAULT_FEATURE_STYLE = {
  fill: '#88b4d6',
  stroke: '#2f4860',
  strokeWidth: 1,
  opacity: 1,
  lineDash: [],
  radius: 4,
  cursor: 'pointer'
};

const DEFAULT_MARKER_STYLE = {
  fill: '#e74c3c',
  stroke: '#ffffff',
  strokeWidth: 1.5,
  opacity: 1,
  lineDash: [],
  radius: 5,
  cursor: 'pointer'
};
const DEFAULT_CLUSTER_MARKER_STYLE = {
  fill: '#355c7d',
  stroke: '#ffffff',
  strokeWidth: 1.5,
  opacity: 1,
  lineDash: [],
  radius: 12,
  cursor: 'pointer'
};
const DEFAULT_IMAGE_MARKER_SIZE = 24;
const MARKER_ANIMATION_KINDS = new Set(['pulse', 'breathe', 'spin']);
const MARKER_ANIMATION_EASINGS = new Set(['linear', 'ease-in-out', 'ease-out']);
const DEFAULT_MARKER_ANIMATION_DURATIONS = {
  pulse: 1600,
  breathe: 2200,
  spin: 4000
};
const DEFAULT_MARKER_ANIMATION_SCALE_RANGES = {
  pulse: { from: 1, to: 2.2 },
  breathe: { from: 0.92, to: 1.12 }
};
const DEFAULT_MARKER_ANIMATION_OPACITY_RANGE = { from: 0.45, to: 0 };
const DEFAULT_MARKER_ANIMATION_SPIN_DEGREES = 360;
const MARKER_IMAGE_ANCHOR_PRESETS = new Set([
  'top',
  'topLeft',
  'topRight',
  'center',
  'centerRight',
  'centerLeft',
  'bottomLeft',
  'bottom',
  'bottomRight'
]);

const DEFAULT_TOOLTIP_OPTIONS = {
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
};
const LEGEND_POSITIONS = new Set(['top-right', 'top-left', 'bottom-right', 'bottom-left']);
const LEGEND_SIZES = new Set(['sm', 'md', 'lg']);
const LEGEND_TYPES = new Set(['layers', 'custom']);
const LEGEND_INTERACTIONS = new Set(['none', 'toggle-layer-visibility']);
const DEFAULT_LEGEND_OPTIONS = {
  enabled: false,
  type: 'layers',
  interaction: 'none',
  position: 'bottom-right',
  size: 'md',
  entries: []
};

const DEFAULT_CONTROLS_POSITION = 'top-right';
const DEFAULT_MIN_ZOOM = 0.5;
const DEFAULT_MAX_ZOOM = 8;
const DEFAULT_PROJECTION = 'fit';
const DEFAULT_ANIMATION_DURATION = 500;
const DEFAULT_ZOOM_STEP = 1.2;
const DEFAULT_HOVER_TRANSITION_DURATION = 140;
const DEFAULT_HOVER_TRAIL = true;
const DEFAULT_LAYER_HIDE_FADE_DURATION = 180;
const DEFAULT_CLUSTER_EXPANSION_DURATION = 240;
const DEFAULT_ACTION_UI_ANIMATION_DURATION = 220;
const ACTION_UI_ANIMATION_EASING = 'cubic-bezier(0.2, 0, 0, 1)';
const DOUBLE_TAP_DELAY_MS = 320;
const DOUBLE_TAP_DISTANCE_PX = 24;
const DEFAULT_LAYER_ID = 'default';
const DEFAULT_LAYER_NAME = 'Default Layer';
const DEFAULT_LABEL_FALLBACK_FIELDS = ['title', 'name', 'id'];
const DEFAULT_MARKER_LABEL_FALLBACK_FIELDS = ['title', 'name', 'label', 'id'];
const DEFAULT_CANVAS_LABEL_FONT = '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif';
const DEFAULT_CLUSTER_LABEL_FONT = DEFAULT_CANVAS_LABEL_FONT;
const CLICK_ACTION_TYPES = new Set(['navigate', 'lightbox', 'panel']);
const CLICK_ACTION_RENDER_MODES = new Set(['auto', 'iframe', 'html', 'text']);
const CLICK_ACTION_TARGETS = new Set(['self', 'blank']);
const CLICK_ACTION_PANEL_PLACEMENTS = new Set(['below', 'right', 'left', 'above']);
const CLICK_ACTION_PANEL_MODES = new Set(['layout', 'overlay']);
const CLICK_ACTION_IFRAME_LOADING = new Set(['eager', 'lazy']);
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const GLOBE_BOUNDS = { minX: -1, minY: -1, maxX: 1, maxY: 1 };

const FEATURE_EVENT_NAMES = new Set(['featureenter', 'featureleave', 'featuremove', 'featureclick']);
const MARKER_EVENT_NAMES = new Set(['markerenter', 'markerleave', 'markermove', 'markerclick']);
const VIEW_EVENT_NAMES = new Set(['zoomend']);

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isNullish(value) {
  return value == null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapLongitude(lon) {
  let value = Number(lon) || 0;
  while (value <= -180) {
    value += 360;
  }
  while (value > 180) {
    value -= 360;
  }
  return value;
}

function normalizeAntimeridianMode(value) {
  const normalized = String(value ?? 'auto').trim().toLowerCase();
  return ['off', 'auto', 'unwrap'].includes(normalized)
    ? normalized
    : 'auto';
}

function normalizeAntimeridianReferenceLongitude(value) {
  if (value == null || value === '') {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? wrapLongitude(numeric) : null;
}

function cloneViewState(view) {
  return {
    zoom: Number(view?.zoom ?? 1),
    center: {
      lon: Number(view?.center?.lon ?? 0),
      lat: Number(view?.center?.lat ?? 0)
    }
  };
}

function didZoomChange(previousView, nextView) {
  return Math.abs((Number(nextView?.zoom) || 0) - (Number(previousView?.zoom) || 0)) > 1e-9;
}

function clonePoint(point) {
  return [Number(point[0]), Number(point[1])];
}

function toFeatureArray(input) {
  if (input.type === 'FeatureCollection' && Array.isArray(input.features)) {
    return input.features;
  }

  if (input.type === 'Feature') {
    return [input];
  }

  if (input.type && input.coordinates) {
    return [{ type: 'Feature', geometry: input, properties: {} }];
  }

  if (input.type === 'GeometryCollection' && Array.isArray(input.geometries)) {
    return [{ type: 'Feature', geometry: input, properties: {} }];
  }

  return [];
}

function flattenGeometry(geometry, onGeometry) {
  if (!geometry || typeof geometry !== 'object') {
    return;
  }

  if (geometry.type === 'GeometryCollection') {
    (geometry.geometries ?? []).forEach((child) => flattenGeometry(child, onGeometry));
    return;
  }

  if (geometry.type === 'Polygon') {
    onGeometry({
      kind: 'polygon',
      geometryType: 'Polygon',
      coordinates: (geometry.coordinates ?? []).map((ring) => (ring ?? []).map(clonePoint))
    });
    return;
  }

  if (geometry.type === 'MultiPolygon') {
    (geometry.coordinates ?? []).forEach((polygon) => {
      onGeometry({
        kind: 'polygon',
        geometryType: 'MultiPolygon',
        coordinates: (polygon ?? []).map((ring) => (ring ?? []).map(clonePoint))
      });
    });
    return;
  }

  if (geometry.type === 'LineString') {
    onGeometry({
      kind: 'line',
      geometryType: 'LineString',
      coordinates: (geometry.coordinates ?? []).map(clonePoint)
    });
    return;
  }

  if (geometry.type === 'MultiLineString') {
    (geometry.coordinates ?? []).forEach((line) => {
      onGeometry({
        kind: 'line',
        geometryType: 'MultiLineString',
        coordinates: (line ?? []).map(clonePoint)
      });
    });
    return;
  }

  if (geometry.type === 'Point') {
    onGeometry({
      kind: 'point',
      geometryType: 'Point',
      coordinates: clonePoint(geometry.coordinates ?? [0, 0])
    });
    return;
  }

  if (geometry.type === 'MultiPoint') {
    (geometry.coordinates ?? []).forEach((point) => {
      onGeometry({
        kind: 'point',
        geometryType: 'MultiPoint',
        coordinates: clonePoint(point)
      });
    });
  }
}

function normalizeGeoJSON(input) {
  if (!input || typeof input !== 'object') {
    return [];
  }

  const entries = [];
  const features = toFeatureArray(input);

  features.forEach((feature, featureIndex) => {
    if (!feature || feature.type !== 'Feature' || !feature.geometry) {
      return;
    }

    const sourceId = feature.id ?? `feature-${featureIndex}`;
    const properties = feature.properties ?? {};
    const data = feature.data;
    const geocanvas = normalizeFeatureGeocanvasMetadata(feature.geocanvas ?? properties.geocanvas);
    const filterId = feature.id ?? properties.id ?? null;

    flattenGeometry(feature.geometry, (payload) => {
      const order = entries.length;
      const hoverKey = `feature:${sourceId}:${payload.kind}:${payload.geometryType}`;
      entries.push({
        sourceId,
        filterId,
        properties,
        data,
        geocanvas,
        kind: payload.kind,
        geometryType: payload.geometryType,
        coordinates: payload.coordinates,
        order,
        entityKey: `feature:${sourceId}:${payload.kind}:${order}`,
        hoverKey
      });
    });
  });

  return entries;
}

function createLayerEntries(layerId, layerName, geojson, layerOrder) {
  return normalizeGeoJSON(geojson).map((entry) => ({
    ...entry,
    layerId,
    layerName,
    layerOrder,
    entityKey: `layer:${layerId}:${entry.entityKey}`,
    hoverKey: `layer:${layerId}:${entry.hoverKey ?? entry.entityKey}`
  }));
}

function resolveFeatureJoinValue(entry, regionJoinField = 'id') {
  if (regionJoinField == null || regionJoinField === 'id') {
    return entry.filterId ?? null;
  }

  return entry?.properties?.[regionJoinField] ?? null;
}

function attachLayerMetadata(entries, layerId, layerName, layerOrder, regionJoinField = 'id') {
  return (entries ?? []).map((entry) => ({
    ...entry,
    filterId: resolveFeatureJoinValue(entry, regionJoinField),
    layerId,
    layerName,
    layerOrder,
    entityKey: `layer:${layerId}:${entry.entityKey}`,
    hoverKey: `layer:${layerId}:${entry.hoverKey ?? entry.entityKey}`
  }));
}

function normalizeGeoJSONInput(input) {
  if (typeof input !== 'string') {
    return input ?? null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function normalizeLayerDefinition(layer, index) {
  const fallbackId = `layer-${index + 1}`;
  const id = String(layer?.id ?? fallbackId);
  const legacyBindings = hasOwn(layer ?? {}, 'bindings') ? normalizePartialBindings(layer?.bindings) : undefined;
  const legacyInteraction = hasOwn(layer ?? {}, 'interaction') ? normalizePartialInteractionOptions(layer?.interaction) : undefined;
  const legacyRegionStyle = hasOwn(layer ?? {}, 'regionStyle') || hasOwn(layer ?? {}, 'regionsStyle')
    ? normalizePartialRegionStyleOptions(layer?.regionStyle ?? layer?.regionsStyle)
    : undefined;
  return {
    id,
    name: String(layer?.name ?? id),
    sourceId: layer?.sourceId == null ? null : String(layer.sourceId),
    geojson: normalizeGeoJSONInput(layer?.geojson),
    visible: layer?.visible !== false,
    order: Number.isFinite(layer?.order) ? Number(layer.order) : index,
    antimeridianMode: normalizeAntimeridianMode(layer?.antimeridianMode),
    antimeridianReferenceLon: normalizeAntimeridianReferenceLongitude(layer?.antimeridianReferenceLon),
    regions: layer?.regions ?? [],
    markers: Array.isArray(layer?.markers) ? layer.markers : [],
    lines: Array.isArray(layer?.lines) ? layer.lines : [],
    bindings: legacyBindings,
    labels: hasOwn(layer ?? {}, 'labels') ? normalizePartialLabelOptions(layer?.labels) : undefined,
    markerLabels: hasOwn(layer ?? {}, 'markerLabels') ? normalizePartialMarkerLabelOptions(layer?.markerLabels) : undefined,
    markerClusters: hasOwn(layer ?? {}, 'markerClusters') ? normalizePartialMarkerClusterOptions(layer?.markerClusters) : undefined,
    interaction: legacyInteraction,
    regionStyle: legacyRegionStyle,
    regionJoinField: layer?.regionJoinField == null ? 'id' : String(layer.regionJoinField),
    tooltip: normalizeLayerTooltipOptions(layer?.tooltip),
    defaults: normalizeEntityDefaults(layer?.defaults, {
      regionLabels: hasOwn(layer ?? {}, 'labels') ? normalizePartialLabelOptions(layer?.labels) : undefined,
      markerLabels: hasOwn(layer ?? {}, 'markerLabels') ? normalizePartialMarkerLabelOptions(layer?.markerLabels) : undefined,
      markerClusters: hasOwn(layer ?? {}, 'markerClusters') ? normalizePartialMarkerClusterOptions(layer?.markerClusters) : undefined,
      regionInteraction: legacyInteraction,
      markerInteraction: legacyInteraction,
      regionBindings: legacyBindings,
      markerBindings: legacyBindings,
      lineBindings: legacyBindings,
      regionStyle: legacyRegionStyle
    }),
    contributeToBounds: layer?.contributeToBounds !== false,
    includePolygonIds: normalizeIdList(layer?.includePolygonIds),
    excludePolygonIds: normalizeIdList(layer?.excludePolygonIds)
  };
}

function normalizeSourceDefinition(source, index = 0) {
  const fallbackId = `source-${index + 1}`;
  return {
    id: String(source?.id ?? fallbackId),
    name: String(source?.name ?? source?.id ?? fallbackId),
    geojson: normalizeGeoJSONInput(source?.geojson)
  };
}

function normalizeLabelOptions(input = {}) {
  if (input === false) {
    return { enabled: false };
  }

  const labels = input && typeof input === 'object' ? { ...input } : {};
  return {
    enabled: labels.enabled === true,
    source: labels.source === 'all-features' ? 'all-features' : 'layer-regions',
    field: labels.field ?? null,
    fallbackFields: Array.isArray(labels.fallbackFields) && labels.fallbackFields.length > 0
      ? labels.fallbackFields.map((value) => String(value))
      : DEFAULT_LABEL_FALLBACK_FIELDS.slice(),
    positions: normalizeLabelPositionMap(labels.positions),
    font: String(labels.font ?? DEFAULT_CANVAS_LABEL_FONT),
    color: String(labels.color ?? '#18344b'),
    background: labels.background == null ? null : String(labels.background),
    paddingX: Number(labels.paddingX ?? 6),
    paddingY: Number(labels.paddingY ?? 3),
    borderRadius: Number(labels.borderRadius ?? 4),
    minZoom: labels.minZoom == null ? null : Number(labels.minZoom),
    maxZoom: labels.maxZoom == null ? null : Number(labels.maxZoom)
  };
}

function normalizePartialLabelOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (input === false) {
    return false;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const labels = {};
  if (hasOwn(input, 'enabled')) {
    labels.enabled = input.enabled === true;
  }
  if (hasOwn(input, 'source')) {
    labels.source = input.source === 'all-features' ? 'all-features' : 'layer-regions';
  }
  if (hasOwn(input, 'field')) {
    labels.field = input.field ?? null;
  }
  if (hasOwn(input, 'fallbackFields') && Array.isArray(input.fallbackFields)) {
    labels.fallbackFields = input.fallbackFields.map((value) => typeof value === 'string' ? value : value);
  }
  if (hasOwn(input, 'positions')) {
    labels.positions = normalizeLabelPositionMap(input.positions);
  }
  if (hasOwn(input, 'font') && input.font != null) {
    labels.font = String(input.font);
  }
  if (hasOwn(input, 'color') && input.color != null) {
    labels.color = String(input.color);
  }
  if (hasOwn(input, 'background')) {
    labels.background = input.background == null ? null : String(input.background);
  }
  if (hasOwn(input, 'paddingX') && input.paddingX != null) {
    labels.paddingX = Number(input.paddingX);
  }
  if (hasOwn(input, 'paddingY') && input.paddingY != null) {
    labels.paddingY = Number(input.paddingY);
  }
  if (hasOwn(input, 'borderRadius') && input.borderRadius != null) {
    labels.borderRadius = Number(input.borderRadius);
  }
  if (hasOwn(input, 'minZoom')) {
    labels.minZoom = input.minZoom == null ? null : Number(input.minZoom);
  }
  if (hasOwn(input, 'maxZoom')) {
    labels.maxZoom = input.maxZoom == null ? null : Number(input.maxZoom);
  }
  return labels;
}

function normalizeLabelPositionMap(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  return Object.entries(input).reduce((accumulator, [key, value]) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return accumulator;
    }

    const lon = Number(value.lon);
    const lat = Number(value.lat);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
      return accumulator;
    }

    accumulator[String(key)] = { lon, lat };
    return accumulator;
  }, {});
}

function mergeLabelPositionMaps(...sources) {
  return sources.reduce((accumulator, source) => ({
    ...accumulator,
    ...normalizeLabelPositionMap(source)
  }), {});
}

function normalizeLonLatPoint(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }

  const lon = Number(input.lon);
  const lat = Number(input.lat);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    return null;
  }

  return { lon, lat };
}

function normalizeRegionTransform(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }

  const directAnchor = normalizeLonLatPoint(input);
  if (directAnchor) {
    return { anchor: directAnchor };
  }

  const anchor = normalizeLonLatPoint(input.anchor)
    ?? normalizeLonLatPoint(input.position)
    ?? normalizeLonLatPoint(input.centroid);
  const translate = normalizeLonLatPoint(input.translate)
    ?? normalizeLonLatPoint(input.offset)
    ?? normalizeLonLatPoint(input.delta);

  if (anchor) {
    return { anchor };
  }
  if (translate) {
    return { translate };
  }

  return null;
}

function normalizeRegionTransformMap(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  return Object.entries(input).reduce((accumulator, [key, value]) => {
    const normalized = normalizeRegionTransform(value);
    if (normalized) {
      accumulator[String(key)] = normalized;
    }
    return accumulator;
  }, {});
}

function mergeRegionTransformMaps(...sources) {
  return sources.reduce((accumulator, source) => ({
    ...accumulator,
    ...normalizeRegionTransformMap(source)
  }), {});
}

function normalizeFeatureGeocanvasMetadata(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }

  const regionLabelPosition = normalizeLonLatPoint(
    input.regionLabel?.position
      ?? input.regionLabel
      ?? input.labelPosition
  );
  const regionTransform = normalizeRegionTransform(
    input.regionTransform
      ?? input.offset
      ?? input.transform
  );

  if (!regionLabelPosition && !regionTransform) {
    return null;
  }

  return {
    ...(regionLabelPosition ? { regionLabel: { position: regionLabelPosition } } : {}),
    ...(regionTransform ? { regionTransform } : {})
  };
}

function resolveRegionLabelConfig(...sources) {
  let result;
  sources.forEach((source) => {
    if (isNullish(source)) {
      return;
    }
    if (source === false) {
      result = false;
      return;
    }

    const next = result === false ? { ...source } : { ...(result ?? {}), ...source };
    if ((result && result !== false && typeof result === 'object') || (source && typeof source === 'object')) {
      next.positions = mergeLabelPositionMaps(result?.positions, source?.positions);
    }
    result = next;
  });
  return result === false ? normalizeLabelOptions(false) : normalizeLabelOptions(result ?? {});
}

function mergeRegionLabelState(baseValue, patchValue) {
  if (isNullish(patchValue)) {
    return cloneDisableableState(baseValue);
  }
  if (patchValue === false) {
    return false;
  }
  if (!patchValue || typeof patchValue !== 'object') {
    return cloneDisableableState(baseValue);
  }

  const base = baseValue && baseValue !== false && typeof baseValue === 'object' ? baseValue : {};
  const next = {
    ...base,
    ...patchValue
  };
  next.positions = mergeLabelPositionMaps(base.positions, patchValue.positions);
  return next;
}

function computeCoordinateAnchor(entries = []) {
  if (!entries.length) {
    return null;
  }
  return computeCenterFromBounds(computeBounds(entries, 'coordinates'));
}

function resolveRegionTransformJoinId(entry) {
  return resolveRegionLabelJoinId(entry);
}

function resolveRegionTransformDefinition(entry, transforms = {}) {
  const joinId = resolveRegionTransformJoinId(entry);
  const configured = joinId ? transforms?.[joinId] ?? null : null;
  const metadata = normalizeRegionTransform(entry?.geocanvas?.regionTransform);
  return configured ?? metadata ?? null;
}

function resolveRegionTransformDelta(entries = [], transform) {
  const normalized = normalizeRegionTransform(transform);
  if (!normalized) {
    return null;
  }

  if (normalized.translate) {
    return {
      lon: normalized.translate.lon,
      lat: normalized.translate.lat
    };
  }

  const anchor = computeCoordinateAnchor(entries);
  if (!anchor || !normalized.anchor) {
    return null;
  }

  return {
    lon: normalized.anchor.lon - anchor.lon,
    lat: normalized.anchor.lat - anchor.lat
  };
}

function hasRegionTransformDelta(delta) {
  return Boolean(delta)
    && (Math.abs(Number(delta.lon) || 0) > 1e-12 || Math.abs(Number(delta.lat) || 0) > 1e-12);
}

function translateGeoPoint(point, delta) {
  if (!Array.isArray(point) || point.length < 2 || !hasRegionTransformDelta(delta)) {
    return Array.isArray(point) ? point.slice() : point;
  }

  return [
    Number(point[0]) + Number(delta.lon),
    Number(point[1]) + Number(delta.lat)
  ];
}

function cloneGeoCoordinates(coordinates) {
  if (!Array.isArray(coordinates)) {
    return coordinates;
  }

  return coordinates.map((entry) => cloneGeoCoordinates(entry));
}

function translateGeoCoordinates(coordinates, delta) {
  if (!hasRegionTransformDelta(delta)) {
    return cloneGeoCoordinates(coordinates);
  }

  if (!Array.isArray(coordinates)) {
    return coordinates;
  }

  if (coordinates.length >= 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    return translateGeoPoint(coordinates, delta);
  }

  return coordinates.map((entry) => translateGeoCoordinates(entry, delta));
}

function crossesAntimeridian(fromLon, toLon) {
  if (!isFiniteNumber(fromLon) || !isFiniteNumber(toLon)) {
    return false;
  }
  return Math.abs(Number(toLon) - Number(fromLon)) > 180;
}

function sequenceCrossesAntimeridian(points = []) {
  if (!Array.isArray(points)) {
    return false;
  }

  for (let index = 1; index < points.length; index += 1) {
    if (crossesAntimeridian(points[index - 1]?.[0], points[index]?.[0])) {
      return true;
    }
  }

  return false;
}

function unwrapLongitudeSequence(points = []) {
  if (!Array.isArray(points)) {
    return cloneGeoCoordinates(points);
  }

  let previousLon = null;
  return points.map((point) => {
    const lon = Number(point?.[0]);
    const lat = Number(point?.[1]);
    if (!isFiniteNumber(lon) || !isFiniteNumber(lat)) {
      return clonePoint(point ?? [0, 0]);
    }

    let nextLon = lon;
    if (previousLon != null) {
      while (nextLon - previousLon > 180) {
        nextLon -= 360;
      }
      while (nextLon - previousLon < -180) {
        nextLon += 360;
      }
    }
    previousLon = nextLon;
    return [nextLon, lat];
  });
}

function shiftLongitudeTowardReference(lon, referenceLon) {
  if (!isFiniteNumber(lon) || !isFiniteNumber(referenceLon)) {
    return Number(lon);
  }

  let nextLon = Number(lon);
  while (nextLon - referenceLon > 180) {
    nextLon -= 360;
  }
  while (nextLon - referenceLon < -180) {
    nextLon += 360;
  }
  return nextLon;
}

function shiftGeoCoordinatesLongitude(coordinates, deltaLon) {
  if (!isFiniteNumber(deltaLon) || Math.abs(deltaLon) <= 1e-9) {
    return cloneGeoCoordinates(coordinates);
  }

  if (!Array.isArray(coordinates)) {
    return coordinates;
  }

  if (coordinates.length >= 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    return [
      Number(coordinates[0]) + deltaLon,
      Number(coordinates[1])
    ];
  }

  return coordinates.map((entry) => shiftGeoCoordinatesLongitude(entry, deltaLon));
}

function alignCoordinatesToReference(kind, coordinates, referenceLon) {
  if (!isFiniteNumber(referenceLon)) {
    return cloneGeoCoordinates(coordinates);
  }

  const bounds = computeBounds([{ kind, coordinates }], 'coordinates');
  const centerLon = (bounds.minX + bounds.maxX) / 2;
  const alignedCenterLon = shiftLongitudeTowardReference(centerLon, referenceLon);
  return shiftGeoCoordinatesLongitude(coordinates, alignedCenterLon - centerLon);
}

function normalizeCoordinatesForAntimeridian(kind, coordinates, options = {}) {
  const mode = normalizeAntimeridianMode(options.antimeridianMode);
  const referenceLon = normalizeAntimeridianReferenceLongitude(options.antimeridianReferenceLon);
  if (mode === 'off') {
    return cloneGeoCoordinates(coordinates);
  }

  if (kind === 'point') {
    if (mode !== 'unwrap' || !isFiniteNumber(referenceLon) || !Array.isArray(coordinates)) {
      return cloneGeoCoordinates(coordinates);
    }
    return [
      shiftLongitudeTowardReference(Number(coordinates[0]), referenceLon),
      Number(coordinates[1])
    ];
  }

  if (kind === 'line') {
    const crossing = sequenceCrossesAntimeridian(coordinates);
    if (!crossing && mode !== 'unwrap') {
      return cloneGeoCoordinates(coordinates);
    }
    const normalized = unwrapLongitudeSequence(coordinates);
    return crossing && isFiniteNumber(referenceLon)
      ? alignCoordinatesToReference(kind, normalized, referenceLon)
      : normalized;
  }

  if (kind === 'polygon') {
    const rings = Array.isArray(coordinates) ? coordinates : [];
    const crossing = rings.some((ring) => sequenceCrossesAntimeridian(ring));
    if (!crossing && mode !== 'unwrap') {
      return cloneGeoCoordinates(coordinates);
    }
    const normalized = rings.map((ring) => unwrapLongitudeSequence(ring));
    return crossing && isFiniteNumber(referenceLon)
      ? alignCoordinatesToReference(kind, normalized, referenceLon)
      : normalized;
  }

  return cloneGeoCoordinates(coordinates);
}

function collectCoordinateLongitudes(coordinates, sink = []) {
  if (!Array.isArray(coordinates)) {
    return sink;
  }

  if (coordinates.length >= 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    const lon = Number(coordinates[0]);
    if (isFiniteNumber(lon)) {
      sink.push(wrapLongitude(lon));
    }
    return sink;
  }

  coordinates.forEach((entry) => collectCoordinateLongitudes(entry, sink));
  return sink;
}

function computeCircularMeanLongitude(longitudes = []) {
  if (!Array.isArray(longitudes) || longitudes.length === 0) {
    return null;
  }

  let sumSin = 0;
  let sumCos = 0;
  longitudes.forEach((lon) => {
    const radians = wrapLongitude(lon) * RAD;
    sumSin += Math.sin(radians);
    sumCos += Math.cos(radians);
  });

  if (Math.abs(sumSin) <= 1e-12 && Math.abs(sumCos) <= 1e-12) {
    return wrapLongitude(longitudes[0]);
  }

  return wrapLongitude(Math.atan2(sumSin, sumCos) * DEG);
}

function entryCrossesAntimeridian(entry) {
  if (!entry || !Array.isArray(entry.coordinates)) {
    return false;
  }

  if (entry.kind === 'line') {
    return sequenceCrossesAntimeridian(entry.coordinates);
  }

  if (entry.kind === 'polygon') {
    return (entry.coordinates ?? []).some((ring) => sequenceCrossesAntimeridian(ring));
  }

  return false;
}

function normalizeFeatureEntriesForAntimeridian(entries = [], options = {}) {
  const mode = normalizeAntimeridianMode(options.antimeridianMode);
  if (mode === 'off') {
    return (entries ?? []).map((entry) => ({
      ...entry,
      coordinates: cloneGeoCoordinates(entry?.coordinates)
    }));
  }

  const rawLongitudes = [];
  (entries ?? []).forEach((entry) => collectCoordinateLongitudes(entry?.coordinates, rawLongitudes));
  const rawMinLon = rawLongitudes.length ? Math.min(...rawLongitudes) : null;
  const rawMaxLon = rawLongitudes.length ? Math.max(...rawLongitudes) : null;
  const groupCrossesCollectively = rawMinLon != null && rawMaxLon != null && rawMaxLon - rawMinLon > 180;
  const groupHasDirectCrossing = (entries ?? []).some((entry) => entryCrossesAntimeridian(entry));
  const shouldAlignGroup = mode === 'unwrap' || groupCrossesCollectively || groupHasDirectCrossing;
  const groupReferenceLon = normalizeAntimeridianReferenceLongitude(options.antimeridianReferenceLon)
    ?? computeCircularMeanLongitude(rawLongitudes);

  return (entries ?? []).map((entry) => {
    let coordinates = normalizeCoordinatesForAntimeridian(entry?.kind, entry?.coordinates, {
      antimeridianMode: mode,
      antimeridianReferenceLon: groupReferenceLon
    });

    if (shouldAlignGroup && isFiniteNumber(groupReferenceLon) && entry?.kind !== 'point') {
      const bounds = computeBounds([{ kind: entry.kind, coordinates }], 'coordinates');
      const centerLon = (bounds.minX + bounds.maxX) / 2;
      const alignedCenterLon = shiftLongitudeTowardReference(centerLon, groupReferenceLon);
      coordinates = shiftGeoCoordinatesLongitude(coordinates, alignedCenterLon - centerLon);
    }

    return {
      ...entry,
      coordinates
    };
  });
}

function normalizeMarkerLabelPosition(value) {
  return [
    'center',
    'top',
    'right',
    'bottom',
    'left',
    'top-right',
    'top-left',
    'bottom-right',
    'bottom-left'
  ].includes(value) ? value : 'top';
}

function normalizeMarkerLabelOptions(input = {}) {
  if (input === false) {
    return { enabled: false };
  }

  const labels = input && typeof input === 'object' ? { ...input } : {};
  return {
    enabled: labels.enabled === true,
    field: labels.field ?? null,
    fallbackFields: Array.isArray(labels.fallbackFields) && labels.fallbackFields.length > 0
      ? labels.fallbackFields.slice()
      : DEFAULT_MARKER_LABEL_FALLBACK_FIELDS.slice(),
    font: String(labels.font ?? DEFAULT_CANVAS_LABEL_FONT),
    color: String(labels.color ?? '#18344b'),
    background: labels.background == null ? null : String(labels.background),
    paddingX: Number(labels.paddingX ?? 6),
    paddingY: Number(labels.paddingY ?? 3),
    borderRadius: Number(labels.borderRadius ?? 4),
    position: normalizeMarkerLabelPosition(labels.position),
    offsetX: Number(labels.offsetX ?? 0),
    offsetY: Number(labels.offsetY ?? 0),
    distance: Number(labels.distance ?? 8),
    minZoom: labels.minZoom == null ? null : Number(labels.minZoom),
    maxZoom: labels.maxZoom == null ? null : Number(labels.maxZoom),
    scaleWithZoom: labels.scaleWithZoom === true,
    minScale: Number(labels.minScale ?? 1),
    maxScale: Number(labels.maxScale ?? 2)
  };
}

function normalizePartialMarkerLabelOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (input === false) {
    return false;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const labels = {};
  if (hasOwn(input, 'enabled')) {
    labels.enabled = input.enabled === true;
  }
  if (hasOwn(input, 'field')) {
    labels.field = input.field ?? null;
  }
  if (hasOwn(input, 'fallbackFields') && Array.isArray(input.fallbackFields)) {
    labels.fallbackFields = input.fallbackFields.slice();
  }
  if (hasOwn(input, 'font') && input.font != null) {
    labels.font = String(input.font);
  }
  if (hasOwn(input, 'color') && input.color != null) {
    labels.color = String(input.color);
  }
  if (hasOwn(input, 'background')) {
    labels.background = input.background == null ? null : String(input.background);
  }
  if (hasOwn(input, 'paddingX') && input.paddingX != null) {
    labels.paddingX = Number(input.paddingX);
  }
  if (hasOwn(input, 'paddingY') && input.paddingY != null) {
    labels.paddingY = Number(input.paddingY);
  }
  if (hasOwn(input, 'borderRadius') && input.borderRadius != null) {
    labels.borderRadius = Number(input.borderRadius);
  }
  if (hasOwn(input, 'position')) {
    labels.position = normalizeMarkerLabelPosition(input.position);
  }
  if (hasOwn(input, 'offsetX') && input.offsetX != null) {
    labels.offsetX = Number(input.offsetX);
  }
  if (hasOwn(input, 'offsetY') && input.offsetY != null) {
    labels.offsetY = Number(input.offsetY);
  }
  if (hasOwn(input, 'distance') && input.distance != null) {
    labels.distance = Number(input.distance);
  }
  if (hasOwn(input, 'minZoom')) {
    labels.minZoom = input.minZoom == null ? null : Number(input.minZoom);
  }
  if (hasOwn(input, 'maxZoom')) {
    labels.maxZoom = input.maxZoom == null ? null : Number(input.maxZoom);
  }
  if (hasOwn(input, 'scaleWithZoom')) {
    labels.scaleWithZoom = input.scaleWithZoom === true;
  }
  if (hasOwn(input, 'minScale') && input.minScale != null) {
    labels.minScale = Number(input.minScale);
  }
  if (hasOwn(input, 'maxScale') && input.maxScale != null) {
    labels.maxScale = Number(input.maxScale);
  }
  return labels;
}

function normalizeMarkerClusterOptions(input = {}) {
  if (input === false) {
    return { enabled: false };
  }

  const clusters = input && typeof input === 'object' ? { ...input } : {};
  return {
    enabled: clusters.enabled === true,
    radius: Math.max(1, Number(clusters.radius ?? 40)),
    minPoints: Math.max(2, Math.round(Number(clusters.minPoints ?? 2) || 2)),
    maxZoom: clusters.maxZoom == null ? null : Number(clusters.maxZoom),
    clickToZoom: clusters.clickToZoom !== false,
    zoomScale: clusters.zoomScale == null ? null : Number(clusters.zoomScale),
    style: clusters.style && typeof clusters.style === 'object' ? { ...clusters.style } : {},
    labelFont: String(clusters.labelFont ?? DEFAULT_CLUSTER_LABEL_FONT),
    labelColor: String(clusters.labelColor ?? '#ffffff')
  };
}

function normalizePartialMarkerClusterOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (input === false) {
    return false;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const clusters = {};
  if (hasOwn(input, 'enabled')) {
    clusters.enabled = input.enabled === true;
  }
  if (hasOwn(input, 'radius') && input.radius != null) {
    clusters.radius = Math.max(1, Number(input.radius));
  }
  if (hasOwn(input, 'minPoints') && input.minPoints != null) {
    clusters.minPoints = Math.max(2, Math.round(Number(input.minPoints) || 2));
  }
  if (hasOwn(input, 'maxZoom')) {
    clusters.maxZoom = input.maxZoom == null ? null : Number(input.maxZoom);
  }
  if (hasOwn(input, 'clickToZoom')) {
    clusters.clickToZoom = input.clickToZoom !== false;
  }
  if (hasOwn(input, 'zoomScale')) {
    clusters.zoomScale = input.zoomScale == null ? null : Number(input.zoomScale);
  }
  if (hasOwn(input, 'style') && input.style && typeof input.style === 'object') {
    clusters.style = { ...input.style };
  }
  if (hasOwn(input, 'labelFont') && input.labelFont != null) {
    clusters.labelFont = String(input.labelFont);
  }
  if (hasOwn(input, 'labelColor') && input.labelColor != null) {
    clusters.labelColor = String(input.labelColor);
  }
  return clusters;
}

function normalizeMarkerType(input = {}) {
  const marker = input && typeof input === 'object' ? input : {};
  if (marker.type === 'image') {
    return 'image';
  }
  if (marker.type === 'circle') {
    return 'circle';
  }

  const image = marker.image;
  if (image && typeof image === 'object') {
    const src = typeof image.src === 'string' ? image.src.trim() : '';
    const svg = typeof image.svg === 'string' ? image.svg.trim() : '';
    if (src || svg) {
      return 'image';
    }
  }

  return 'circle';
}

function normalizeMarkerImageOptions(input = {}, style = {}) {
  const image = input && typeof input === 'object' ? { ...input } : {};
  const styleWidth = Number(style?.width);
  const styleHeight = Number(style?.height);
  const fallbackWidth = Number.isFinite(styleWidth) && styleWidth > 0 ? styleWidth : DEFAULT_IMAGE_MARKER_SIZE;
  const fallbackHeight = Number.isFinite(styleHeight) && styleHeight > 0 ? styleHeight : fallbackWidth;
  const width = Number(image.width ?? fallbackWidth);
  const safeWidth = Number.isFinite(width) && width > 0 ? width : fallbackWidth;
  const height = Number(image.height ?? (image.width != null ? safeWidth : fallbackHeight));
  const safeHeight = Number.isFinite(height) && height > 0 ? height : fallbackHeight;
  const anchorPreset = normalizeMarkerImageAnchorPreset(image.anchor);
  const presetAnchor = anchorPreset
    ? resolveMarkerImageAnchorPreset(anchorPreset, safeWidth, safeHeight)
    : null;
  const anchorX = Number(image.anchorX ?? presetAnchor?.x ?? safeWidth / 2);
  const anchorY = Number(image.anchorY ?? presetAnchor?.y ?? safeHeight / 2);

  return {
    src: image.src == null ? null : String(image.src),
    svg: image.svg == null ? null : String(image.svg),
    width: safeWidth,
    height: safeHeight,
    anchorX: Number.isFinite(anchorX) ? anchorX : safeWidth / 2,
    anchorY: Number.isFinite(anchorY) ? anchorY : safeHeight / 2
  };
}

function normalizeMarkerAnimationKind(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return MARKER_ANIMATION_KINDS.has(normalized) ? normalized : null;
}

function normalizeMarkerAnimationEasing(value) {
  if (typeof value !== 'string') {
    return 'ease-in-out';
  }

  const normalized = value.trim();
  return MARKER_ANIMATION_EASINGS.has(normalized) ? normalized : 'ease-in-out';
}

function normalizeMarkerAnimation(input) {
  if (input === false) {
    return false;
  }
  if (!input || typeof input !== 'object') {
    return null;
  }

  const kind = normalizeMarkerAnimationKind(input.kind);
  if (!kind) {
    return null;
  }

  const durationValue = Number(input.duration);
  const delayValue = Number(input.delay);
  const phaseValue = Number(input.phase);
  const repeat = hasOwn(input, 'repeat') ? input.repeat !== false : true;
  const easing = normalizeMarkerAnimationEasing(input.easing);
  const scaleDefaults = DEFAULT_MARKER_ANIMATION_SCALE_RANGES[kind] ?? null;
  const opacityDefaults = kind === 'pulse' ? DEFAULT_MARKER_ANIMATION_OPACITY_RANGE : null;
  const degreesValue = Number(input.degrees);
  const strokeWidthValue = Number(input.strokeWidth);

  return {
    kind,
    duration: Number.isFinite(durationValue) && durationValue > 0
      ? durationValue
      : DEFAULT_MARKER_ANIMATION_DURATIONS[kind],
    delay: Number.isFinite(delayValue) ? delayValue : 0,
    repeat,
    phase: Number.isFinite(phaseValue) ? phaseValue : 0,
    easing,
    scaleFrom: scaleDefaults
      ? (Number.isFinite(Number(input.scaleFrom)) ? Number(input.scaleFrom) : scaleDefaults.from)
      : undefined,
    scaleTo: scaleDefaults
      ? (Number.isFinite(Number(input.scaleTo)) ? Number(input.scaleTo) : scaleDefaults.to)
      : undefined,
    opacityFrom: opacityDefaults
      ? (Number.isFinite(Number(input.opacityFrom)) ? Number(input.opacityFrom) : opacityDefaults.from)
      : undefined,
    opacityTo: opacityDefaults
      ? (Number.isFinite(Number(input.opacityTo)) ? Number(input.opacityTo) : opacityDefaults.to)
      : undefined,
    degrees: kind === 'spin'
      ? (Number.isFinite(degreesValue) ? degreesValue : DEFAULT_MARKER_ANIMATION_SPIN_DEGREES)
      : undefined,
    strokeWidth: kind === 'pulse'
      ? (Number.isFinite(strokeWidthValue) && strokeWidthValue > 0 ? strokeWidthValue : undefined)
      : undefined
  };
}

function normalizeMarkerImageAnchorPreset(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return MARKER_IMAGE_ANCHOR_PRESETS.has(normalized) ? normalized : null;
}

function resolveMarkerImageAnchorPreset(preset, width, height) {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : DEFAULT_IMAGE_MARKER_SIZE;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : safeWidth;

  switch (preset) {
    case 'top':
      return { x: safeWidth / 2, y: 0 };
    case 'topLeft':
      return { x: 0, y: 0 };
    case 'topRight':
      return { x: safeWidth, y: 0 };
    case 'center':
      return { x: safeWidth / 2, y: safeHeight / 2 };
    case 'centerRight':
      return { x: safeWidth, y: safeHeight / 2 };
    case 'centerLeft':
      return { x: 0, y: safeHeight / 2 };
    case 'bottomLeft':
      return { x: 0, y: safeHeight };
    case 'bottom':
      return { x: safeWidth / 2, y: safeHeight };
    case 'bottomRight':
      return { x: safeWidth, y: safeHeight };
    default:
      return { x: safeWidth / 2, y: safeHeight / 2 };
  }
}

function normalizeInlineSvgMarkup(value) {
  if (value == null) {
    return null;
  }

  const svg = String(value).trim();
  return svg ? svg : null;
}

function applyCurrentColorToSvgMarkup(svgMarkup, color = '') {
  const svg = normalizeInlineSvgMarkup(svgMarkup);
  const fill = typeof color === 'string' ? color.trim() : '';
  if (!svg) {
    return '';
  }

  if (!fill || !svg.includes('currentColor')) {
    return svg;
  }

  return svg.replace(/currentColor/g, fill);
}

function createInlineSvgDataUrl(svgMarkup, color = '') {
  const svg = applyCurrentColorToSvgMarkup(svgMarkup, color);
  return svg ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}` : null;
}

function resolveMarkerImageSvgMarkup(image = {}, style = {}) {
  const fill = typeof style?.fill === 'string' ? style.fill.trim() : '';
  return applyCurrentColorToSvgMarkup(image.svg, fill);
}

function createMarkerImageSource(image = {}, style = {}) {
  const svg = resolveMarkerImageSvgMarkup(image, style);
  if (svg) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  const src = typeof image.src === 'string' ? image.src.trim() : '';
  return src || null;
}

function getMarkerImageCacheKey(image = {}, style = {}) {
  const svg = resolveMarkerImageSvgMarkup(image, style);
  if (svg) {
    return `svg:${svg}`;
  }

  const src = typeof image.src === 'string' ? image.src.trim() : '';
  return src ? `src:${src}` : null;
}

function resolveImageMarkerLayout(marker, style = {}) {
  const baseWidth = Number(marker?.image?.width) || DEFAULT_IMAGE_MARKER_SIZE;
  const baseHeight = Number(marker?.image?.height) || baseWidth;
  const requestedWidth = Number(style?.width);
  const requestedHeight = Number(style?.height);

  let width = Number.isFinite(requestedWidth) && requestedWidth > 0 ? requestedWidth : baseWidth;
  let height = Number.isFinite(requestedHeight) && requestedHeight > 0 ? requestedHeight : baseHeight;

  if (Number.isFinite(requestedWidth) && requestedWidth > 0 && !(Number.isFinite(requestedHeight) && requestedHeight > 0)) {
    height = baseWidth > 0 ? (baseHeight * width) / baseWidth : height;
  } else if (!(Number.isFinite(requestedWidth) && requestedWidth > 0) && Number.isFinite(requestedHeight) && requestedHeight > 0) {
    width = baseHeight > 0 ? (baseWidth * height) / baseHeight : width;
  }

  const baseAnchorX = Number(marker?.image?.anchorX);
  const baseAnchorY = Number(marker?.image?.anchorY);
  const anchorXRatio = baseWidth > 0 && Number.isFinite(baseAnchorX) ? baseAnchorX / baseWidth : 0.5;
  const anchorYRatio = baseHeight > 0 && Number.isFinite(baseAnchorY) ? baseAnchorY / baseHeight : 0.5;

  return {
    width,
    height,
    anchorX: width * anchorXRatio,
    anchorY: height * anchorYRatio
  };
}

function createMarkerRecord(marker = {}, {
  fallbackId = null,
  order = 0,
  layerId = null,
  layerName = null,
  entityKeyPrefix = 'marker',
  markerDefaults = {}
} = {}) {
  const id = marker.id ?? fallbackId ?? `marker-${order}`;
  const markerInput = {
    ...marker,
    type: marker.type ?? markerDefaults.type,
    image: marker.image ?? markerDefaults.image
  };
  const type = normalizeMarkerType(markerInput);
  const hasOwnAnimation = Object.prototype.hasOwnProperty.call(marker, 'animation');
  const itemAnimation = hasOwnAnimation ? normalizeMarkerAnimation(marker.animation) : undefined;
  const defaultAnimation = normalizeMarkerAnimation(markerDefaults.animation);
  const resolvedAnimation = hasOwnAnimation
    ? (itemAnimation && typeof itemAnimation === 'object' ? { ...itemAnimation } : null)
    : (defaultAnimation && typeof defaultAnimation === 'object' ? { ...defaultAnimation } : null);

  return {
    id,
    lon: Number(marker.lon),
    lat: Number(marker.lat),
    title: marker.title ?? null,
    name: marker.name ?? null,
    label: marker.label ?? null,
    type,
    image: type === 'image' ? normalizeMarkerImageOptions(markerInput.image, marker.style ?? markerDefaults.style) : null,
    ...(hasOwnAnimation ? { itemAnimation } : {}),
    animation: resolvedAnimation,
    animationStartTime: getNow(),
    data: marker.data,
    region: marker.region ?? null,
    properties: marker.properties ?? {},
    style: marker.style ?? {},
    hoverStyle: marker.hoverStyle ?? {},
    bindings: marker.bindings && typeof marker.bindings === 'object' ? { ...marker.bindings } : {},
    tooltip: marker.tooltip,
    interaction: marker.interaction,
    itemBindings: marker.itemBindings && typeof marker.itemBindings === 'object'
      ? { ...marker.itemBindings }
      : (marker.bindings && typeof marker.bindings === 'object' ? { ...marker.bindings } : {}),
    itemTooltip: Object.prototype.hasOwnProperty.call(marker, 'itemTooltip') ? marker.itemTooltip : marker.tooltip,
    itemInteraction: Object.prototype.hasOwnProperty.call(marker, 'itemInteraction') ? marker.itemInteraction : marker.interaction,
    markerDefaults,
    layerId,
    layerName,
    order,
    entityKey: `${entityKeyPrefix}:${id}:${order}`
  };
}

function resolveMarkerAnimationEase(easing, progress) {
  const safeProgress = clamp(progress, 0, 1);
  if (easing === 'linear') {
    return safeProgress;
  }
  if (easing === 'ease-out') {
    return easeOutCubic(safeProgress);
  }
  return easeInOutCubic(safeProgress);
}

function resolveMarkerAnimationPhase(animation, time = getNow()) {
  if (!animation || typeof animation !== 'object' || !normalizeMarkerAnimationKind(animation.kind)) {
    return null;
  }

  const duration = Number(animation.duration);
  const startTime = Number(animation.startTime);
  const delay = Number(animation.delay ?? 0);
  const phase = Number(animation.phase ?? 0);
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_MARKER_ANIMATION_DURATIONS[animation.kind] ?? 1000;
  const safeStartTime = Number.isFinite(startTime) ? startTime : 0;
  const phaseOffset = safeDuration * phase;
  const rawElapsed = time - safeStartTime - delay + phaseOffset;

  if (animation.repeat !== false) {
    const cycleElapsed = ((rawElapsed % safeDuration) + safeDuration) % safeDuration;
    const cycleProgress = cycleElapsed / safeDuration;
    const pingPongLinear = cycleProgress <= 0.5 ? cycleProgress * 2 : (1 - cycleProgress) * 2;
    return {
      active: true,
      cycleProgress,
      easedProgress: resolveMarkerAnimationEase(animation.easing, cycleProgress),
      pingPongProgress: resolveMarkerAnimationEase(animation.easing, pingPongLinear)
    };
  }

  const clampedElapsed = clamp(rawElapsed, 0, safeDuration);
  const cycleProgress = clampedElapsed / safeDuration;
  const pingPongLinear = cycleProgress <= 0.5 ? cycleProgress * 2 : (1 - cycleProgress) * 2;
  return {
    active: rawElapsed < safeDuration,
    cycleProgress,
    easedProgress: resolveMarkerAnimationEase(animation.easing, cycleProgress),
    pingPongProgress: resolveMarkerAnimationEase(animation.easing, pingPongLinear)
  };
}

function resolveMarkerAnimationVisualState(marker, style = {}, time = getNow()) {
  if (!marker || marker.cluster || !marker.animation) {
    return null;
  }

  const phase = resolveMarkerAnimationPhase({
    ...marker.animation,
    startTime: marker.animationStartTime
  }, time);
  if (!phase) {
    return null;
  }

  const visual = {
    active: phase.active,
    scale: 1,
    rotation: 0,
    pulse: null
  };

  if (marker.animation.kind === 'pulse') {
    visual.pulse = {
      scale: interpolateNumber(marker.animation.scaleFrom ?? 1, marker.animation.scaleTo ?? 2.2, phase.easedProgress),
      opacity: interpolateNumber(marker.animation.opacityFrom ?? 0.45, marker.animation.opacityTo ?? 0, phase.easedProgress),
      strokeWidth: marker.animation.strokeWidth,
      color: String(style.fill || style.stroke || DEFAULT_MARKER_STYLE.fill)
    };
    return visual;
  }

  if (marker.animation.kind === 'breathe') {
    visual.scale = interpolateNumber(marker.animation.scaleFrom ?? 0.92, marker.animation.scaleTo ?? 1.12, phase.pingPongProgress);
    return visual;
  }

  if (marker.animation.kind === 'spin') {
    visual.rotation = ((marker.animation.degrees ?? DEFAULT_MARKER_ANIMATION_SPIN_DEGREES) * phase.easedProgress) * RAD;
    return visual;
  }

  return null;
}

function isResolverValue(value) {
  return typeof value === 'string' || typeof value === 'function';
}

function normalizeOptionalResolverValue(value) {
  if (isResolverValue(value)) {
    return value;
  }
  return null;
}

function normalizeClickActionType(value) {
  return CLICK_ACTION_TYPES.has(value) ? value : null;
}

function normalizeClickActionRenderMode(value) {
  return CLICK_ACTION_RENDER_MODES.has(value) ? value : 'auto';
}

function normalizeClickActionTarget(value) {
  return CLICK_ACTION_TARGETS.has(value) ? value : 'self';
}

function normalizeClickActionPlacement(value) {
  return CLICK_ACTION_PANEL_PLACEMENTS.has(value) ? value : 'below';
}

function normalizeClickActionMode(value) {
  return CLICK_ACTION_PANEL_MODES.has(value) ? value : 'layout';
}

function normalizeClickActionLoading(value) {
  return CLICK_ACTION_IFRAME_LOADING.has(value) ? value : 'lazy';
}

function normalizeClickActionIframeOptions(input) {
  if (!input || typeof input !== 'object') {
    return {
      sandbox: '',
      allow: '',
      loading: 'lazy',
      referrerPolicy: ''
    };
  }

  return {
    sandbox: typeof input.sandbox === 'string' ? input.sandbox : '',
    allow: typeof input.allow === 'string' ? input.allow : '',
    loading: normalizeClickActionLoading(input.loading),
    referrerPolicy: typeof input.referrerPolicy === 'string' ? input.referrerPolicy : ''
  };
}

function normalizePartialClickActionIframeOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const next = {};
  if (hasOwn(input, 'sandbox')) {
    next.sandbox = typeof input.sandbox === 'string' ? input.sandbox : '';
  }
  if (hasOwn(input, 'allow')) {
    next.allow = typeof input.allow === 'string' ? input.allow : '';
  }
  if (hasOwn(input, 'loading')) {
    next.loading = normalizeClickActionLoading(input.loading);
  }
  if (hasOwn(input, 'referrerPolicy')) {
    next.referrerPolicy = typeof input.referrerPolicy === 'string' ? input.referrerPolicy : '';
  }
  return Object.keys(next).length ? next : undefined;
}

function normalizeClickActionLightboxOptions(input) {
  if (!input || typeof input !== 'object') {
    return {
      width: 'min(90vw, 960px)',
      maxWidth: '960px',
      height: '80vh',
      maxHeight: '80vh',
      padding: '16px',
      background: '#ffffff',
      color: '#18344b',
      borderRadius: '16px',
      boxShadow: '0 24px 64px rgba(15, 23, 42, 0.28)',
      backdrop: 'rgba(15, 23, 42, 0.55)',
      closeOnBackdrop: true,
      closeOnEscape: true,
      showCloseButton: true
    };
  }

  return {
    width: typeof input.width === 'string' ? input.width : 'min(90vw, 960px)',
    maxWidth: typeof input.maxWidth === 'string' ? input.maxWidth : '960px',
    height: typeof input.height === 'string' ? input.height : '80vh',
    maxHeight: typeof input.maxHeight === 'string' ? input.maxHeight : '80vh',
    padding: typeof input.padding === 'string' ? input.padding : '16px',
    background: typeof input.background === 'string' ? input.background : '#ffffff',
    color: typeof input.color === 'string' ? input.color : '#18344b',
    borderRadius: typeof input.borderRadius === 'string' ? input.borderRadius : '16px',
    boxShadow: typeof input.boxShadow === 'string' ? input.boxShadow : '0 24px 64px rgba(15, 23, 42, 0.28)',
    backdrop: typeof input.backdrop === 'string' ? input.backdrop : 'rgba(15, 23, 42, 0.55)',
    closeOnBackdrop: input.closeOnBackdrop !== false,
    closeOnEscape: input.closeOnEscape !== false,
    showCloseButton: input.showCloseButton !== false
  };
}

function normalizePartialClickActionLightboxOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const next = {};
  ['width', 'maxWidth', 'height', 'maxHeight', 'padding', 'background', 'color', 'borderRadius', 'boxShadow', 'backdrop'].forEach((key) => {
    if (hasOwn(input, key)) {
      next[key] = typeof input[key] === 'string' ? input[key] : '';
    }
  });
  if (hasOwn(input, 'closeOnBackdrop')) {
    next.closeOnBackdrop = input.closeOnBackdrop !== false;
  }
  if (hasOwn(input, 'closeOnEscape')) {
    next.closeOnEscape = input.closeOnEscape !== false;
  }
  if (hasOwn(input, 'showCloseButton')) {
    next.showCloseButton = input.showCloseButton !== false;
  }
  return Object.keys(next).length ? next : undefined;
}

function normalizeClickActionPanelOptions(input) {
  if (!input || typeof input !== 'object') {
    return {
      size: '320px',
      padding: '16px',
      background: '#ffffff',
      color: '#18344b',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      borderRadius: '',
      gap: '16px',
      closeable: true,
      closeOnEmptyRegionClick: false,
      closeOnMapClick: false
    };
  }

  return {
    size: typeof input.size === 'string' ? input.size : '320px',
    padding: typeof input.padding === 'string' ? input.padding : '16px',
    background: typeof input.background === 'string' ? input.background : '#ffffff',
    color: typeof input.color === 'string' ? input.color : '#18344b',
    border: typeof input.border === 'string' ? input.border : '1px solid rgba(15, 23, 42, 0.08)',
    borderRadius: typeof input.borderRadius === 'string' ? input.borderRadius : '',
    gap: typeof input.gap === 'string' ? input.gap : '16px',
    closeable: input.closeable !== false,
    closeOnEmptyRegionClick: input.closeOnEmptyRegionClick === true,
    closeOnMapClick: input.closeOnMapClick === true
  };
}

function normalizePartialClickActionPanelOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const next = {};
  ['size', 'padding', 'background', 'color', 'border', 'borderRadius', 'gap'].forEach((key) => {
    if (hasOwn(input, key)) {
      next[key] = typeof input[key] === 'string' ? input[key] : '';
    }
  });
  if (hasOwn(input, 'closeable')) {
    next.closeable = input.closeable !== false;
  }
  if (hasOwn(input, 'closeOnEmptyRegionClick')) {
    next.closeOnEmptyRegionClick = input.closeOnEmptyRegionClick === true;
  }
  if (hasOwn(input, 'closeOnMapClick')) {
    next.closeOnMapClick = input.closeOnMapClick === true;
  }
  return Object.keys(next).length ? next : undefined;
}

function normalizeClickActionOptions(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const type = normalizeClickActionType(input.type);
  if (!type) {
    return null;
  }

  return {
    type,
    url: normalizeOptionalResolverValue(input.url),
    content: normalizeOptionalResolverValue(input.content),
    title: normalizeOptionalResolverValue(input.title),
    render: normalizeClickActionRenderMode(input.render),
    target: normalizeClickActionTarget(input.target),
    placement: normalizeClickActionPlacement(input.placement),
    mode: normalizeClickActionMode(input.mode),
    className: typeof input.className === 'string' ? input.className : '',
    iframe: normalizeClickActionIframeOptions(input.iframe),
    lightbox: normalizeClickActionLightboxOptions(input.lightbox),
    panel: normalizeClickActionPanelOptions(input.panel)
  };
}

function normalizePartialClickActionOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (input === false) {
    return false;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const next = {};
  if (hasOwn(input, 'type')) {
    next.type = normalizeClickActionType(input.type);
  }
  if (hasOwn(input, 'url')) {
    next.url = normalizeOptionalResolverValue(input.url);
  }
  if (hasOwn(input, 'content')) {
    next.content = normalizeOptionalResolverValue(input.content);
  }
  if (hasOwn(input, 'title')) {
    next.title = normalizeOptionalResolverValue(input.title);
  }
  if (hasOwn(input, 'render')) {
    next.render = normalizeClickActionRenderMode(input.render);
  }
  if (hasOwn(input, 'target')) {
    next.target = normalizeClickActionTarget(input.target);
  }
  if (hasOwn(input, 'placement')) {
    next.placement = normalizeClickActionPlacement(input.placement);
  }
  if (hasOwn(input, 'mode')) {
    next.mode = normalizeClickActionMode(input.mode);
  }
  if (hasOwn(input, 'className')) {
    next.className = typeof input.className === 'string' ? input.className : '';
  }
  if (hasOwn(input, 'iframe')) {
    next.iframe = normalizePartialClickActionIframeOptions(input.iframe);
  }
  if (hasOwn(input, 'lightbox')) {
    next.lightbox = normalizePartialClickActionLightboxOptions(input.lightbox);
  }
  if (hasOwn(input, 'panel')) {
    next.panel = normalizePartialClickActionPanelOptions(input.panel);
  }
  return Object.keys(next).length ? next : undefined;
}

function normalizePartialRegionStyleOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const style = {};
  if (hasOwn(input, 'defaultFill')) {
    style.defaultFill = input.defaultFill ?? null;
  }
  if (hasOwn(input, 'defaultStroke')) {
    style.defaultStroke = input.defaultStroke ?? null;
  }
  if (hasOwn(input, 'defaultStrokeWidth')) {
    style.defaultStrokeWidth = input.defaultStrokeWidth == null ? null : Number(input.defaultStrokeWidth);
  }
  if (hasOwn(input, 'defaultOpacity')) {
    style.defaultOpacity = input.defaultOpacity == null ? null : Number(input.defaultOpacity);
  }
  if (hasOwn(input, 'emptyFill')) {
    style.emptyFill = input.emptyFill ?? null;
  }
  if (hasOwn(input, 'emptyStroke')) {
    style.emptyStroke = input.emptyStroke ?? null;
  }
  if (hasOwn(input, 'emptyStrokeWidth')) {
    style.emptyStrokeWidth = input.emptyStrokeWidth == null ? null : Number(input.emptyStrokeWidth);
  }
  if (hasOwn(input, 'emptyOpacity')) {
    style.emptyOpacity = input.emptyOpacity == null ? null : Number(input.emptyOpacity);
  }
  if (hasOwn(input, 'interactive')) {
    style.interactive = input.interactive !== false;
  }
  if (hasOwn(input, 'emptyInteractive')) {
    style.emptyInteractive = input.emptyInteractive !== false;
  }
  return style;
}

function normalizeRegionStyleOptions(input = {}) {
  const style = input && typeof input === 'object' ? { ...input } : {};
  return {
    defaultFill: style.defaultFill ?? null,
    defaultStroke: style.defaultStroke ?? null,
    defaultStrokeWidth: style.defaultStrokeWidth == null ? null : Number(style.defaultStrokeWidth),
    defaultOpacity: style.defaultOpacity == null ? null : Number(style.defaultOpacity),
    emptyFill: style.emptyFill ?? null,
    emptyStroke: style.emptyStroke ?? null,
    emptyStrokeWidth: style.emptyStrokeWidth == null ? null : Number(style.emptyStrokeWidth),
    emptyOpacity: style.emptyOpacity == null ? null : Number(style.emptyOpacity),
    interactive: style.interactive !== false,
    emptyInteractive: style.emptyInteractive !== false
  };
}

function normalizeInteractionOptions(input = {}) {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const click = input.click && typeof input.click === 'object' ? input.click : null;
  if (!click) {
    return {};
  }

  return {
    click: {
      zoomTo: click.zoomTo ?? false,
      zoomPadding: Number(click.zoomPadding ?? 24),
      zoomMax: click.zoomMax == null ? null : Number(click.zoomMax),
      zoomScale: click.zoomScale == null ? null : Number(click.zoomScale),
      emptyRegions: click.emptyRegions !== false,
      showLayers: normalizeIdList(click.showLayers),
      hideLayers: normalizeIdList(click.hideLayers),
      toggleLayers: normalizeIdList(click.toggleLayers),
      action: normalizeClickActionOptions(click.action),
      handler: typeof click.handler === 'function' ? click.handler : null
    }
  };
}

function normalizePartialInteractionOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (input === false) {
    return false;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  if (hasOwn(input, 'click') && input.click === false) {
    return { click: false };
  }

  const click = input.click && typeof input.click === 'object' ? input.click : null;
  if (!click) {
    return {};
  }

  const result = { click: {} };
  if (hasOwn(click, 'zoomTo')) {
    result.click.zoomTo = click.zoomTo ?? false;
  }
  if (hasOwn(click, 'zoomPadding')) {
    result.click.zoomPadding = Number(click.zoomPadding ?? 24);
  }
  if (hasOwn(click, 'zoomMax')) {
    result.click.zoomMax = click.zoomMax == null ? null : Number(click.zoomMax);
  }
  if (hasOwn(click, 'zoomScale')) {
    result.click.zoomScale = click.zoomScale == null ? null : Number(click.zoomScale);
  }
  if (hasOwn(click, 'emptyRegions')) {
    result.click.emptyRegions = click.emptyRegions !== false;
  }
  if (hasOwn(click, 'showLayers')) {
    result.click.showLayers = normalizeIdList(click.showLayers);
  }
  if (hasOwn(click, 'hideLayers')) {
    result.click.hideLayers = normalizeIdList(click.hideLayers);
  }
  if (hasOwn(click, 'toggleLayers')) {
    result.click.toggleLayers = normalizeIdList(click.toggleLayers);
  }
  if (hasOwn(click, 'action')) {
    result.click.action = normalizePartialClickActionOptions(click.action);
  }
  if (hasOwn(click, 'handler')) {
    result.click.handler = typeof click.handler === 'function' ? click.handler : null;
  }
  return result;
}

function normalizeBindingsObject(input) {
  return input && typeof input === 'object' ? { ...input } : {};
}

function normalizePartialBindings(input) {
  if (isNullish(input)) {
    return undefined;
  }
  return normalizeBindingsObject(input);
}

function normalizePartialStyleObject(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }
  return { ...input };
}

function normalizeMarkerDefaultsInput(input) {
  if (isNullish(input)) {
    return {};
  }
  if (!input || typeof input !== 'object') {
    return {};
  }
  return {
    type: hasOwn(input, 'type') ? normalizeMarkerType({ type: input.type, image: input.image }) : undefined,
    image: hasOwn(input, 'image') ? normalizeMarkerImageOptions(input.image, input.style) : undefined,
    ...(hasOwn(input, 'animation') ? { animation: normalizeMarkerAnimation(input.animation) } : {}),
    style: normalizePartialStyleObject(input.style),
    hoverStyle: normalizePartialStyleObject(input.hoverStyle),
    labels: normalizePartialMarkerLabelOptions(input.labels),
    clusters: normalizePartialMarkerClusterOptions(input.clusters),
    interaction: normalizePartialInteractionOptions(input.interaction),
    bindings: normalizePartialBindings(input.bindings)
  };
}

function normalizeRegionDefaultsInput(input) {
  if (isNullish(input)) {
    return {};
  }
  if (!input || typeof input !== 'object') {
    return {};
  }
  return {
    joinedStyle: normalizePartialStyleObject(input.joinedStyle ?? input.style),
    joinedHoverStyle: normalizePartialStyleObject(input.joinedHoverStyle ?? input.hoverStyle),
    emptyStyle: normalizePartialStyleObject(input.emptyStyle),
    emptyHoverStyle: normalizePartialStyleObject(input.emptyHoverStyle),
    joinedInteractive: hasOwn(input, 'joinedInteractive')
      ? input.joinedInteractive !== false
      : hasOwn(input, 'interactive')
        ? input.interactive !== false
        : undefined,
    emptyInteractive: hasOwn(input, 'emptyInteractive') ? input.emptyInteractive !== false : undefined,
    transforms: normalizeRegionTransformMap(input.transforms),
    labels: normalizePartialLabelOptions(input.labels),
    interaction: normalizePartialInteractionOptions(input.interaction),
    bindings: normalizePartialBindings(input.bindings)
  };
}

function normalizeLineDefaultsInput(input) {
  if (isNullish(input)) {
    return {};
  }
  if (!input || typeof input !== 'object') {
    return {};
  }
  return {
    style: normalizePartialStyleObject(input.style),
    hoverStyle: normalizePartialStyleObject(input.hoverStyle),
    bindings: normalizePartialBindings(input.bindings)
  };
}

function normalizeLineMarkerRefs(input = []) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.reduce((refs, entry) => {
    if (!entry || typeof entry !== 'object') {
      return refs;
    }

    const markerId = String(entry.markerId ?? '').trim();
    if (!markerId) {
      return refs;
    }

    const layerId = String(entry.layerId ?? '').trim();
    refs.push(layerId ? { markerId, layerId } : { markerId });
    return refs;
  }, []);
}

function normalizeLinePathMode(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized === 'geodesic' || normalized === 'polyline' ? normalized : null;
}

function convertLegacyRegionStyleToDefaults(input) {
  const style = normalizePartialRegionStyleOptions(input);
  if (!style) {
    return {};
  }
  return {
    joinedStyle: {
      fill: style.defaultFill,
      stroke: style.defaultStroke,
      strokeWidth: style.defaultStrokeWidth,
      opacity: style.defaultOpacity
    },
    emptyStyle: {
      fill: style.emptyFill,
      stroke: style.emptyStroke,
      strokeWidth: style.emptyStrokeWidth,
      opacity: style.emptyOpacity
    },
    joinedInteractive: hasOwn(style, 'interactive') ? style.interactive : undefined,
    emptyInteractive: hasOwn(style, 'emptyInteractive') ? style.emptyInteractive : undefined
  };
}

function normalizeEntityDefaults(input = {}, legacy = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const legacyRegionDefaults = convertLegacyRegionStyleToDefaults(legacy.regionStyle);
  return {
    markers: {
      ...normalizeMarkerDefaultsInput(source.markers),
      labels: hasOwn(source.markers ?? {}, 'labels')
        ? normalizePartialMarkerLabelOptions(source.markers.labels)
        : legacy.markerLabels,
      clusters: hasOwn(source.markers ?? {}, 'clusters')
        ? normalizePartialMarkerClusterOptions(source.markers.clusters)
        : legacy.markerClusters,
      interaction: hasOwn(source.markers ?? {}, 'interaction')
        ? normalizePartialInteractionOptions(source.markers.interaction)
        : legacy.markerInteraction,
      bindings: hasOwn(source.markers ?? {}, 'bindings')
        ? normalizePartialBindings(source.markers.bindings)
        : legacy.markerBindings
    },
    regions: {
      ...legacyRegionDefaults,
      ...normalizeRegionDefaultsInput(source.regions),
      labels: hasOwn(source.regions ?? {}, 'labels')
        ? normalizePartialLabelOptions(source.regions.labels)
        : legacy.regionLabels,
      interaction: hasOwn(source.regions ?? {}, 'interaction')
        ? normalizePartialInteractionOptions(source.regions.interaction)
        : legacy.regionInteraction,
      bindings: hasOwn(source.regions ?? {}, 'bindings')
        ? normalizePartialBindings(source.regions.bindings)
        : legacy.regionBindings
    },
    lines: {
      ...normalizeLineDefaultsInput(source.lines),
      bindings: hasOwn(source.lines ?? {}, 'bindings')
        ? normalizePartialBindings(source.lines.bindings)
        : legacy.lineBindings
    }
  };
}

function resolveDisableableConfig(normalize, ...sources) {
  let result;
  sources.forEach((source) => {
    if (isNullish(source)) {
      return;
    }
    if (source === false) {
      result = false;
      return;
    }
    result = result === false ? { ...source } : { ...(result ?? {}), ...source };
  });
  return result === false ? normalize(false) : normalize(result ?? {});
}

function resolveMergedObject(...sources) {
  let result = {};
  sources.forEach((source) => {
    if (!source || typeof source !== 'object' || source === false) {
      return;
    }
    result = { ...result, ...source };
  });
  return result;
}

function clonePlainObject(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => clonePlainObject(entry));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((accumulator, [key, entry]) => {
      accumulator[key] = clonePlainObject(entry);
      return accumulator;
    }, {});
  }
  return value;
}

function cloneDisableableState(value) {
  if (value === false || isNullish(value)) {
    return value;
  }
  return clonePlainObject(value);
}

function mergeDisableableState(baseValue, patchValue) {
  if (isNullish(patchValue)) {
    return cloneDisableableState(baseValue);
  }
  if (patchValue === false) {
    return false;
  }
  if (!patchValue || typeof patchValue !== 'object') {
    return cloneDisableableState(baseValue);
  }
  return {
    ...(baseValue && baseValue !== false ? baseValue : {}),
    ...patchValue
  };
}

function mergeClickActionState(baseValue, patchValue) {
  if (isNullish(patchValue)) {
    return clonePlainObject(baseValue);
  }
  if (patchValue === false) {
    return false;
  }
  if (!patchValue || typeof patchValue !== 'object') {
    return clonePlainObject(baseValue);
  }

  const base = baseValue && baseValue !== false && typeof baseValue === 'object' ? baseValue : {};
  const next = {
    ...base,
    ...patchValue
  };

  if (hasOwn(patchValue, 'iframe')) {
    next.iframe = mergePlainState(base.iframe, patchValue.iframe);
  }
  if (hasOwn(patchValue, 'lightbox')) {
    next.lightbox = mergePlainState(base.lightbox, patchValue.lightbox);
  }
  if (hasOwn(patchValue, 'panel')) {
    next.panel = mergePlainState(base.panel, patchValue.panel);
  }

  return next;
}

function mergeClickInteractionState(baseValue, patchValue) {
  if (isNullish(patchValue)) {
    return clonePlainObject(baseValue);
  }
  if (!patchValue || typeof patchValue !== 'object') {
    return clonePlainObject(baseValue);
  }

  const base = baseValue && typeof baseValue === 'object' ? baseValue : {};
  const next = { ...base };

  ['zoomTo', 'zoomPadding', 'zoomMax', 'zoomScale', 'emptyRegions', 'showLayers', 'hideLayers', 'toggleLayers', 'handler'].forEach((key) => {
    if (hasOwn(patchValue, key)) {
      next[key] = clonePlainObject(patchValue[key]);
    }
  });

  if (hasOwn(patchValue, 'action')) {
    next.action = mergeClickActionState(base.action, patchValue.action);
  }

  return next;
}

function mergePlainState(baseValue, patchValue) {
  if (isNullish(patchValue)) {
    return clonePlainObject(baseValue);
  }
  if (!patchValue || typeof patchValue !== 'object') {
    return clonePlainObject(baseValue);
  }
  return {
    ...(baseValue && typeof baseValue === 'object' ? baseValue : {}),
    ...patchValue
  };
}

function cloneEntityDefaultsState(defaults = {}) {
  return {
    markers: {
      ...(defaults.markers?.type != null ? { type: defaults.markers.type } : {}),
      ...(defaults.markers?.image != null ? { image: clonePlainObject(defaults.markers.image) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.markers ?? {}, 'animation') ? { animation: clonePlainObject(defaults.markers.animation) } : {}),
      ...(defaults.markers?.style != null ? { style: clonePlainObject(defaults.markers.style) } : {}),
      ...(defaults.markers?.hoverStyle != null ? { hoverStyle: clonePlainObject(defaults.markers.hoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.markers ?? {}, 'labels') ? { labels: cloneDisableableState(defaults.markers.labels) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.markers ?? {}, 'clusters') ? { clusters: cloneDisableableState(defaults.markers.clusters) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.markers ?? {}, 'interaction') ? { interaction: cloneDisableableState(defaults.markers.interaction) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.markers ?? {}, 'bindings') ? { bindings: clonePlainObject(defaults.markers.bindings) } : {})
    },
    regions: {
      ...(defaults.regions?.joinedStyle != null ? { joinedStyle: clonePlainObject(defaults.regions.joinedStyle) } : {}),
      ...(defaults.regions?.joinedHoverStyle != null ? { joinedHoverStyle: clonePlainObject(defaults.regions.joinedHoverStyle) } : {}),
      ...(defaults.regions?.emptyStyle != null ? { emptyStyle: clonePlainObject(defaults.regions.emptyStyle) } : {}),
      ...(defaults.regions?.emptyHoverStyle != null ? { emptyHoverStyle: clonePlainObject(defaults.regions.emptyHoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.regions ?? {}, 'joinedInteractive') ? { joinedInteractive: defaults.regions.joinedInteractive } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.regions ?? {}, 'emptyInteractive') ? { emptyInteractive: defaults.regions.emptyInteractive } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.regions ?? {}, 'transforms') ? { transforms: clonePlainObject(defaults.regions.transforms) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.regions ?? {}, 'labels') ? { labels: cloneDisableableState(defaults.regions.labels) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.regions ?? {}, 'interaction') ? { interaction: cloneDisableableState(defaults.regions.interaction) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.regions ?? {}, 'bindings') ? { bindings: clonePlainObject(defaults.regions.bindings) } : {})
    },
    lines: {
      ...(defaults.lines?.style != null ? { style: clonePlainObject(defaults.lines.style) } : {}),
      ...(defaults.lines?.hoverStyle != null ? { hoverStyle: clonePlainObject(defaults.lines.hoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(defaults.lines ?? {}, 'bindings') ? { bindings: clonePlainObject(defaults.lines.bindings) } : {})
    }
  };
}

function mergeEntityDefaultsState(base = {}, patch = {}) {
  return {
    markers: {
      ...(Object.prototype.hasOwnProperty.call(base.markers ?? {}, 'type') ? { type: base.markers.type } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.markers ?? {}, 'image') ? { image: clonePlainObject(base.markers.image) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.markers ?? {}, 'animation') ? { animation: clonePlainObject(base.markers.animation) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.markers ?? {}, 'style') ? { style: clonePlainObject(base.markers.style) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.markers ?? {}, 'hoverStyle') ? { hoverStyle: clonePlainObject(base.markers.hoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.markers ?? {}, 'labels') ? { labels: cloneDisableableState(base.markers.labels) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.markers ?? {}, 'clusters') ? { clusters: cloneDisableableState(base.markers.clusters) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.markers ?? {}, 'interaction') ? { interaction: cloneDisableableState(base.markers.interaction) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.markers ?? {}, 'bindings') ? { bindings: clonePlainObject(base.markers.bindings) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.markers ?? {}, 'type') ? { type: patch.markers.type } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.markers ?? {}, 'image') ? { image: clonePlainObject(patch.markers.image) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.markers ?? {}, 'animation') ? { animation: clonePlainObject(patch.markers.animation) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.markers ?? {}, 'style') ? { style: mergePlainState(base.markers?.style, patch.markers.style) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.markers ?? {}, 'hoverStyle') ? { hoverStyle: mergePlainState(base.markers?.hoverStyle, patch.markers.hoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.markers ?? {}, 'labels') ? { labels: mergeDisableableState(base.markers?.labels, patch.markers.labels) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.markers ?? {}, 'clusters') ? { clusters: mergeDisableableState(base.markers?.clusters, patch.markers.clusters) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.markers ?? {}, 'interaction') ? { interaction: mergeDisableableState(base.markers?.interaction, patch.markers.interaction) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.markers ?? {}, 'bindings') ? { bindings: mergePlainState(base.markers?.bindings, patch.markers.bindings) } : {})
    },
    regions: {
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'joinedStyle') ? { joinedStyle: clonePlainObject(base.regions.joinedStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'joinedHoverStyle') ? { joinedHoverStyle: clonePlainObject(base.regions.joinedHoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'emptyStyle') ? { emptyStyle: clonePlainObject(base.regions.emptyStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'emptyHoverStyle') ? { emptyHoverStyle: clonePlainObject(base.regions.emptyHoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'joinedInteractive') ? { joinedInteractive: base.regions.joinedInteractive } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'emptyInteractive') ? { emptyInteractive: base.regions.emptyInteractive } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'transforms') ? { transforms: clonePlainObject(base.regions.transforms) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'labels') ? { labels: cloneDisableableState(base.regions.labels) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'interaction') ? { interaction: cloneDisableableState(base.regions.interaction) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.regions ?? {}, 'bindings') ? { bindings: clonePlainObject(base.regions.bindings) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'joinedStyle') ? { joinedStyle: mergePlainState(base.regions?.joinedStyle, patch.regions.joinedStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'joinedHoverStyle') ? { joinedHoverStyle: mergePlainState(base.regions?.joinedHoverStyle, patch.regions.joinedHoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'emptyStyle') ? { emptyStyle: mergePlainState(base.regions?.emptyStyle, patch.regions.emptyStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'emptyHoverStyle') ? { emptyHoverStyle: mergePlainState(base.regions?.emptyHoverStyle, patch.regions.emptyHoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'joinedInteractive') ? { joinedInteractive: patch.regions.joinedInteractive } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'emptyInteractive') ? { emptyInteractive: patch.regions.emptyInteractive } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'transforms') ? { transforms: mergeRegionTransformMaps(base.regions?.transforms, patch.regions.transforms) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'labels') ? { labels: mergeRegionLabelState(base.regions?.labels, patch.regions.labels) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'interaction') ? { interaction: mergeDisableableState(base.regions?.interaction, patch.regions.interaction) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.regions ?? {}, 'bindings') ? { bindings: mergePlainState(base.regions?.bindings, patch.regions.bindings) } : {})
    },
    lines: {
      ...(Object.prototype.hasOwnProperty.call(base.lines ?? {}, 'style') ? { style: clonePlainObject(base.lines.style) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.lines ?? {}, 'hoverStyle') ? { hoverStyle: clonePlainObject(base.lines.hoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(base.lines ?? {}, 'bindings') ? { bindings: clonePlainObject(base.lines.bindings) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.lines ?? {}, 'style') ? { style: mergePlainState(base.lines?.style, patch.lines.style) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.lines ?? {}, 'hoverStyle') ? { hoverStyle: mergePlainState(base.lines?.hoverStyle, patch.lines.hoverStyle) } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch.lines ?? {}, 'bindings') ? { bindings: mergePlainState(base.lines?.bindings, patch.lines.bindings) } : {})
    }
  };
}

function resolveInteractionConfig(...sources) {
  let click;

  sources.forEach((source) => {
    if (isNullish(source)) {
      return;
    }
    if (source === false) {
      click = false;
      return;
    }
    if (!source || typeof source !== 'object' || !hasOwn(source, 'click')) {
      return;
    }
    if (source.click === false) {
      click = false;
      return;
    }
    if (source.click && typeof source.click === 'object') {
      click = click === false ? clonePlainObject(source.click) : mergeClickInteractionState(click, source.click);
    }
  });

  if (click === false || !click) {
    return {};
  }

  return normalizeInteractionOptions({ click });
}

function resolveEntityDefaults(globalDefaults = {}, layerDefaults = {}) {
  const globalMarkers = globalDefaults.markers ?? {};
  const layerMarkers = layerDefaults.markers ?? {};
  const globalRegions = globalDefaults.regions ?? {};
  const layerRegions = layerDefaults.regions ?? {};
  const globalLines = globalDefaults.lines ?? {};
  const layerLines = layerDefaults.lines ?? {};

  return {
    markers: {
      type: layerMarkers.type ?? globalMarkers.type,
      image: layerMarkers.image ?? globalMarkers.image,
      animation: Object.prototype.hasOwnProperty.call(layerMarkers, 'animation')
        ? clonePlainObject(layerMarkers.animation)
        : clonePlainObject(globalMarkers.animation),
      style: resolveMergedObject(globalMarkers.style, layerMarkers.style),
      hoverStyle: resolveMergedObject(globalMarkers.hoverStyle, layerMarkers.hoverStyle),
      labels: resolveDisableableConfig(normalizeMarkerLabelOptions, globalMarkers.labels, layerMarkers.labels),
      clusters: resolveDisableableConfig(normalizeMarkerClusterOptions, globalMarkers.clusters, layerMarkers.clusters),
      interaction: resolveInteractionConfig(globalMarkers.interaction, layerMarkers.interaction),
      bindings: resolveMergedObject(globalMarkers.bindings, layerMarkers.bindings)
    },
    regions: {
      joinedStyle: resolveMergedObject(globalRegions.joinedStyle, layerRegions.joinedStyle),
      joinedHoverStyle: resolveMergedObject(globalRegions.joinedHoverStyle, layerRegions.joinedHoverStyle),
      emptyStyle: resolveMergedObject(globalRegions.emptyStyle, layerRegions.emptyStyle),
      emptyHoverStyle: resolveMergedObject(globalRegions.emptyHoverStyle, layerRegions.emptyHoverStyle),
      joinedInteractive: layerRegions.joinedInteractive ?? globalRegions.joinedInteractive,
      emptyInteractive: layerRegions.emptyInteractive ?? globalRegions.emptyInteractive,
      transforms: mergeRegionTransformMaps(globalRegions.transforms, layerRegions.transforms),
      labels: resolveRegionLabelConfig(globalRegions.labels, layerRegions.labels),
      interaction: resolveInteractionConfig(globalRegions.interaction, layerRegions.interaction),
      bindings: resolveMergedObject(globalRegions.bindings, layerRegions.bindings)
    },
    lines: {
      style: resolveMergedObject(globalLines.style, layerLines.style),
      hoverStyle: resolveMergedObject(globalLines.hoverStyle, layerLines.hoverStyle),
      bindings: resolveMergedObject(globalLines.bindings, layerLines.bindings)
    }
  };
}

function normalizeLayerFilterInput(input = {}) {
  return {
    includePolygonIds: Object.prototype.hasOwnProperty.call(input, 'includePolygonIds')
      ? normalizeIdList(input.includePolygonIds)
      : undefined,
    excludePolygonIds: Object.prototype.hasOwnProperty.call(input, 'excludePolygonIds')
      ? normalizeIdList(input.excludePolygonIds)
      : undefined
  };
}

function computeBounds(entries, coordinatesKey = 'coordinates') {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const visitPoint = (point) => {
    if (!Array.isArray(point) || point.length < 2) {
      return;
    }

    const x = Number(point[0]);
    const y = Number(point[1]);
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) {
      return;
    }

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };

  entries.forEach((entry) => {
    const coordinates = entry[coordinatesKey];
    if (entry.kind === 'point') {
      visitPoint(coordinates);
      return;
    }

    if (entry.kind === 'line') {
      (coordinates ?? []).forEach(visitPoint);
      return;
    }

    if (entry.kind === 'polygon') {
      (coordinates ?? []).forEach((ring) => (ring ?? []).forEach(visitPoint));
    }
  });

  if (!isFiniteNumber(minX) || !isFiniteNumber(minY) || !isFiniteNumber(maxX) || !isFiniteNumber(maxY)) {
    return { minX: -1, minY: -1, maxX: 1, maxY: 1 };
  }

  if (minX === maxX) {
    minX -= 0.5;
    maxX += 0.5;
  }

  if (minY === maxY) {
    minY -= 0.5;
    maxY += 0.5;
  }

  return { minX, minY, maxX, maxY };
}

function computeCenterFromBounds(bounds) {
  return {
    lon: (bounds.minX + bounds.maxX) / 2,
    lat: (bounds.minY + bounds.maxY) / 2
  };
}

function createFitTransform(bounds, width, height, padding = 16) {
  const safePadding = Math.max(0, Number(padding) || 0);
  const drawableWidth = Math.max(1, width - safePadding * 2);
  const drawableHeight = Math.max(1, height - safePadding * 2);
  const dataWidth = Math.max(1e-9, bounds.maxX - bounds.minX);
  const dataHeight = Math.max(1e-9, bounds.maxY - bounds.minY);

  const scaleX = drawableWidth / dataWidth;
  const scaleY = drawableHeight / dataHeight;
  const scale = Math.min(scaleX, scaleY);

  const usedWidth = dataWidth * scale;
  const usedHeight = dataHeight * scale;
  const offsetX = safePadding + (drawableWidth - usedWidth) / 2;
  const offsetY = safePadding + (drawableHeight - usedHeight) / 2;

  return {
    scale,
    padding: safePadding,
    width,
    height,
    project(x, y) {
      return {
        x: offsetX + (x - bounds.minX) * scale,
        y: offsetY + (bounds.maxY - y) * scale
      };
    },
    unproject(x, y) {
      return {
        lon: bounds.minX + (x - offsetX) / scale,
        lat: bounds.maxY - (y - offsetY) / scale
      };
    }
  };
}

function encodeHitColor(id) {
  return {
    r: id & 255,
    g: (id >> 8) & 255,
    b: (id >> 16) & 255,
    a: 255
  };
}

function decodeHitColor(r, g, b) {
  return r + (g << 8) + (b << 16);
}

function isPointOnSegment(point, start, end, tolerance = 0.75) {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const pointX = point.x - start.x;
  const pointY = point.y - start.y;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (lengthSquared <= 1e-9) {
    return Math.hypot(point.x - start.x, point.y - start.y) <= tolerance;
  }

  const projection = ((pointX * segmentX) + (pointY * segmentY)) / lengthSquared;
  if (projection < 0 || projection > 1) {
    return false;
  }

  const nearestX = start.x + segmentX * projection;
  const nearestY = start.y + segmentY * projection;
  return Math.hypot(point.x - nearestX, point.y - nearestY) <= tolerance;
}

function isPointInRing(point, ring) {
  if (!Array.isArray(ring) || ring.length < 3) {
    return false;
  }

  let inside = false;
  for (let index = 0, previousIndex = ring.length - 1; index < ring.length; previousIndex = index, index += 1) {
    const current = ring[index];
    const previous = ring[previousIndex];

    if (isPointOnSegment(point, previous, current)) {
      return true;
    }

    const intersects = ((current.y > point.y) !== (previous.y > point.y))
      && (point.x < (((previous.x - current.x) * (point.y - current.y)) / ((previous.y - current.y) || 1e-12)) + current.x);

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function isPointOnRingBoundary(point, ring) {
  if (!Array.isArray(ring) || ring.length < 2) {
    return false;
  }

  for (let index = 0; index < ring.length; index += 1) {
    const start = ring[index];
    const end = ring[(index + 1) % ring.length];
    if (end && isPointOnSegment(point, start, end)) {
      return true;
    }
  }

  return false;
}

function isPointInPolygonRings(point, rings) {
  let inside = false;

  for (const ring of (rings ?? [])) {
    if (isPointOnRingBoundary(point, ring)) {
      return true;
    }

    if (isPointInRing(point, ring)) {
      inside = !inside;
    }
  }

  return inside;
}

function getHoverIdentity(target) {
  return target?.hoverKey ?? target?.entityKey ?? null;
}

function resolveGroupedTarget(previousTarget, nextTarget) {
  if (!previousTarget || !nextTarget) {
    return nextTarget ?? previousTarget ?? null;
  }

  return getHoverIdentity(previousTarget) === getHoverIdentity(nextTarget)
    ? previousTarget
    : nextTarget;
}

function deriveHoverTransition(previousTarget, nextTarget) {
  if (!previousTarget && !nextTarget) {
    return { leave: null, enter: null, same: true };
  }

  if (!previousTarget && nextTarget) {
    return { leave: null, enter: nextTarget, same: false };
  }

  if (previousTarget && !nextTarget) {
    return { leave: previousTarget, enter: null, same: false };
  }

  const same = getHoverIdentity(previousTarget) === getHoverIdentity(nextTarget);
  if (same) {
    return { leave: null, enter: null, same: true };
  }

  return { leave: previousTarget, enter: nextTarget, same: false };
}

function mergeStyle(base, ...overrides) {
  const style = Object.assign({}, base, ...overrides.filter(Boolean));
  style.strokeWidth = Number(style.strokeWidth ?? base.strokeWidth);
  style.opacity = Number(style.opacity ?? base.opacity);
  style.lineDash = Array.isArray(style.lineDash) ? style.lineDash : [];
  style.radius = Number(style.radius ?? base.radius);
  style.width = style.width == null ? undefined : Number(style.width);
  style.height = style.height == null ? undefined : Number(style.height);
  return style;
}

function applyStyleOpacity(style, opacityMultiplier = 1) {
  const safeMultiplier = Number.isFinite(opacityMultiplier) ? opacityMultiplier : 1;
  if (safeMultiplier >= 0.999) {
    return style;
  }
  return {
    ...style,
    opacity: Number(style?.opacity ?? 1) * Math.max(0, safeMultiplier)
  };
}

function interpolateOptionalNumber(baseValue, hoverValue, mix) {
  const fromValue = Number(baseValue);
  const toValue = Number(hoverValue);
  const hasFrom = Number.isFinite(fromValue);
  const hasTo = Number.isFinite(toValue);

  if (!hasFrom && !hasTo) {
    return undefined;
  }

  if (!hasFrom) {
    return mix < 0.5 ? undefined : toValue;
  }
  if (!hasTo) {
    return mix < 0.5 ? fromValue : undefined;
  }

  return interpolateNumber(fromValue, toValue, mix);
}

function interpolateNumber(fromValue, toValue, mix) {
  return fromValue + (toValue - fromValue) * mix;
}

let colorParserContext = null;
const parsedColorCache = new Map();

function getColorParserContext() {
  if (colorParserContext || typeof document === 'undefined') {
    return colorParserContext;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  colorParserContext = canvas.getContext('2d', { willReadFrequently: true }) ?? canvas.getContext('2d');
  return colorParserContext;
}

function parseCssColor(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const key = value.trim();
  if (!key) {
    return null;
  }

  if (parsedColorCache.has(key)) {
    return parsedColorCache.get(key);
  }

  const context = getColorParserContext();
  if (!context) {
    return null;
  }

  context.clearRect(0, 0, 1, 1);
  context.fillStyle = '#000000';
  context.fillStyle = key;
  context.fillRect(0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  const parsed = {
    r: pixel[0],
    g: pixel[1],
    b: pixel[2],
    a: pixel[3] / 255
  };
  parsedColorCache.set(key, parsed);
  return parsed;
}

function formatInterpolatedColor(color) {
  const r = Math.round(clamp(color.r, 0, 255));
  const g = Math.round(clamp(color.g, 0, 255));
  const b = Math.round(clamp(color.b, 0, 255));
  const a = clamp(color.a, 0, 1);

  if (a >= 0.999) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
}

function interpolateColorValue(fromValue, toValue, mix, parseColor = parseCssColor) {
  if (mix <= 0) {
    return fromValue;
  }
  if (mix >= 1) {
    return toValue;
  }

  const fromColor = parseColor(fromValue);
  const toColor = parseColor(toValue);
  if (!fromColor || !toColor) {
    return mix < 0.5 ? fromValue : toValue;
  }

  return formatInterpolatedColor({
    r: interpolateNumber(fromColor.r, toColor.r, mix),
    g: interpolateNumber(fromColor.g, toColor.g, mix),
    b: interpolateNumber(fromColor.b, toColor.b, mix),
    a: interpolateNumber(fromColor.a, toColor.a, mix)
  });
}

function interpolateStyle(baseStyle, hoverStyle, mix, parseColor = parseCssColor) {
  if (mix <= 0) {
    return mergeStyle(baseStyle);
  }
  if (mix >= 1) {
    return mergeStyle(hoverStyle);
  }

  const base = mergeStyle(baseStyle);
  const hover = mergeStyle(hoverStyle);

  return mergeStyle(base, {
    fill: interpolateColorValue(base.fill, hover.fill, mix, parseColor),
    stroke: interpolateColorValue(base.stroke, hover.stroke, mix, parseColor),
    strokeWidth: interpolateNumber(base.strokeWidth, hover.strokeWidth, mix),
    opacity: interpolateNumber(base.opacity, hover.opacity, mix),
    radius: interpolateNumber(base.radius, hover.radius, mix),
    width: interpolateOptionalNumber(base.width, hover.width, mix),
    height: interpolateOptionalNumber(base.height, hover.height, mix),
    cursor: mix >= 0.5 ? hover.cursor : base.cursor,
    lineDash: mix >= 0.5 ? hover.lineDash : base.lineDash
  });
}

function scaleFontPixels(font, scale = 1) {
  const safeFont = String(font ?? '');
  if (!Number.isFinite(scale) || Math.abs(scale - 1) < 1e-9) {
    return safeFont;
  }

  return safeFont.replace(/(\d*\.?\d+)px/, (_, rawSize) => `${Number(rawSize) * scale}px`);
}

function resolveMarkerLabelScale(labels = {}, zoom = 1) {
  if (!labels.scaleWithZoom) {
    return 1;
  }

  const minScale = Number.isFinite(labels.minScale) ? labels.minScale : 1;
  const maxScale = Number.isFinite(labels.maxScale) ? labels.maxScale : 2;
  return clamp(Number(zoom) || 1, Math.min(minScale, maxScale), Math.max(minScale, maxScale));
}

function resolveMarkerLabelRenderOptions(labels = {}, zoom = 1) {
  const scale = resolveMarkerLabelScale(labels, zoom);
  return {
    ...labels,
    font: scaleFontPixels(labels.font, scale),
    paddingX: Number(labels.paddingX ?? 0) * scale,
    paddingY: Number(labels.paddingY ?? 0) * scale,
    borderRadius: Number(labels.borderRadius ?? 0) * scale,
    offsetX: Number(labels.offsetX ?? 0) * scale,
    offsetY: Number(labels.offsetY ?? 0) * scale,
    distance: Number(labels.distance ?? 0) * scale
  };
}

function createClusterMarker(entries = [], {
  clusterIdPrefix = 'cluster',
  layerId = null,
  layerName = null,
  source = null,
  bindings = {},
  clusterOptions = {},
  interaction = {}
} = {}, unprojectPoint = null) {
  if (!entries.length) {
    return null;
  }

  const count = entries.length;
  const centerPoint = entries.reduce((accumulator, entry) => ({
    x: accumulator.x + entry.point.x,
    y: accumulator.y + entry.point.y
  }), { x: 0, y: 0 });
  centerPoint.x /= count;
  centerPoint.y /= count;

  const geoCenter = typeof unprojectPoint === 'function'
    ? unprojectPoint(centerPoint.x, centerPoint.y)
    : {
      lon: entries[0].marker.displayLon ?? entries[0].marker.lon,
      lat: entries[0].marker.displayLat ?? entries[0].marker.lat
    };
  const markerIds = entries.map((entry) => entry.marker.id);
  const entityKeys = entries.map((entry) => entry.marker.entityKey).sort();
  const id = `${clusterIdPrefix}:${entityKeys.join('|')}`;

  return {
    id,
    lon: geoCenter.lon,
    lat: geoCenter.lat,
    type: 'circle',
    cluster: true,
    clusterData: {
      count,
      markerIds,
      markers: entries.map((entry) => entry.marker),
      screenPoint: centerPoint,
      center: { lon: geoCenter.lon, lat: geoCenter.lat }
    },
    properties: {
      count,
      markerIds
    },
    data: {
      count,
      markerIds
    },
    style: clusterOptions.style ?? {},
    clusterOptions: { ...clusterOptions },
    layerId,
    layerName,
    source,
    bindings,
    interaction,
    entityKey: id,
    hoverKey: id,
    order: entries[0].marker.order,
    bindingContext: createLayerBindingContext({
      layer: layerId ? { id: layerId, name: layerName } : null,
      source,
      marker: {
        id,
        lon: geoCenter.lon,
        lat: geoCenter.lat,
        cluster: true,
        count,
        markerIds,
        properties: { count, markerIds },
        data: { count, markerIds }
      }
    })
  };
}

function clusterMarkersForDisplay(markers = [], {
  clusterIdPrefix = 'cluster',
  layerId = null,
  layerName = null,
  source = null,
  bindings = {},
  clusterOptions = {},
  interaction = {}
} = {}, projectPoint = null, unprojectPoint = null, zoom = 1) {
  const options = normalizeMarkerClusterOptions(clusterOptions);
  if (!options.enabled) {
    return { items: markers.slice(), clusteredMarkerKeys: new Set() };
  }

  if (options.maxZoom != null && Number(zoom) > options.maxZoom) {
    return { items: markers.slice(), clusteredMarkerKeys: new Set() };
  }

  const entries = (markers ?? [])
    .map((marker) => ({
      marker,
      point: typeof projectPoint === 'function' ? projectPoint(marker.lon, marker.lat, marker) : null
    }))
    .filter((entry) => entry.point);

  if (entries.length === 0) {
    return { items: [], clusteredMarkerKeys: new Set() };
  }

  const visited = new Set();
  const items = [];
  const clusteredMarkerKeys = new Set();

  entries.forEach((entry, index) => {
    if (visited.has(index)) {
      return;
    }

    visited.add(index);
    const queue = [index];
    const group = [];

    while (queue.length) {
      const currentIndex = queue.shift();
      const current = entries[currentIndex];
      group.push(current);

      entries.forEach((candidate, candidateIndex) => {
        if (visited.has(candidateIndex)) {
          return;
        }

        if (computeScreenDistance(current.point, candidate.point) <= options.radius) {
          visited.add(candidateIndex);
          queue.push(candidateIndex);
        }
      });
    }

    if (group.length >= options.minPoints) {
      group.forEach((groupEntry) => clusteredMarkerKeys.add(groupEntry.marker.entityKey));
      const clusterMarker = createClusterMarker(group, {
        clusterIdPrefix,
        layerId,
        layerName,
        source,
        bindings,
        clusterOptions: options,
        interaction
      }, unprojectPoint);
      if (clusterMarker) {
        items.push(clusterMarker);
      }
      return;
    }

    group.forEach((groupEntry) => items.push(groupEntry.marker));
  });

  return { items, clusteredMarkerKeys };
}

function getNow() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

function normalizeTooltipOptions(input = {}) {
  const source = input ?? {};
  const tooltip = { ...DEFAULT_TOOLTIP_OPTIONS, ...source };
  if (!['follow', 'fixed', 'interactive-fixed'].includes(tooltip.mode)) {
    tooltip.mode = DEFAULT_TOOLTIP_OPTIONS.mode;
  }

  const hasTrigger = Object.prototype.hasOwnProperty.call(source, 'trigger');
  const hasFollowPointer = Object.prototype.hasOwnProperty.call(source, 'followPointer');
  const hasInteractive = Object.prototype.hasOwnProperty.call(source, 'interactive');

  if (tooltip.mode === 'follow') {
    if (!hasTrigger) {
      tooltip.trigger = 'hover';
    }
    if (!hasFollowPointer) {
      tooltip.followPointer = true;
    }
    if (!hasInteractive) {
      tooltip.interactive = false;
    }
  } else if (tooltip.mode === 'fixed') {
    if (!hasTrigger) {
      tooltip.trigger = 'hover';
    }
    if (!hasFollowPointer) {
      tooltip.followPointer = false;
    }
    if (!hasInteractive) {
      tooltip.interactive = false;
    }
  } else if (tooltip.mode === 'interactive-fixed') {
    if (!hasTrigger) {
      tooltip.trigger = 'hover';
    }
    if (!hasFollowPointer) {
      tooltip.followPointer = false;
    }
    if (!hasInteractive) {
      tooltip.interactive = true;
    }
  }

  if (!['hover', 'click', 'none'].includes(tooltip.trigger)) {
    tooltip.trigger = DEFAULT_TOOLTIP_OPTIONS.trigger;
  }
  if (!['auto', 'top', 'bottom', 'left', 'right'].includes(tooltip.position)) {
    tooltip.position = DEFAULT_TOOLTIP_OPTIONS.position;
  }
  tooltip.offsetX = Number(tooltip.offsetX ?? DEFAULT_TOOLTIP_OPTIONS.offsetX);
  tooltip.offsetY = Number(tooltip.offsetY ?? DEFAULT_TOOLTIP_OPTIONS.offsetY);
  tooltip.className = tooltip.className ?? '';
  tooltip.enabled = Boolean(tooltip.enabled) && tooltip.trigger !== 'none';
  tooltip.followPointer = Boolean(tooltip.followPointer);
  tooltip.interactive = Boolean(tooltip.interactive);
  tooltip.showPointer = Boolean(tooltip.showPointer);
  const regions = tooltip.regions && typeof tooltip.regions === 'object' ? { ...tooltip.regions } : {};
  tooltip.regions = {
    visibility: ['all', 'joined-only'].includes(regions.visibility)
      ? regions.visibility
      : DEFAULT_TOOLTIP_OPTIONS.regions.visibility
  };
  tooltip.style = tooltip.style && typeof tooltip.style === 'object' ? { ...tooltip.style } : null;
  tooltip.render = typeof tooltip.render === 'function' ? tooltip.render : null;
  tooltip.template = String(tooltip.template ?? DEFAULT_TOOLTIP_OPTIONS.template);
  return tooltip;
}

function normalizeLegendPosition(value) {
  const normalized = String(value ?? DEFAULT_LEGEND_OPTIONS.position).trim().toLowerCase();
  return LEGEND_POSITIONS.has(normalized) ? normalized : DEFAULT_LEGEND_OPTIONS.position;
}

function normalizeLegendSize(value) {
  const normalized = String(value ?? DEFAULT_LEGEND_OPTIONS.size).trim().toLowerCase();
  return LEGEND_SIZES.has(normalized) ? normalized : DEFAULT_LEGEND_OPTIONS.size;
}

function normalizeLegendType(value) {
  const normalized = String(value ?? DEFAULT_LEGEND_OPTIONS.type).trim().toLowerCase();
  return LEGEND_TYPES.has(normalized) ? normalized : DEFAULT_LEGEND_OPTIONS.type;
}

function normalizeLegendInteraction(value) {
  const normalized = String(value ?? DEFAULT_LEGEND_OPTIONS.interaction).trim().toLowerCase();
  return LEGEND_INTERACTIONS.has(normalized) ? normalized : DEFAULT_LEGEND_OPTIONS.interaction;
}

function normalizeLegendEntry(entry = {}, index = 0) {
  const source = entry && typeof entry === 'object' ? entry : {};
  return {
    id: source.id == null ? `legend-entry-${index + 1}` : String(source.id),
    label: String(source.label ?? source.name ?? '').trim(),
    color: String(source.color ?? DEFAULT_FEATURE_STYLE.fill).trim() || DEFAULT_FEATURE_STYLE.fill
  };
}

function normalizeLegendOptions(input = {}) {
  if (input === false || input == null) {
    return {
      ...DEFAULT_LEGEND_OPTIONS,
      entries: []
    };
  }

  const source = input && typeof input === 'object' ? input : {};
  const hasConfig = Object.keys(source).length > 0;
  return {
    enabled: Object.prototype.hasOwnProperty.call(source, 'enabled') ? source.enabled === true : hasConfig,
    type: normalizeLegendType(source.type),
    interaction: normalizeLegendInteraction(source.interaction),
    position: normalizeLegendPosition(source.position),
    size: normalizeLegendSize(source.size),
    entries: Array.isArray(source.entries)
      ? source.entries
        .map((entry, index) => normalizeLegendEntry(entry, index))
        .filter((entry) => entry.label)
      : []
  };
}

function resolveLayerLegendColor(layer) {
  const color = layer?.resolvedDefaults?.regions?.joinedStyle?.fill
    ?? layer?.defaults?.regions?.joinedStyle?.fill
    ?? DEFAULT_FEATURE_STYLE.fill;
  const normalized = String(color ?? '').trim();
  return normalized || DEFAULT_FEATURE_STYLE.fill;
}

function resolveLegendEntriesFromOptions(legendOptions = {}, layers = []) {
  if (!legendOptions?.enabled) {
    return [];
  }

  if (legendOptions.type === 'custom') {
    return (legendOptions.entries ?? []).map((entry, index) => ({
      id: entry.id ?? `legend-entry-${index + 1}`,
      label: entry.label,
      color: entry.color,
      visible: true,
      interactive: false,
      layerId: null
    }));
  }

  return (layers ?? []).map((layer) => ({
    id: layer?.id ?? '',
    label: String(layer?.name ?? layer?.id ?? 'Layer'),
    color: resolveLayerLegendColor(layer),
    visible: layer?.visible !== false,
    interactive: legendOptions.interaction === 'toggle-layer-visibility',
    layerId: layer?.id ?? null
  }));
}

function normalizeLayerTooltipOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const tooltip = {};
  if (hasOwn(input, 'template')) {
    tooltip.template = input.template == null ? '' : String(input.template);
  }
  if (hasOwn(input, 'className')) {
    tooltip.className = input.className == null ? '' : String(input.className);
  }
  if (hasOwn(input, 'style')) {
    tooltip.style = input.style && typeof input.style === 'object'
      ? { ...input.style }
      : null;
  }
  return tooltip;
}

function cloneLayerTooltipOptions(input) {
  if (isNullish(input)) {
    return undefined;
  }
  return {
    ...(hasOwn(input, 'template') ? { template: input.template } : {}),
    ...(hasOwn(input, 'className') ? { className: input.className } : {}),
    ...(hasOwn(input, 'style') ? { style: input.style && typeof input.style === 'object' ? { ...input.style } : input.style } : {})
  };
}

function mergeTooltipPresentationOptions(baseTooltip = {}, layerTooltip) {
  if (!layerTooltip || typeof layerTooltip !== 'object') {
    return baseTooltip;
  }

  return {
    ...baseTooltip,
    ...(hasOwn(layerTooltip, 'template') ? { template: layerTooltip.template } : {}),
    ...(hasOwn(layerTooltip, 'className') ? { className: layerTooltip.className } : {}),
    ...(hasOwn(layerTooltip, 'style')
      ? {
        style: layerTooltip.style && typeof layerTooltip.style === 'object'
          ? { ...(baseTooltip.style ?? {}), ...layerTooltip.style }
          : null
      }
      : {})
  };
}

function shouldShowTooltipForPayload(tooltipOptions, payload) {
  if (!tooltipOptions?.enabled || !payload) {
    return false;
  }

  const regionVisibility = tooltipOptions.regions?.visibility ?? DEFAULT_TOOLTIP_OPTIONS.regions.visibility;
  const isRegionPayload = payload.geometryType === 'Polygon' || payload.geometryType === 'MultiPolygon';
  if (isRegionPayload && regionVisibility === 'joined-only' && payload.region == null) {
    return false;
  }

  return true;
}

function renderTooltipTemplate(template, payload) {
  return String(template ?? '').replace(/\{([^}]+)\}/g, (_, rawKey) => {
    const key = String(rawKey).trim();
    if (!key) {
      return '';
    }

    const value = resolveContextValue(key, payload);
    return value == null ? '' : String(value);
  });
}

function templateReferencesContextKey(template, key) {
  if (template == null || key == null) {
    return false;
  }

  const normalizedKey = String(key).trim();
  if (!normalizedKey) {
    return false;
  }

  const pattern = new RegExp(`\\{\\s*${normalizedKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}`);
  return pattern.test(String(template));
}

function resolveClickActionValue(value, payload, geo) {
  if (typeof value === 'function') {
    const resolved = value(payload, geo);
    return resolved == null ? null : String(resolved);
  }
  if (typeof value === 'string') {
    return value.includes('{') ? renderTooltipTemplate(value, payload) : value;
  }
  return null;
}

function resolveClickActionRequest(action, payload, geo) {
  if (!action || typeof action !== 'object' || !action.type) {
    return null;
  }

  const url = resolveClickActionValue(action.url, payload, geo);
  const content = resolveClickActionValue(action.content, payload, geo);
  const title = resolveClickActionValue(action.title, payload, geo);
  const requestedRenderMode = normalizeClickActionRenderMode(action.render);
  const renderMode = requestedRenderMode === 'auto'
    ? (url ? 'iframe' : 'html')
    : requestedRenderMode;

  if (action.type === 'navigate') {
    return url ? { type: 'navigate', url, title } : null;
  }

  if (renderMode === 'iframe') {
    return url
      ? {
        type: action.type,
        renderMode,
        title,
        url
      }
      : null;
  }

  const resolvedContent = content ?? (renderMode === 'text' ? url : null);
  if (resolvedContent == null) {
    return null;
  }

  return {
    type: action.type,
    renderMode,
    title,
    content: String(resolvedContent)
  };
}

function createTooltipHtml(tooltipOptions, payload) {
  if (!tooltipOptions.enabled || !payload) {
    return '';
  }

  if (tooltipOptions.render) {
    const rendered = tooltipOptions.render(payload);
    return rendered == null ? '' : String(rendered);
  }

  if (payload.tooltipContent != null && templateReferencesContextKey(tooltipOptions.template, 'tooltipContent')) {
    return renderTooltipTemplate(tooltipOptions.template, payload);
  }

  if (payload.tooltipHtml != null) {
    return String(payload.tooltipHtml);
  }

  if (payload.tooltipTemplate != null) {
    return renderTooltipTemplate(payload.tooltipTemplate, payload);
  }

  return renderTooltipTemplate(tooltipOptions.template, payload);
}

function shouldPersistTooltip(tooltipOptions, tooltipHovered, tooltipFocused) {
  if (typeof tooltipOptions === 'string') {
    return tooltipOptions === 'interactive-fixed' && (tooltipHovered || tooltipFocused);
  }

  return Boolean(tooltipOptions?.interactive) && (tooltipHovered || tooltipFocused);
}

function escapeJavaScriptString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function normalizeZoom(value, minZoom = DEFAULT_MIN_ZOOM, maxZoom = DEFAULT_MAX_ZOOM) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return 1;
  }
  return clamp(next, minZoom, maxZoom);
}

function normalizeCenter(center, fallback = { lon: 0, lat: 0 }) {
  if (!center || typeof center !== 'object') {
    return { ...fallback };
  }

  const lon = Number(center.lon);
  const lat = Number(center.lat);
  return {
    lon: Number.isFinite(lon) ? lon : fallback.lon,
    lat: Number.isFinite(lat) ? lat : fallback.lat
  };
}

function normalizeIdList(values) {
  if (!values) {
    return [];
  }

  if (values instanceof Set) {
    return Array.from(values).map((value) => String(value).trim()).filter(Boolean);
  }

  if (Array.isArray(values)) {
    return values.map((value) => String(value).trim()).filter(Boolean);
  }

  if (typeof values === 'string') {
    return values.split(',').map((value) => value.trim()).filter(Boolean);
  }

  return [];
}

function resolveLayerTargetIds(layers, values) {
  const normalized = normalizeIdList(values);
  if (!Array.isArray(layers) || layers.length === 0) {
    return normalized;
  }

  return normalized.map((value) => {
    const directMatch = layers.find((layer) => layer?.id === value);
    if (directMatch) {
      return directMatch.id;
    }

    const nameMatches = layers.filter((layer) => layer?.name === value);
    if (nameMatches.length === 1) {
      return nameMatches[0].id;
    }

    return value;
  });
}

function createIdSet(values) {
  return new Set(normalizeIdList(values));
}

function normalizeRegionCollection(regions, regionIdBinding = 'regionId') {
  const map = new Map();

  if (!regions) {
    return map;
  }

  if (!Array.isArray(regions) && typeof regions === 'object') {
    Object.entries(regions).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        map.set(String(key), { ...value });
      }
    });
    return map;
  }

  (regions ?? []).forEach((region, index) => {
    if (!region || typeof region !== 'object') {
      return;
    }

    const id = region.regionId ?? region.id ?? region[regionIdBinding] ?? `region-${index}`;
    map.set(String(id), { ...region });
  });

  return map;
}

function getValueByPath(source, path) {
  if (!source || typeof source !== 'object' || !path) {
    return undefined;
  }

  return String(path).split('.').reduce((value, key) => {
    if (value == null || typeof value !== 'object') {
      return undefined;
    }
    return value[key];
  }, source);
}

function resolveContextValue(key, context = {}) {
  if (!key) {
    return undefined;
  }

  if (String(key).includes('.')) {
    return getValueByPath(context, key);
  }

  const candidates = [
    context.properties,
    context.data,
    context.region,
    context.layer,
    context.source,
    context.feature,
    context.marker,
    context.line,
    context
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && Object.prototype.hasOwnProperty.call(candidate, key)) {
      return candidate[key];
    }
  }

  return undefined;
}

function resolveBindingValue(binding, context = {}) {
  if (binding == null) {
    return undefined;
  }

  if (typeof binding === 'function') {
    return binding(context);
  }

  if (typeof binding === 'string') {
    return resolveContextValue(binding, context);
  }

  return binding;
}

function isSimpleContextLookupKey(value) {
  return /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(String(value).trim());
}

function resolveTooltipBinding(binding, context = {}) {
  if (binding == null) {
    return null;
  }

  if (typeof binding === 'function') {
    return binding(context);
  }

  if (typeof binding === 'string') {
    if (binding.includes('{')) {
      return renderTooltipTemplate(binding, context);
    }

    const normalized = String(binding).trim();
    if (isSimpleContextLookupKey(normalized)) {
      const value = resolveContextValue(normalized, context);
      return value == null ? '' : String(value);
    }

    return String(binding);
  }

  return String(binding);
}

function createLayerBindingContext({
  layer = null,
  source = null,
  feature = null,
  marker = null,
  line = null
} = {}) {
  return {
    layer,
    source,
    feature,
    marker,
    line,
    region: feature?.region ?? marker?.region ?? line?.region ?? null,
    properties: feature?.properties ?? marker?.properties ?? line?.properties ?? {},
    data: feature?.data ?? marker?.data ?? line?.data
  };
}

function pickStyleValue(binding, context, fallback) {
  const value = resolveBindingValue(binding, context);
  if (value === undefined || value === '') {
    return fallback;
  }
  return value;
}

function resolveBoundFeatureStyle(bindings = {}, context = {}, hovered = false) {
  const prefix = hovered ? 'hover' : '';
  const nextStyle = {};

  const fill = pickStyleValue(bindings[`${prefix}Fill`], context, undefined);
  const stroke = pickStyleValue(bindings[`${prefix}Stroke`], context, undefined);
  const strokeWidth = pickStyleValue(bindings[`${prefix}StrokeWidth`], context, undefined);
  const opacity = pickStyleValue(bindings[`${prefix}Opacity`], context, undefined);
  const lineDash = pickStyleValue(bindings[`${prefix}LineDash`], context, undefined);
  const radius = pickStyleValue(bindings[`${prefix}Radius`], context, undefined);
  const cursor = pickStyleValue(bindings[`${prefix}Cursor`], context, undefined);

  if (fill !== undefined) {
    nextStyle.fill = fill;
  }
  if (stroke !== undefined) {
    nextStyle.stroke = stroke;
  }
  if (strokeWidth !== undefined) {
    nextStyle.strokeWidth = strokeWidth;
  }
  if (opacity !== undefined) {
    nextStyle.opacity = opacity;
  }
  if (lineDash !== undefined) {
    nextStyle.lineDash = lineDash;
  }
  if (radius !== undefined) {
    nextStyle.radius = radius;
  }
  if (cursor !== undefined) {
    nextStyle.cursor = cursor;
  }

  return nextStyle;
}

function resolveRegionPresentationStyle(feature) {
  if (!feature || feature.kind !== 'polygon') {
    return null;
  }

  const regionStyle = feature.layerRegionDefaults ?? feature.layerRegionStyle ?? {};
  const empty = !feature.region;
  const nextStyle = (regionStyle.emptyStyle || regionStyle.joinedStyle)
    ? { ...(empty ? regionStyle.emptyStyle : regionStyle.joinedStyle) }
    : {};
  const prefix = empty ? 'empty' : 'default';
  if (regionStyle[`${prefix}Fill`] != null) {
    nextStyle.fill = regionStyle[`${prefix}Fill`];
  }
  if (regionStyle[`${prefix}Stroke`] != null) {
    nextStyle.stroke = regionStyle[`${prefix}Stroke`];
  }
  if (regionStyle[`${prefix}StrokeWidth`] != null) {
    nextStyle.strokeWidth = regionStyle[`${prefix}StrokeWidth`];
  }
  if (regionStyle[`${prefix}Opacity`] != null) {
    nextStyle.opacity = regionStyle[`${prefix}Opacity`];
  }
  const interactive = empty
    ? (regionStyle.emptyInteractive ?? regionStyle.emptyInteractive)
    : (regionStyle.joinedInteractive ?? regionStyle.interactive);
  if (interactive === false) {
    nextStyle.cursor = 'default';
  }

  return nextStyle;
}

function isFeatureInteractive(feature) {
  if (!feature || feature.kind !== 'polygon') {
    return true;
  }

  const regionStyle = feature.layerRegionDefaults ?? feature.layerRegionStyle ?? {};
  if (feature.region) {
    return (regionStyle.joinedInteractive ?? regionStyle.interactive) !== false;
  }

  return regionStyle.emptyInteractive !== false;
}

function flattenProjectedPoints(value, sink = []) {
  if (!Array.isArray(value)) {
    return sink;
  }

  if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
    sink.push(value);
    return sink;
  }

  value.forEach((item) => flattenProjectedPoints(item, sink));
  return sink;
}

function computeProjectedCoordinateBounds(projectedCoordinates) {
  const points = flattenProjectedPoints(projectedCoordinates, []);
  return computeBounds([
    {
      kind: 'line',
      coordinates: points
    }
  ]);
}

function collectProjectedBounds(entries = []) {
  return computeBounds(
    entries.map((entry) => ({
      kind: 'line',
      coordinates: flattenProjectedPoints(entry.projectedCoordinates, [])
    }))
  );
}

function computeLabelText(feature, labels = {}) {
  if (!labels || labels.enabled !== true) {
    return '';
  }

  if (labels.source === 'layer-regions' && !feature?.region) {
    return '';
  }

  const context = feature?.bindingContext ?? createLayerBindingContext({ feature });
  const candidates = [];
  if (labels.field != null) {
    candidates.push(labels.field);
  }
  candidates.push(...(labels.fallbackFields ?? []));

  for (const candidate of candidates) {
    const value = resolveBindingValue(candidate, context);
    if (value != null && String(value).trim()) {
      return String(value);
    }
  }

  return '';
}

function computeMarkerLabelText(marker, labels = {}) {
  if (!labels || labels.enabled !== true) {
    return '';
  }

  const context = marker?.bindingContext ?? createLayerBindingContext({ marker });
  const candidates = [];
  if (labels.field != null) {
    candidates.push(labels.field);
  }
  candidates.push(...(labels.fallbackFields ?? []));

  for (const candidate of candidates) {
    const value = resolveBindingValue(candidate, context);
    if (value != null && String(value).trim()) {
      return String(value);
    }
  }

  return '';
}

function computeLabelAnchor(entries = []) {
  if (!entries.length) {
    return null;
  }

  const bounds = collectProjectedBounds(entries);
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2
  };
}

function resolveRegionLabelJoinId(entry) {
  if (entry?.filterId == null) {
    return null;
  }

  const value = String(entry.filterId).trim();
  return value ? value : null;
}

function resolveRegionLabelPosition(entry, labels = {}) {
  const joinId = resolveRegionLabelJoinId(entry);
  if (joinId) {
    const position = labels?.positions?.[joinId];
    if (position && typeof position === 'object') {
      const lon = Number(position.lon);
      const lat = Number(position.lat);
      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        return { lon, lat };
      }
    }
  }

  return normalizeLonLatPoint(entry?.geocanvas?.regionLabel?.position);
}

function computeMarkerLabelAnchor(point, marker, style = {}, labels = {}) {
  if (!point) {
    return null;
  }

  const imageLayout = marker?.type === 'image' ? resolveImageMarkerLayout(marker, style) : null;
  const extents = imageLayout
    ? {
      left: imageLayout.anchorX,
      right: imageLayout.width - imageLayout.anchorX,
      top: imageLayout.anchorY,
      bottom: imageLayout.height - imageLayout.anchorY
    }
    : {
      left: Number(style.radius ?? DEFAULT_MARKER_STYLE.radius),
      right: Number(style.radius ?? DEFAULT_MARKER_STYLE.radius),
      top: Number(style.radius ?? DEFAULT_MARKER_STYLE.radius),
      bottom: Number(style.radius ?? DEFAULT_MARKER_STYLE.radius)
    };

  const x = Number(point.x) + Number(labels.offsetX ?? 0);
  const y = Number(point.y) + Number(labels.offsetY ?? 0);
  const distance = Number(labels.distance ?? 0);

  switch (labels.position) {
    case 'center':
      return { x, y };
    case 'right':
      return { x: x + extents.right + distance, y };
    case 'bottom':
      return { x, y: y + extents.bottom + distance };
    case 'left':
      return { x: x - extents.left - distance, y };
    case 'top-right':
      return { x: x + extents.right + distance, y: y - extents.top - distance };
    case 'top-left':
      return { x: x - extents.left - distance, y: y - extents.top - distance };
    case 'bottom-right':
      return { x: x + extents.right + distance, y: y + extents.bottom + distance };
    case 'bottom-left':
      return { x: x - extents.left - distance, y: y + extents.bottom + distance };
    case 'top':
    default:
      return { x, y: y - extents.top - distance };
  }
}

function filterFeatureEntries(entries, includePolygonIds, excludePolygonIds) {
  const includeIds = includePolygonIds instanceof Set ? includePolygonIds : createIdSet(includePolygonIds);
  const excludeIds = excludePolygonIds instanceof Set ? excludePolygonIds : createIdSet(excludePolygonIds);

  return entries.filter((entry) => {
    if (entry.kind !== 'polygon') {
      return true;
    }

    const id = entry.filterId == null ? null : String(entry.filterId);
    if (includeIds.size > 0 && (!id || !includeIds.has(id))) {
      return false;
    }
    if (excludeIds.size > 0 && id && excludeIds.has(id)) {
      return false;
    }
    return true;
  });
}

function applyCameraTransform(point, anchor, viewportCenter, zoom) {
  return {
    x: viewportCenter.x + (point.x - anchor.x) * zoom,
    y: viewportCenter.y + (point.y - anchor.y) * zoom
  };
}

function invertCameraTransform(point, anchor, viewportCenter, zoom) {
  return {
    x: anchor.x + (point.x - viewportCenter.x) / zoom,
    y: anchor.y + (point.y - viewportCenter.y) / zoom
  };
}

function clampCameraAxis(anchorValue, minValue, maxValue, viewportSize, zoom) {
  const safeZoom = Math.max(Number(zoom) || 0, 1e-9);
  const minAnchor = minValue + viewportSize / (2 * safeZoom);
  const maxAnchor = maxValue - viewportSize / (2 * safeZoom);

  if (minAnchor > maxAnchor) {
    return (minValue + maxValue) / 2;
  }

  return clamp(anchorValue, minAnchor, maxAnchor);
}

function clampCameraAnchor(anchor, bounds, viewport, zoom) {
  return {
    x: clampCameraAxis(anchor.x, bounds.minX, bounds.maxX, viewport.width, zoom),
    y: clampCameraAxis(anchor.y, bounds.minY, bounds.maxY, viewport.height, zoom)
  };
}

function computeScreenDistance(a, b) {
  return Math.hypot((b.x ?? 0) - (a.x ?? 0), (b.y ?? 0) - (a.y ?? 0));
}

function computeScreenMidpoint(a, b) {
  return {
    x: ((a.x ?? 0) + (b.x ?? 0)) / 2,
    y: ((a.y ?? 0) + (b.y ?? 0)) / 2
  };
}

function normalizeControlsPosition(value) {
  return ['top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center'].includes(value)
    ? value
    : DEFAULT_CONTROLS_POSITION;
}

function normalizeProjectionName(value) {
  const name = String(value ?? DEFAULT_PROJECTION).trim().toLowerCase();
  if (name === 'albersusa') {
    return 'albers-usa';
  }
  if (name === 'geo-albers-usa-territories') {
    return 'albers-usa-territories';
  }
  if (name === 'portugalcomposite' || name === 'conic-conformal-portugal') {
    return 'portugal-composite';
  }
  if (name === 'spaincomposite' || name === 'conic-conformal-spain') {
    return 'spain-composite';
  }
  if (name === 'francecomposite' || name === 'conic-conformal-france') {
    return 'france-composite';
  }
  return ['fit', 'mercator', 'albers', 'albers-usa', 'albers-usa-territories', 'portugal-composite', 'spain-composite', 'france-composite', 'equal-earth', 'miller', 'natural-earth-1', 'globe'].includes(name)
    ? name
    : DEFAULT_PROJECTION;
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function interpolateView(from, to, progress) {
  return {
    zoom: from.zoom + (to.zoom - from.zoom) * progress,
    center: {
      lon: from.center.lon + (to.center.lon - from.center.lon) * progress,
      lat: from.center.lat + (to.center.lat - from.center.lat) * progress
    }
  };
}

function normalizeVector3(vector) {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  if (length <= 1e-12) {
    return null;
  }
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

function dotVector3(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function crossVector3(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function geoPointToUnitVector(point) {
  const lon = wrapLongitude(point?.lon ?? 0) * RAD;
  const lat = clamp(point?.lat ?? 0, -89.999, 89.999) * RAD;
  const cosLat = Math.cos(lat);
  return {
    x: cosLat * Math.cos(lon),
    y: cosLat * Math.sin(lon),
    z: Math.sin(lat)
  };
}

function unitVectorToGeoPoint(vector) {
  const normalized = normalizeVector3(vector);
  if (!normalized) {
    return { lon: 0, lat: 0 };
  }
  return {
    lon: wrapLongitude(Math.atan2(normalized.y, normalized.x) * DEG),
    lat: clamp(Math.asin(clamp(normalized.z, -1, 1)) * DEG, -89.999, 89.999)
  };
}

function rotateVectorAroundAxis(vector, axis, angle) {
  const normalizedAxis = normalizeVector3(axis);
  if (!normalizedAxis) {
    return vector;
  }
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  const dot = dotVector3(normalizedAxis, vector);
  const cross = crossVector3(normalizedAxis, vector);
  return {
    x: vector.x * cosAngle + cross.x * sinAngle + normalizedAxis.x * dot * (1 - cosAngle),
    y: vector.y * cosAngle + cross.y * sinAngle + normalizedAxis.y * dot * (1 - cosAngle),
    z: vector.z * cosAngle + cross.z * sinAngle + normalizedAxis.z * dot * (1 - cosAngle)
  };
}

function interpolateGlobeCenter(fromCenter, toCenter, progress) {
  const fromVector = geoPointToUnitVector(fromCenter);
  const toVector = geoPointToUnitVector(toCenter);
  const cosine = clamp(dotVector3(fromVector, toVector), -1, 1);

  if (cosine > 0.999999) {
    return unitVectorToGeoPoint({
      x: interpolateNumber(fromVector.x, toVector.x, progress),
      y: interpolateNumber(fromVector.y, toVector.y, progress),
      z: interpolateNumber(fromVector.z, toVector.z, progress)
    });
  }

  if (cosine < -0.999999) {
    const fallbackAxis = Math.abs(fromVector.z) < 0.9
      ? crossVector3(fromVector, { x: 0, y: 0, z: 1 })
      : crossVector3(fromVector, { x: 0, y: 1, z: 0 });
    return unitVectorToGeoPoint(rotateVectorAroundAxis(fromVector, fallbackAxis, Math.PI * progress));
  }

  const angle = Math.acos(cosine);
  const sinAngle = Math.sin(angle);
  const fromScale = Math.sin((1 - progress) * angle) / sinAngle;
  const toScale = Math.sin(progress * angle) / sinAngle;
  return unitVectorToGeoPoint({
    x: fromVector.x * fromScale + toVector.x * toScale,
    y: fromVector.y * fromScale + toVector.y * toScale,
    z: fromVector.z * fromScale + toVector.z * toScale
  });
}

function interpolateAnchor(fromAnchor, toAnchor, progress) {
  return {
    x: interpolateNumber(fromAnchor.x, toAnchor.x, progress),
    y: interpolateNumber(fromAnchor.y, toAnchor.y, progress)
  };
}

function getCameraTranslation(anchor, viewportCenter, zoom) {
  return {
    x: viewportCenter.x - anchor.x * zoom,
    y: viewportCenter.y - anchor.y * zoom
  };
}

function interpolateCameraTransform(fromTransform, toTransform, progress) {
  return {
    zoom: interpolateNumber(fromTransform.zoom, toTransform.zoom, progress),
    translation: {
      x: interpolateNumber(fromTransform.translation.x, toTransform.translation.x, progress),
      y: interpolateNumber(fromTransform.translation.y, toTransform.translation.y, progress)
    }
  };
}

function interpolateAnimatedView(state, progress, projection, baseTransform, viewportCenter = null) {
  const interpolated = interpolateView(state.from, state.to, progress);
  if (isGlobeProjection(projection)) {
    return {
      zoom: interpolated.zoom,
      center: interpolateGlobeCenter(state.from.center, state.to.center, progress)
    };
  }
  if (!state?.fromAnchor || !state?.toAnchor || !projection || !baseTransform || !viewportCenter) {
    return interpolated;
  }

  const fromTransform = {
    zoom: state.from.zoom,
    translation: getCameraTranslation(state.fromAnchor, viewportCenter, state.from.zoom)
  };
  const toTransform = {
    zoom: state.to.zoom,
    translation: getCameraTranslation(state.toAnchor, viewportCenter, state.to.zoom)
  };
  const transform = interpolateCameraTransform(fromTransform, toTransform, progress);
  const anchor = {
    x: (viewportCenter.x - transform.translation.x) / Math.max(transform.zoom, 1e-9),
    y: (viewportCenter.y - transform.translation.y) / Math.max(transform.zoom, 1e-9)
  };
  const projectedCenter = baseTransform.unproject(anchor.x, anchor.y);

  return {
    zoom: transform.zoom,
    center: invertProjection(projection, projectedCenter.lon, projectedCenter.lat, interpolated.center)
  };
}

function projectCoordinateArray(value, projector) {
  if (!Array.isArray(value)) {
    return value;
  }

  if (value.length >= 2 && typeof value[0] === 'number') {
    const projected = projector.forward(value[0], value[1]);
    return [projected.x, projected.y];
  }

  return value.map((item) => projectCoordinateArray(item, projector));
}

function projectFeatureEntries(entries, projector, antimeridianOptions = {}) {
  return entries.map((entry) => ({
    ...entry,
    projectedCoordinates: projectCoordinateArray(
      normalizeCoordinatesForAntimeridian(entry.kind, entry.coordinates, antimeridianOptions),
      projector
    )
  }));
}

function isGlobeProjection(projection) {
  return projection?.name === 'globe';
}

function hasProjectedGeometry(projectedCoordinates) {
  return flattenProjectedPoints(projectedCoordinates, []).length > 0;
}

function interpolateGeoPoint(fromPoint, toPoint, progress) {
  const fromLon = wrapLongitude(fromPoint[0]);
  const toLon = wrapLongitude(toPoint[0]);
  let deltaLon = toLon - fromLon;
  if (deltaLon > 180) {
    deltaLon -= 360;
  } else if (deltaLon < -180) {
    deltaLon += 360;
  }

  return [
    wrapLongitude(fromLon + deltaLon * progress),
    fromPoint[1] + (toPoint[1] - fromPoint[1]) * progress
  ];
}

function interpolateGeodesicPoint(fromPoint, toPoint, progress) {
  const from = geoPointToUnitVector({ lon: fromPoint[0], lat: fromPoint[1] });
  const to = geoPointToUnitVector({ lon: toPoint[0], lat: toPoint[1] });
  const dot = clamp((from.x * to.x) + (from.y * to.y) + (from.z * to.z), -1, 1);
  const angle = Math.acos(dot);
  const sinAngle = Math.sin(angle);

  if (angle < 1e-7 || Math.abs(sinAngle) < 1e-7 || Math.abs(Math.PI - angle) < 1e-5) {
    return interpolateGeoPoint(fromPoint, toPoint, progress);
  }

  const scaleFrom = Math.sin((1 - progress) * angle) / sinAngle;
  const scaleTo = Math.sin(progress * angle) / sinAngle;
  const geoPoint = unitVectorToGeoPoint({
    x: (from.x * scaleFrom) + (to.x * scaleTo),
    y: (from.y * scaleFrom) + (to.y * scaleTo),
    z: (from.z * scaleFrom) + (to.z * scaleTo)
  });
  return [geoPoint.lon, geoPoint.lat];
}

function resolveLinePathInterpolator(pathMode = 'polyline') {
  return pathMode === 'geodesic' ? interpolateGeodesicPoint : interpolateGeoPoint;
}

function densifyGlobeSegment(fromPoint, toPoint, pathMode = 'polyline') {
  if (pathMode !== 'geodesic') {
    return [fromPoint, toPoint];
  }

  const from = geoPointToUnitVector({ lon: fromPoint[0], lat: fromPoint[1] });
  const to = geoPointToUnitVector({ lon: toPoint[0], lat: toPoint[1] });
  const dot = clamp((from.x * to.x) + (from.y * to.y) + (from.z * to.z), -1, 1);
  const angle = Math.acos(dot);
  if (!Number.isFinite(angle) || angle < 1e-7) {
    return [fromPoint, toPoint];
  }

  const maxStep = Math.PI / 48;
  const steps = Math.max(1, Math.min(128, Math.ceil(angle / maxStep)));
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    points.push(interpolateGeodesicPoint(fromPoint, toPoint, index / steps));
  }
  return points;
}

function expandGlobePathCoordinates(coordinates, pathMode = 'polyline') {
  const points = Array.isArray(coordinates) ? coordinates : [];
  if (points.length < 2 || pathMode !== 'geodesic') {
    return points;
  }

  const expanded = [points[0]];
  for (let index = 1; index < points.length; index += 1) {
    expanded.push(...densifyGlobeSegment(points[index - 1], points[index], pathMode).slice(1));
  }
  return expanded;
}

function findGlobeHorizonIntersection(fromPoint, toPoint, center, interpolator = interpolateGeoPoint) {
  let start = fromPoint;
  let end = toPoint;
  let startVisibility = orthographicVisibility(start[0], start[1], center);
  let endVisibility = orthographicVisibility(end[0], end[1], center);

  for (let index = 0; index < 24; index += 1) {
    const midpoint = interpolator(start, end, 0.5);
    const midVisibility = orthographicVisibility(midpoint[0], midpoint[1], center);
    if ((midVisibility >= 0) === (startVisibility >= 0)) {
      start = midpoint;
      startVisibility = midVisibility;
    } else {
      end = midpoint;
      endVisibility = midVisibility;
    }
  }

  return orthographicForward(end[0], end[1], center);
}

function projectGlobeLineCoordinates(coordinates, center, { pathMode = 'polyline' } = {}) {
  const interpolator = resolveLinePathInterpolator(pathMode);
  const expandedCoordinates = expandGlobePathCoordinates(coordinates, pathMode);
  const segments = [];
  let currentSegment = [];

  for (let index = 0; index < expandedCoordinates.length; index += 1) {
    const point = expandedCoordinates[index];
    const projected = orthographicForward(point[0], point[1], center);

    if (index === 0) {
      if (projected.visible) {
        currentSegment.push([projected.x, projected.y]);
      }
      continue;
    }

    const previous = expandedCoordinates[index - 1];
    const previousProjected = orthographicForward(previous[0], previous[1], center);

    if (previousProjected.visible && projected.visible) {
      if (currentSegment.length === 0) {
        currentSegment.push([previousProjected.x, previousProjected.y]);
      }
      currentSegment.push([projected.x, projected.y]);
      continue;
    }

    if (previousProjected.visible && !projected.visible) {
      const intersection = findGlobeHorizonIntersection(previous, point, center, interpolator);
      if (currentSegment.length === 0) {
        currentSegment.push([previousProjected.x, previousProjected.y]);
      }
      currentSegment.push([intersection.x, intersection.y]);
      if (currentSegment.length > 1) {
        segments.push(currentSegment);
      }
      currentSegment = [];
      continue;
    }

    if (!previousProjected.visible && projected.visible) {
      const intersection = findGlobeHorizonIntersection(previous, point, center, interpolator);
      currentSegment = [[intersection.x, intersection.y], [projected.x, projected.y]];
    }
  }

  if (currentSegment.length > 1) {
    segments.push(currentSegment);
  }

  return segments;
}

function normalizeAngleDelta(delta) {
  let nextDelta = delta;
  while (nextDelta <= -Math.PI) {
    nextDelta += Math.PI * 2;
  }
  while (nextDelta > Math.PI) {
    nextDelta -= Math.PI * 2;
  }
  return nextDelta;
}

function isGlobeHorizonPoint(point, epsilon = 1e-4) {
  if (!Array.isArray(point) || point.length < 2) {
    return false;
  }
  return Math.abs(Math.hypot(point[0], point[1]) - 1) <= epsilon;
}

function appendGlobeHorizonArc(ring, fromPoint, toPoint, maxStep = Math.PI / 48) {
  if (!isGlobeHorizonPoint(fromPoint) || !isGlobeHorizonPoint(toPoint)) {
    return;
  }

  const startAngle = Math.atan2(fromPoint[1], fromPoint[0]);
  const endAngle = Math.atan2(toPoint[1], toPoint[0]);
  const delta = normalizeAngleDelta(endAngle - startAngle);
  const steps = Math.ceil(Math.abs(delta) / Math.max(maxStep, 1e-6));

  for (let index = 1; index < steps; index += 1) {
    const angle = startAngle + (delta * index) / steps;
    ring.push([Math.cos(angle), Math.sin(angle)]);
  }
}

function projectGlobePolygonRing(ring, center) {
  if (!Array.isArray(ring) || ring.length < 3) {
    return [];
  }

  const openRing = ring.length > 1
    && ring[0][0] === ring[ring.length - 1][0]
    && ring[0][1] === ring[ring.length - 1][1]
    ? ring.slice(0, -1)
    : ring.slice();
  if (openRing.length < 3) {
    return [];
  }

  const output = [];
  let previous = openRing[openRing.length - 1];
  let previousProjected = orthographicForward(previous[0], previous[1], center);

  openRing.forEach((point) => {
    const projected = orthographicForward(point[0], point[1], center);

    if (projected.visible) {
      if (!previousProjected.visible) {
        const intersection = findGlobeHorizonIntersection(previous, point, center);
        output.push([intersection.x, intersection.y]);
      }
      output.push([projected.x, projected.y]);
    } else if (previousProjected.visible) {
      const intersection = findGlobeHorizonIntersection(previous, point, center);
      output.push([intersection.x, intersection.y]);
    }

    previous = point;
    previousProjected = projected;
  });

  if (output.length < 3) {
    return [];
  }

  const first = output[0];
  const last = output[output.length - 1];
  if (Math.abs(first[0] - last[0]) > 1e-9 || Math.abs(first[1] - last[1]) > 1e-9) {
    appendGlobeHorizonArc(output, last, first);
  }
  if (Math.abs(first[0] - last[0]) > 1e-9 || Math.abs(first[1] - last[1]) > 1e-9) {
    output.push([...first]);
  }

  return output;
}

function naturalEarth1Forward(lon, lat) {
  const lambda = lon * RAD;
  const phi = clamp(lat, -89.999, 89.999) * RAD;
  const phi2 = phi * phi;
  const phi4 = phi2 * phi2;
  const phi6 = phi4 * phi2;
  const phi8 = phi4 * phi4;
  const phi10 = phi8 * phi2;
  return {
    x: lambda * (0.8707 - 0.131979 * phi2 - 0.013791 * phi4 + 0.003971 * phi6 - 0.001529 * phi8),
    y: phi * (1.007226 + 0.015085 * phi2 - 0.044475 * phi4 + 0.028874 * phi6 - 0.005916 * phi8 + 0.000448 * phi10)
  };
}

function orthographicVisibility(lon, lat, center = { lon: 0, lat: 0 }) {
  const lambda = wrapLongitude(lon) * RAD;
  const phi = clamp(lat, -89.999, 89.999) * RAD;
  const lambda0 = wrapLongitude(center.lon) * RAD;
  const phi0 = clamp(center.lat, -89.999, 89.999) * RAD;
  return Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0);
}

function orthographicForward(lon, lat, center = { lon: 0, lat: 0 }) {
  const lambda = wrapLongitude(lon) * RAD;
  const phi = clamp(lat, -89.999, 89.999) * RAD;
  const lambda0 = wrapLongitude(center.lon) * RAD;
  const phi0 = clamp(center.lat, -89.999, 89.999) * RAD;
  const cosc = orthographicVisibility(lon, lat, center);
  const x = Math.cos(phi) * Math.sin(lambda - lambda0);
  const y = Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0);
  return {
    x,
    y,
    visible: cosc >= -1e-9
  };
}

function orthographicInverse(x, y, center = { lon: 0, lat: 0 }) {
  const rho = Math.hypot(x, y);
  if (rho > 1 + 1e-9) {
    return null;
  }

  const phi0 = clamp(center.lat, -89.999, 89.999) * RAD;
  const lambda0 = wrapLongitude(center.lon) * RAD;
  if (rho <= 1e-12) {
    return { lon: wrapLongitude(center.lon), lat: clamp(center.lat, -89.999, 89.999) };
  }

  const c = Math.asin(clamp(rho, 0, 1));
  const sinC = Math.sin(c);
  const cosC = Math.cos(c);
  const lat = Math.asin(cosC * Math.sin(phi0) + (y * sinC * Math.cos(phi0)) / rho) * DEG;
  const lon = lambda0 + Math.atan2(
    x * sinC,
    rho * Math.cos(phi0) * cosC - y * Math.sin(phi0) * sinC
  );

  return {
    lon: wrapLongitude(lon * DEG),
    lat: clamp(lat, -89.999, 89.999)
  };
}

function equalEarthForward(lon, lat) {
  const A1 = 1.340264;
  const A2 = -0.081106;
  const A3 = 0.000893;
  const A4 = 0.003796;
  const M = Math.sqrt(3) / 2;

  const lambda = lon * RAD;
  const phi = clamp(lat, -89.999, 89.999) * RAD;
  const theta = Math.asin(M * Math.sin(phi));
  const theta2 = theta * theta;
  const theta6 = theta2 * theta2 * theta2;
  const denominator = 3 * (A1 + 3 * A2 * theta2 + theta6 * (7 * A3 + 9 * A4 * theta2));

  return {
    x: (2 * Math.sqrt(3) * lambda * Math.cos(theta)) / denominator,
    y: A1 * theta + A2 * theta * theta2 + A3 * theta * theta6 + A4 * theta * theta6 * theta2
  };
}

function createConicEqualAreaProjection(name, {
  originLon = 0,
  originLat = 0,
  parallel1 = 20,
  parallel2 = 50
} = {}) {
  const phi0 = originLat * RAD;
  const phi1 = parallel1 * RAD;
  const phi2 = parallel2 * RAD;
  const lambda0 = originLon * RAD;
  const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
  const c = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
  const rho0 = Math.sqrt(Math.max(0, c - 2 * n * Math.sin(phi0))) / n;

  return {
    name,
    forward(lon, lat) {
      const lambda = wrapLongitude(lon - originLon) * RAD;
      const phi = clamp(lat, -89.999, 89.999) * RAD;
      const rho = Math.sqrt(Math.max(0, c - 2 * n * Math.sin(phi))) / n;
      const theta = n * lambda;
      return {
        x: rho * Math.sin(theta),
        y: rho0 - rho * Math.cos(theta)
      };
    },
    inverse(x, y) {
      const rhoSign = n < 0 ? -1 : 1;
      const rho = rhoSign * Math.sqrt(x * x + (rho0 - y) * (rho0 - y));
      const theta = Math.atan2(x, rho0 - y);
      return {
        lon: wrapLongitude(originLon + (theta / n) * DEG),
        lat: Math.asin(clamp((c - (rho * n) * (rho * n)) / (2 * n), -1, 1)) * DEG
      };
    }
  };
}

function createConicConformalProjection(name, {
  originLon = 0,
  originLat = 0,
  parallel1 = 30,
  parallel2 = 60
} = {}) {
  const phi0 = clamp(originLat, -89.999, 89.999) * RAD;
  const phi1 = clamp(parallel1, -89.999, 89.999) * RAD;
  const phi2 = clamp(parallel2, -89.999, 89.999) * RAD;
  const lambda0 = originLon * RAD;
  const t = (phi) => Math.tan(Math.PI / 4 + phi / 2);
  const n = Math.abs(phi1 - phi2) < 1e-12
    ? Math.sin(phi1)
    : Math.log(Math.cos(phi1) / Math.cos(phi2)) / Math.log(t(phi2) / t(phi1));
  const safeN = Math.abs(n) < 1e-12 ? (n < 0 ? -1e-12 : 1e-12) : n;
  const F = (Math.cos(phi1) * Math.pow(t(phi1), safeN)) / safeN;
  const rho0 = F / Math.pow(t(phi0), safeN);

  return {
    name,
    forward(lon, lat) {
      const lambda = wrapLongitude(lon - originLon) * RAD;
      const phi = clamp(lat, -89.999, 89.999) * RAD;
      const rho = F / Math.pow(t(phi), safeN);
      const theta = safeN * lambda;
      return {
        x: rho * Math.sin(theta),
        y: rho0 - rho * Math.cos(theta)
      };
    },
    inverse(x, y) {
      let adjustedX = x;
      let adjustedY = rho0 - y;
      let rho = Math.sqrt(adjustedX * adjustedX + adjustedY * adjustedY);
      if (safeN < 0) {
        rho = -rho;
        adjustedX = -adjustedX;
        adjustedY = -adjustedY;
      }
      const theta = Math.atan2(adjustedX, adjustedY);
      const safeRho = Math.abs(rho) <= 1e-12
        ? (rho < 0 ? -1e-12 : 1e-12)
        : rho;
      const phi = 2 * Math.atan(Math.pow(F / safeRho, 1 / safeN)) - Math.PI / 2;
      return {
        lon: wrapLongitude(originLon + (theta / safeN) * DEG),
        lat: clamp(phi * DEG, -89.999, 89.999)
      };
    }
  };
}

function computeProjectedGeoBoundsFromGeoBounds(projection, geoBounds, stepsLon = 12, stepsLat = 8) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let latStep = 0; latStep <= stepsLat; latStep += 1) {
    const lat = geoBounds.minLat + ((geoBounds.maxLat - geoBounds.minLat) * latStep) / Math.max(stepsLat, 1);
    for (let lonStep = 0; lonStep <= stepsLon; lonStep += 1) {
      const lon = geoBounds.minLon + ((geoBounds.maxLon - geoBounds.minLon) * lonStep) / Math.max(stepsLon, 1);
      const point = projection.forward(lon, lat);
      if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
        continue;
      }
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }

  if (!isFiniteNumber(minX) || !isFiniteNumber(minY) || !isFiniteNumber(maxX) || !isFiniteNumber(maxY)) {
    return { minX: -1, minY: -1, maxX: 1, maxY: 1 };
  }
  return { minX, minY, maxX, maxY };
}

function createRectMapper(rawBounds, targetRect) {
  const rawWidth = Math.max(1e-9, rawBounds.maxX - rawBounds.minX);
  const rawHeight = Math.max(1e-9, rawBounds.maxY - rawBounds.minY);
  const targetWidth = Math.max(1e-9, targetRect.maxX - targetRect.minX);
  const targetHeight = Math.max(1e-9, targetRect.maxY - targetRect.minY);
  const scale = Math.min(targetWidth / rawWidth, targetHeight / rawHeight);
  const usedWidth = rawWidth * scale;
  const usedHeight = rawHeight * scale;
  const offsetX = targetRect.minX + (targetWidth - usedWidth) / 2;
  const offsetY = targetRect.minY + (targetHeight - usedHeight) / 2;

  return {
    contains(x, y, padding = 0) {
      return x >= offsetX - padding
        && x <= offsetX + usedWidth + padding
        && y >= offsetY - padding
        && y <= offsetY + usedHeight + padding;
    },
    forward(point) {
      return {
        x: offsetX + (point.x - rawBounds.minX) * scale,
        y: offsetY + (point.y - rawBounds.minY) * scale
      };
    },
    inverse(point) {
      return {
        x: rawBounds.minX + (point.x - offsetX) / scale,
        y: rawBounds.minY + (point.y - offsetY) / scale
      };
    }
  };
}

function computeProjectedBoundsFromPoints(points = []) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach((point) => {
    const x = Number(point?.x);
    const y = Number(point?.y);
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) {
      return;
    }
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  if (!isFiniteNumber(minX) || !isFiniteNumber(minY) || !isFiniteNumber(maxX) || !isFiniteNumber(maxY)) {
    return null;
  }

  if (Math.abs(maxX - minX) < 1e-9) {
    minX -= 0.5;
    maxX += 0.5;
  }

  if (Math.abs(maxY - minY) < 1e-9) {
    minY -= 0.5;
    maxY += 0.5;
  }

  return { minX, minY, maxX, maxY };
}

function computeCompositeComponentRawBounds(entries = [], component) {
  if (!component?.projection || typeof component.contains !== 'function') {
    return null;
  }

  const rawPoints = [];
  (entries ?? []).forEach((entry) => {
    flattenProjectedPoints(entry?.coordinates, []).forEach((coordinate) => {
      const lon = wrapLongitude(coordinate?.[0]);
      const lat = Number(coordinate?.[1]);
      if (!isFiniteNumber(lon) || !isFiniteNumber(lat) || !component.contains(lon, lat)) {
        return;
      }
      const point = component.projection.forward(lon, lat);
      if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
        return;
      }
      rawPoints.push(point);
    });
  });

  return computeProjectedBoundsFromPoints(rawPoints);
}

function createCompositeProjection(name, components = []) {
  const normalizedComponents = components.map((component) => {
    const rawBounds = computeProjectedGeoBoundsFromGeoBounds(component.projection, component.geoBounds);
    return {
      ...component,
      defaultRawBounds: rawBounds,
      rawBounds,
      mapper: createRectMapper(rawBounds, component.targetRect)
    };
  });

  const fitEntries = (entries = []) => {
    normalizedComponents.forEach((component) => {
      const rawBounds = computeCompositeComponentRawBounds(entries, component) ?? component.defaultRawBounds;
      component.rawBounds = rawBounds;
      component.mapper = createRectMapper(rawBounds, component.targetRect);
    });
  };

  const selectComponent = (lon, lat) => {
    const wrappedLon = wrapLongitude(lon);
    return normalizedComponents.find((component) => component.contains(wrappedLon, lat))
      ?? normalizedComponents[0];
  };

  return {
    name,
    fitEntries(entries = []) {
      fitEntries(entries);
      return this;
    },
    resetLayout() {
      fitEntries([]);
      return this;
    },
    forward(lon, lat) {
      const component = selectComponent(lon, lat);
      const rawPoint = component.projection.forward(wrapLongitude(lon), lat);
      return component.mapper.forward(rawPoint);
    },
    inverse(x, y) {
      const candidates = normalizedComponents.filter((component) => component.mapper.contains(x, y, 0.04));
      const queue = candidates.length ? candidates : normalizedComponents;
      let best = null;

      queue.forEach((component) => {
        const rawPoint = component.mapper.inverse({ x, y });
        const geoPoint = component.projection.inverse(rawPoint.x, rawPoint.y);
        if (!geoPoint || !Number.isFinite(geoPoint.lon) || !Number.isFinite(geoPoint.lat)) {
          return;
        }
        const lon = wrapLongitude(geoPoint.lon);
        const projected = component.mapper.forward(component.projection.forward(lon, geoPoint.lat));
        const error = Math.hypot(projected.x - x, projected.y - y);
        const layoutPenalty = component.mapper.contains(x, y, 0.01) ? 0 : 500;
        const score = layoutPenalty + (component.contains(lon, geoPoint.lat) ? 0 : 1000) + error;
        if (!best || score < best.score) {
          best = {
            score,
            lon,
            lat: geoPoint.lat
          };
        }
      });

      return best
        ? { lon: best.lon, lat: best.lat }
        : { lon: Number(x), lat: Number(y) };
    }
  };
}

function createUsaCompositeProjection(name, includeTerritories = false) {
  const components = [
    {
      key: 'lower48',
      geoBounds: { minLon: -125, maxLon: -66, minLat: 24, maxLat: 50 },
      targetRect: { minX: 0.02, maxX: 1.34, minY: 0.0, maxY: 0.80 },
      projection: createConicEqualAreaProjection('albers-usa-lower48', {
        originLon: -96,
        originLat: 23,
        parallel1: 29.5,
        parallel2: 45.5
      }),
      contains(lon, lat) {
        return lat >= 24 && lat <= 50.5 && lon >= -125 && lon <= -66;
      }
    },
    {
      key: 'alaska',
      geoBounds: { minLon: -180, maxLon: -129, minLat: 51, maxLat: 72 },
      targetRect: { minX: 0.00, maxX: 0.46, minY: -0.28, maxY: 0.02 },
      projection: createConicEqualAreaProjection('albers-usa-alaska', {
        originLon: -154,
        originLat: 50,
        parallel1: 55,
        parallel2: 65
      }),
      contains(lon, lat) {
        return lat >= 50 && (lon <= -129 || lon >= 170 || lon <= -170);
      }
    },
    {
      key: 'hawaii',
      geoBounds: { minLon: -161, maxLon: -154, minLat: 18, maxLat: 23 },
      targetRect: { minX: 0.50, maxX: 0.72, minY: -0.20, maxY: -0.04 },
      projection: createConicEqualAreaProjection('albers-usa-hawaii', {
        originLon: -157,
        originLat: 13,
        parallel1: 8,
        parallel2: 18
      }),
      contains(lon, lat) {
        return lat >= 18 && lat <= 23 && lon >= -161.5 && lon <= -154;
      }
    },
    {
      key: 'puerto-rico',
      geoBounds: { minLon: -67.5, maxLon: -65.0, minLat: 17.6, maxLat: 18.7 },
      targetRect: { minX: 1.04, maxX: 1.20, minY: -0.18, maxY: -0.08 },
      projection: createConicEqualAreaProjection('albers-usa-puerto-rico', {
        originLon: -66.3,
        originLat: 17.8,
        parallel1: 8,
        parallel2: 18
      }),
      contains(lon, lat) {
        return lat >= 17.5 && lat <= 18.8 && lon >= -67.5 && lon <= -65;
      }
    }
  ];

  if (includeTerritories) {
    components.push(
      {
        key: 'guam-nmi',
        geoBounds: { minLon: 144.0, maxLon: 146.5, minLat: 13.0, maxLat: 21.5 },
        targetRect: { minX: 0.78, maxX: 0.95, minY: -0.20, maxY: -0.07 },
        projection: createConicEqualAreaProjection('albers-usa-guam-nmi', {
          originLon: 145.2,
          originLat: 16.5,
          parallel1: 8,
          parallel2: 18
        }),
        contains(lon, lat) {
          return lat >= 13 && lat <= 21.8 && lon >= 143 && lon <= 147;
        }
      },
      {
        key: 'american-samoa',
        geoBounds: { minLon: -171.2, maxLon: -168.0, minLat: -15.5, maxLat: -10.5 },
        targetRect: { minX: 0.60, maxX: 0.76, minY: -0.34, maxY: -0.23 },
        projection: createConicEqualAreaProjection('albers-usa-american-samoa', {
          originLon: -170.5,
          originLat: -14,
          parallel1: -18,
          parallel2: -8
        }),
        contains(lon, lat) {
          return lat >= -16 && lat <= -10 && lon >= -171.5 && lon <= -168;
        }
      },
      {
        key: 'us-virgin-islands',
        geoBounds: { minLon: -65.2, maxLon: -64.3, minLat: 17.5, maxLat: 18.6 },
        targetRect: { minX: 1.22, maxX: 1.31, minY: -0.18, maxY: -0.10 },
        projection: createConicEqualAreaProjection('albers-usa-us-virgin-islands', {
          originLon: -64.8,
          originLat: 17.8,
          parallel1: 8,
          parallel2: 18
        }),
        contains(lon, lat) {
          return lat >= 17.4 && lat <= 18.6 && lon >= -65.3 && lon <= -64.2;
        }
      }
    );
  }

  return createCompositeProjection(name, components);
}

function createPortugalCompositeProjection(name) {
  return createCompositeProjection(name, [
    {
      key: 'mainland',
      geoBounds: { minLon: -9.8, maxLon: -6.0, minLat: 36.8, maxLat: 42.3 },
      targetRect: { minX: 0.40, maxX: 0.84, minY: 0.0, maxY: 0.96 },
      projection: createConicConformalProjection('portugal-mainland', {
        originLon: -8.1,
        originLat: 39.5,
        parallel1: 37.5,
        parallel2: 41.5
      }),
      contains(lon, lat) {
        return lat >= 36.5 && lat <= 42.5 && lon >= -10 && lon <= -6;
      }
    },
    {
      key: 'madeira',
      geoBounds: { minLon: -17.6, maxLon: -16.0, minLat: 32.2, maxLat: 33.4 },
      targetRect: { minX: 1.08, maxX: 1.28, minY: 0.68, maxY: 0.86 },
      projection: createConicConformalProjection('portugal-madeira', {
        originLon: -16.9,
        originLat: 32.8,
        parallel1: 31,
        parallel2: 35
      }),
      contains(lon, lat) {
        return lat >= 32.0 && lat <= 33.6 && lon >= -17.8 && lon <= -15.8;
      }
    },
    {
      key: 'azores',
      geoBounds: { minLon: -31.8, maxLon: -24.0, minLat: 36.5, maxLat: 40.2 },
      targetRect: { minX: 0.00, maxX: 0.36, minY: 0.16, maxY: 0.50 },
      projection: createConicConformalProjection('portugal-azores', {
        originLon: -28.0,
        originLat: 38.2,
        parallel1: 35,
        parallel2: 41
      }),
      contains(lon, lat) {
        return lat >= 36.3 && lat <= 40.4 && lon >= -32 && lon <= -23.8;
      }
    }
  ]);
}

function createSpainCompositeProjection(name) {
  return createCompositeProjection(name, [
    {
      key: 'mainland',
      geoBounds: { minLon: -9.8, maxLon: 4.8, minLat: 35.4, maxLat: 44.2 },
      targetRect: { minX: 0.28, maxX: 1.24, minY: 0.0, maxY: 0.66 },
      projection: createConicConformalProjection('spain-mainland', {
        originLon: -3.5,
        originLat: 39.5,
        parallel1: 36,
        parallel2: 43
      }),
      contains(lon, lat) {
        return lat >= 35 && lat <= 44.5 && lon >= -10 && lon <= 5;
      }
    },
    {
      key: 'balearics',
      geoBounds: { minLon: 1.0, maxLon: 4.6, minLat: 38.4, maxLat: 40.3 },
      targetRect: { minX: 1.34, maxX: 1.64, minY: 0.16, maxY: 0.52 },
      projection: createConicConformalProjection('spain-balearics', {
        originLon: 2.8,
        originLat: 39.2,
        parallel1: 37,
        parallel2: 41
      }),
      contains(lon, lat) {
        return lat >= 38.2 && lat <= 40.5 && lon >= 0.8 && lon <= 4.8;
      }
    },
    {
      key: 'canaries',
      geoBounds: { minLon: -18.3, maxLon: -13.0, minLat: 27.4, maxLat: 29.9 },
      targetRect: { minX: 0.00, maxX: 0.70, minY: 0.82, maxY: 1.12 },
      projection: createConicConformalProjection('spain-canaries', {
        originLon: -15.8,
        originLat: 28.5,
        parallel1: 26,
        parallel2: 31
      }),
      contains(lon, lat) {
        return lat >= 27.2 && lat <= 30.1 && lon >= -18.5 && lon <= -12.8;
      }
    }
  ]);
}

function createFranceCompositeProjection(name) {
  return createCompositeProjection(name, [
    {
      key: 'metropolitan',
      geoBounds: { minLon: -5.8, maxLon: 9.8, minLat: 41.0, maxLat: 51.5 },
      targetRect: { minX: 0.34, maxX: 1.14, minY: 0.0, maxY: 0.72 },
      projection: createConicConformalProjection('france-metropolitan', {
        originLon: 2.5,
        originLat: 46.5,
        parallel1: 44,
        parallel2: 49
      }),
      contains(lon, lat) {
        return lat >= 41 && lat <= 51.8 && lon >= -6 && lon <= 10;
      }
    },
    {
      key: 'caribbean',
      geoBounds: { minLon: -62.2, maxLon: -60.5, minLat: 14.2, maxLat: 18.8 },
      targetRect: { minX: 1.20, maxX: 1.38, minY: 0.46, maxY: 0.64 },
      projection: createConicConformalProjection('france-caribbean', {
        originLon: -61.2,
        originLat: 16.4,
        parallel1: 13,
        parallel2: 19
      }),
      contains(lon, lat) {
        return lat >= 14 && lat <= 19 && lon >= -62.3 && lon <= -60.4;
      }
    },
    {
      key: 'french-guiana',
      geoBounds: { minLon: -54.8, maxLon: -51.5, minLat: 2.0, maxLat: 6.2 },
      targetRect: { minX: 1.18, maxX: 1.40, minY: 0.72, maxY: 0.98 },
      projection: createConicConformalProjection('france-guiana', {
        originLon: -53.2,
        originLat: 4.2,
        parallel1: 1,
        parallel2: 7
      }),
      contains(lon, lat) {
        return lat >= 1.8 && lat <= 6.4 && lon >= -55 && lon <= -51.3;
      }
    },
    {
      key: 'indian-ocean',
      geoBounds: { minLon: 44.0, maxLon: 56.2, minLat: -22.6, maxLat: -12.0 },
      targetRect: { minX: 1.46, maxX: 1.70, minY: 0.40, maxY: 0.84 },
      projection: createConicConformalProjection('france-indian-ocean', {
        originLon: 50.0,
        originLat: -17.0,
        parallel1: -24,
        parallel2: -10
      }),
      contains(lon, lat) {
        return lat >= -22.8 && lat <= -11.8 && lon >= 43.8 && lon <= 56.4;
      }
    },
    {
      key: 'pacific',
      geoBounds: { minLon: 163.0, maxLon: -134.0 + 360, minLat: -28.0, maxLat: -7.0 },
      targetRect: { minX: 0.00, maxX: 0.72, minY: 0.84, maxY: 1.18 },
      projection: createConicConformalProjection('france-pacific', {
        originLon: -160,
        originLat: -18,
        parallel1: -30,
        parallel2: -8
      }),
      contains(lon, lat) {
        return (
          (lat >= -28.5 && lat <= -7 && lon >= 163 && lon <= 180)
          || (lat >= -28.5 && lat <= -7 && lon >= -180 && lon <= -133)
        );
      }
    },
    {
      key: 'saint-pierre-miquelon',
      geoBounds: { minLon: -56.6, maxLon: -55.7, minLat: 46.6, maxLat: 47.3 },
      targetRect: { minX: 1.04, maxX: 1.12, minY: 0.06, maxY: 0.14 },
      projection: createConicConformalProjection('france-saint-pierre-miquelon', {
        originLon: -56.1,
        originLat: 46.9,
        parallel1: 44,
        parallel2: 49
      }),
      contains(lon, lat) {
        return lat >= 46.5 && lat <= 47.4 && lon >= -56.7 && lon <= -55.6;
      }
    }
  ]);
}

function createProjection(name) {
  const projectionName = normalizeProjectionName(name);

  if (projectionName === 'globe') {
    return {
      name: projectionName,
      center: { lon: 0, lat: 0 },
      setCenter(center) {
        this.center = {
          lon: wrapLongitude(center?.lon ?? 0),
          lat: clamp(center?.lat ?? 0, -89.999, 89.999)
        };
      },
      forward(lon, lat) {
        return orthographicForward(lon, lat, this.center);
      },
      inverse(x, y) {
        return orthographicInverse(x, y, this.center);
      }
    };
  }

  if (projectionName === 'fit') {
    return {
      name: projectionName,
      forward(lon, lat) {
        return { x: Number(lon), y: Number(lat) };
      },
      inverse(x, y) {
        return { lon: Number(x), lat: Number(y) };
      }
    };
  }

  if (projectionName === 'mercator') {
    return {
      name: projectionName,
      forward(lon, lat) {
        const lambda = lon * RAD;
        const phi = clamp(lat, -85, 85) * RAD;
        return {
          x: lambda,
          y: Math.log(Math.tan(Math.PI / 4 + phi / 2))
        };
      },
      inverse(x, y) {
        return {
          lon: x * DEG,
          lat: (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * DEG
        };
      }
    };
  }

  if (projectionName === 'miller') {
    return {
      name: projectionName,
      forward(lon, lat) {
        const lambda = lon * RAD;
        const phi = clamp(lat, -85, 85) * RAD;
        return {
          x: lambda,
          y: 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi))
        };
      },
      inverse(x, y) {
        return {
          lon: x * DEG,
          lat: 2.5 * (Math.atan(Math.exp(0.8 * y)) - Math.PI / 4) * DEG
        };
      }
    };
  }

  if (projectionName === 'albers') {
    return createConicEqualAreaProjection(projectionName, {
      originLon: 0,
      originLat: 0,
      parallel1: 20,
      parallel2: 50
    });
  }

  if (projectionName === 'albers-usa') {
    return createUsaCompositeProjection(projectionName, false);
  }

  if (projectionName === 'albers-usa-territories') {
    return createUsaCompositeProjection(projectionName, true);
  }

  if (projectionName === 'portugal-composite') {
    return createPortugalCompositeProjection(projectionName);
  }

  if (projectionName === 'spain-composite') {
    return createSpainCompositeProjection(projectionName);
  }

  if (projectionName === 'france-composite') {
    return createFranceCompositeProjection(projectionName);
  }

  if (projectionName === 'equal-earth') {
    return {
      name: projectionName,
      forward: equalEarthForward
    };
  }

  if (projectionName === 'natural-earth-1') {
    return {
      name: projectionName,
      forward: naturalEarth1Forward
    };
  }

  return {
    name: DEFAULT_PROJECTION,
    forward(lon, lat) {
      return { x: Number(lon), y: Number(lat) };
    },
    inverse(x, y) {
      return { lon: Number(x), lat: Number(y) };
    }
  };
}

function invertProjection(projection, x, y, guess = { lon: 0, lat: 0 }) {
  if (projection.inverse) {
    return projection.inverse(x, y);
  }

  let lon = clamp(Number(guess.lon) || 0, -180, 180);
  let lat = clamp(Number(guess.lat) || 0, -89.999, 89.999);
  const epsilon = 1e-5;

  for (let index = 0; index < 20; index += 1) {
    const current = projection.forward(lon, lat);
    const errorX = x - current.x;
    const errorY = y - current.y;

    if (Math.abs(errorX) + Math.abs(errorY) < 1e-9) {
      break;
    }

    const lonSample = projection.forward(lon + epsilon, lat);
    const latSample = projection.forward(lon, lat + epsilon);

    const a = (lonSample.x - current.x) / epsilon;
    const b = (latSample.x - current.x) / epsilon;
    const c = (lonSample.y - current.y) / epsilon;
    const d = (latSample.y - current.y) / epsilon;
    const determinant = a * d - b * c;

    if (Math.abs(determinant) < 1e-12) {
      break;
    }

    const deltaLon = (errorX * d - b * errorY) / determinant;
    const deltaLat = (a * errorY - errorX * c) / determinant;

    lon = clamp(lon + deltaLon, -180, 180);
    lat = clamp(lat + deltaLat, -89.999, 89.999);
  }

  return { lon, lat };
}

function createAnimationState(from, to, duration, startTime, meta = {}) {
  return { from, to, duration, startTime, ...meta };
}

function measureViewportSize(container, canvas, fallbackWidth = 800, fallbackHeight = 480) {
  const containerRect = container?.getBoundingClientRect?.();
  const containerWidth = Number(containerRect?.width ?? container?.clientWidth);
  const containerHeight = Number(containerRect?.height ?? container?.clientHeight);
  const canvasRect = canvas?.getBoundingClientRect?.();
  const canvasWidth = Number(canvasRect?.width ?? canvas?.clientWidth);
  const canvasHeight = Number(canvasRect?.height ?? canvas?.clientHeight);

  return {
    width: Math.max(1, Math.round(containerWidth || canvasWidth || fallbackWidth || 800)),
    height: Math.max(1, Math.round(containerHeight || canvasHeight || fallbackHeight || 480))
  };
}

export class GeoCanvas {
  constructor(target, options = {}) {
    if (!target) {
      throw new Error('GeoCanvas: target is required.');
    }

    const viewOptions = options.view && typeof options.view === 'object' ? options.view : {};
    const controlsOptions = viewOptions.controls && typeof viewOptions.controls === 'object' ? viewOptions.controls : {};
    const gestureOptions = viewOptions.gestures && typeof viewOptions.gestures === 'object' ? viewOptions.gestures : {};

    this.options = {
      background: options.background ?? '#f7fbff',
      padding: Number(options.padding ?? 16),
      styleFeature: typeof options.styleFeature === 'function' ? options.styleFeature : null,
      styleMarker: typeof options.styleMarker === 'function' ? options.styleMarker : null,
      hoverFeatureStyle: options.hoverFeatureStyle ?? null,
      hoverMarkerStyle: options.hoverMarkerStyle ?? null,
      markerLabels: normalizeMarkerLabelOptions(options.markerLabels),
      markerClusters: normalizeMarkerClusterOptions(options.markerClusters),
      initialZoom: hasOwn(options, 'initialZoom') ? options.initialZoom : viewOptions.initialZoom,
      initialCenter: hasOwn(options, 'initialCenter') ? options.initialCenter ?? null : viewOptions.initialCenter ?? null,
      showControls: Boolean(hasOwn(options, 'showControls') ? options.showControls : controlsOptions.enabled),
      controlsPosition: normalizeControlsPosition(hasOwn(options, 'controlsPosition') ? options.controlsPosition : controlsOptions.position),
      homeIconSvg: normalizeInlineSvgMarkup(hasOwn(options, 'homeIconSvg') ? options.homeIconSvg : controlsOptions.homeIconSvg),
      minZoom: Number((hasOwn(options, 'minZoom') ? options.minZoom : viewOptions.minZoom) ?? DEFAULT_MIN_ZOOM),
      maxZoom: Number((hasOwn(options, 'maxZoom') ? options.maxZoom : viewOptions.maxZoom) ?? DEFAULT_MAX_ZOOM),
      projection: normalizeProjectionName(hasOwn(options, 'projection') ? options.projection : viewOptions.projection),
      panEnabled: (hasOwn(options, 'panEnabled') ? options.panEnabled : gestureOptions.panEnabled) !== false,
      pinchZoomEnabled: (hasOwn(options, 'pinchZoomEnabled') ? options.pinchZoomEnabled : gestureOptions.pinchZoomEnabled) !== false,
      doubleTapZoomEnabled: (hasOwn(options, 'doubleTapZoomEnabled') ? options.doubleTapZoomEnabled : gestureOptions.doubleTapZoomEnabled) !== false,
      scrollWheelZoomEnabled: Boolean(hasOwn(options, 'scrollWheelZoomEnabled') ? options.scrollWheelZoomEnabled : gestureOptions.scrollWheelZoomEnabled),
      animationDuration: Number((hasOwn(options, 'animationDuration') ? options.animationDuration : viewOptions.animationDuration) ?? DEFAULT_ANIMATION_DURATION),
      hoverTransitionDuration: Math.max(
        0,
        Number((hasOwn(options, 'hoverTransitionDuration') ? options.hoverTransitionDuration : viewOptions.hoverTransitionDuration) ?? DEFAULT_HOVER_TRANSITION_DURATION)
      ),
      hoverTrail: ((hasOwn(options, 'hoverTrail') ? options.hoverTrail : viewOptions.hoverTrail) ?? DEFAULT_HOVER_TRAIL) !== false,
      hoverRegionToFront: ((hasOwn(options, 'hoverRegionToFront') ? options.hoverRegionToFront : viewOptions.hoverRegionToFront) ?? false) === true,
      zoomStep: Number((hasOwn(options, 'zoomStep') ? options.zoomStep : viewOptions.zoomStep) ?? DEFAULT_ZOOM_STEP),
      restoreLayerVisibilityOnHome: Boolean(
        (hasOwn(options, 'restoreLayerVisibilityOnHome') ? options.restoreLayerVisibilityOnHome : viewOptions.restoreLayerVisibilityOnHome)
        ?? options.home?.restoreLayerVisibility
      )
    };

    this.defaults = normalizeEntityDefaults(options.defaults, {
      markerLabels: hasOwn(options, 'markerLabels') ? normalizePartialMarkerLabelOptions(options.markerLabels) : undefined,
      markerClusters: hasOwn(options, 'markerClusters') ? normalizePartialMarkerClusterOptions(options.markerClusters) : undefined
    });
    this.tooltipOptions = normalizeTooltipOptions(options.tooltip);
    this.legendOptions = normalizeLegendOptions(options.legend);
    this.currentProjection = createProjection(this.options.projection);
    this.sources = new Map();
    this.layers = [];
    this.defaultLayerFilter = normalizeLayerFilterInput(options);
    this.fullFeatureEntries = [];
    this.featureEntries = [];
    this.projectedFeatureEntries = [];
    this.markers = [];
    this.lines = [];
    this.visibleLayerMarkers = [];
    this.visibleLayerLines = [];
    this.homeLayerVisibility = new Map();
    this.handlers = new Map();
    this.hitMap = new Map();
    this.hoverTarget = null;
    this.hitIdCursor = 1;
    this.markerOrderCursor = 1;
    this.lineOrderCursor = 1;
    this.tooltipState = {
      visible: false,
      hovered: false,
      focused: false,
      payload: null,
      anchorPoint: null,
      anchorPosition: null
    };
    this.tooltipHideFrame = null;
    this.animationFrame = null;
    this.animationState = null;
    this.markerAnimationFrame = null;
    this.hoverTransitionFrame = null;
    this.hoverTransitions = new Map();
    this.layerFadeFrame = null;
    this.layerFadeTransitions = new Map();
    this.clusterExpansionFrame = null;
    this.clusterExpansionTransitions = new Map();
    this.clusterFadeTransitions = new Map();
    this.previousRenderedClusterMarkers = new Map();
    this.previousRenderedVisibleMarkers = new Map();
    this.lastRenderedMarkerZoom = null;
    this.legendRenderKey = null;
    this.markerImageCache = new Map();
    this.markerHitMaskCanvas = null;
    this.markerHitMaskCtx = null;
    this.activeTouchPointers = new Map();
    this.pinchState = null;
    this.lastTap = null;
    this.dragState = null;
    this.suppressNextClick = false;
    this.activeClickActionUi = null;
    this.lightboxState = null;
    this.panelState = null;
    this.actionUiAnimations = new Map();
    this.homeView = {
      zoom: 1,
      center: { lon: 0, lat: 0 },
      explicit: false
    };
    this.lastComputedBounds = { minX: -1, minY: -1, maxX: 1, maxY: 1 };
    this.view = {
      zoom: 1,
      center: { lon: 0, lat: 0 }
    };

    this.container = target instanceof HTMLCanvasElement ? target.parentElement : target;
    this.canvas = target instanceof HTMLCanvasElement ? target : document.createElement('canvas');
    this.ownsCanvas = !(target instanceof HTMLCanvasElement);

    if (this.ownsCanvas) {
      this.canvas.style.display = 'block';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      target.appendChild(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.hitCanvas = document.createElement('canvas');
    this.hitCtx = this.hitCanvas.getContext('2d', { willReadFrequently: true });

    if (!this.ctx || !this.hitCtx) {
      throw new Error('GeoCanvas: could not acquire canvas contexts.');
    }

    this.ensureActionElements();
    this.ensureTooltipElement();
    this.ensureControlsElement();
    this.ensureLegendElement();
    this.applyPanBehavior();

    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    const initialSize = measureViewportSize(
      this.getViewportMeasurementElement(),
      this.canvas,
      Number(options.width) || 800,
      Number(options.height) || 480
    );
    this.width = initialSize.width;
    this.height = initialSize.height;
    this.baseTransform = createFitTransform({ minX: -1, minY: -1, maxX: 1, maxY: 1 }, this.width, this.height, this.options.padding);

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onTooltipEnter = this.onTooltipEnter.bind(this);
    this.onTooltipLeave = this.onTooltipLeave.bind(this);
    this.onTooltipFocusIn = this.onTooltipFocusIn.bind(this);
    this.onTooltipFocusOut = this.onTooltipFocusOut.bind(this);
    this.onZoomInClick = this.onZoomInClick.bind(this);
    this.onZoomOutClick = this.onZoomOutClick.bind(this);
    this.onHomeClick = this.onHomeClick.bind(this);
    this.onLegendClick = this.onLegendClick.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);
    this.onLightboxBackdropClick = this.onLightboxBackdropClick.bind(this);
    this.onLightboxCloseClick = this.onLightboxCloseClick.bind(this);
    this.onLayoutPanelCloseClick = this.onLayoutPanelCloseClick.bind(this);
    this.onOverlayPanelCloseClick = this.onOverlayPanelCloseClick.bind(this);

    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerCancel);
    this.canvas.addEventListener('pointerleave', this.onPointerLeave);
    this.canvas.addEventListener('click', this.onClick);
    this.canvas.addEventListener('dblclick', this.onDoubleClick);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.onDocumentKeyDown);
    }

    if (this.tooltipElement) {
      this.tooltipElement.addEventListener('pointerenter', this.onTooltipEnter);
      this.tooltipElement.addEventListener('pointerleave', this.onTooltipLeave);
      this.tooltipElement.addEventListener('focusin', this.onTooltipFocusIn);
      this.tooltipElement.addEventListener('focusout', this.onTooltipFocusOut);
    }

    if (this.zoomInButton) {
      this.zoomInButton.addEventListener('click', this.onZoomInClick);
    }
    if (this.zoomOutButton) {
      this.zoomOutButton.addEventListener('click', this.onZoomOutClick);
    }
    if (this.homeButton) {
      this.homeButton.addEventListener('click', this.onHomeClick);
    }
    if (this.legendElement) {
      this.legendElement.addEventListener('click', this.onLegendClick);
    }
    if (this.lightboxBackdropElement) {
      this.lightboxBackdropElement.addEventListener('click', this.onLightboxBackdropClick);
    }
    if (this.lightboxCloseButton) {
      this.lightboxCloseButton.addEventListener('click', this.onLightboxCloseClick);
    }
    if (this.layoutPanelCloseButton) {
      this.layoutPanelCloseButton.addEventListener('click', this.onLayoutPanelCloseClick);
    }
    if (this.overlayPanelCloseButton) {
      this.overlayPanelCloseButton.addEventListener('click', this.onOverlayPanelCloseClick);
    }

    if (typeof ResizeObserver !== 'undefined' && this.container) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });
      this.resizeObserver.observe(this.container);
      if (this.surfaceElement && this.surfaceElement !== this.container) {
        this.resizeObserver.observe(this.surfaceElement);
      }
    }

    this.resize(this.width, this.height);
    this.updateControlsVisibility();
  }

  setGeoJSON(geojson, options = {}) {
    this.setLayers([
      {
        id: DEFAULT_LAYER_ID,
        name: DEFAULT_LAYER_NAME,
        geojson,
        visible: true,
        antimeridianMode: options.antimeridianMode,
        antimeridianReferenceLon: options.antimeridianReferenceLon,
        includePolygonIds: options.includePolygonIds,
        excludePolygonIds: options.excludePolygonIds
      }
    ], options);
    return this;
  }

  setSources(sources = []) {
    this.clearLayerFadeTransitions();
    this.sources = new Map(
      (sources ?? []).map((source, index) => {
        const normalizedSource = normalizeSourceDefinition(source, index);
        return [normalizedSource.id, this.createSourceRecord(normalizedSource)];
      })
    );
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  addSource(source) {
    const normalizedSource = normalizeSourceDefinition(source, this.sources.size);
    const record = this.createSourceRecord(normalizedSource);
    this.sources.set(record.id, record);
    this.refreshProjectedFeatures({ resetView: false });
    this.render();
    return record;
  }

  removeSource(sourceId) {
    this.sources.delete(String(sourceId));
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  clearSources() {
    this.clearLayerFadeTransitions();
    this.sources.clear();
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  getSources() {
    return Array.from(this.sources.values()).map((source) => ({
      id: source.id,
      name: source.name,
      geojson: source.geojson
    }));
  }

  setLayers(layers = [], options = {}) {
    this.applyLayerOptions(options);
    this.clearLayerFadeTransitions();
    const fallbackFilter = {
      includePolygonIds: Object.prototype.hasOwnProperty.call(options, 'includePolygonIds')
        ? normalizeIdList(options.includePolygonIds)
        : this.defaultLayerFilter.includePolygonIds,
      excludePolygonIds: Object.prototype.hasOwnProperty.call(options, 'excludePolygonIds')
        ? normalizeIdList(options.excludePolygonIds)
        : this.defaultLayerFilter.excludePolygonIds
    };
    this.layers = (layers ?? []).map((layer, index) => this.createLayerRecord(layer, index, fallbackFilter));
    this.refreshProjectedFeatures({ resetView: options.fit !== false });
    this.captureHomeState();
    this.hoverTarget = null;
    this.hideTooltip();
    this.applyPanBehavior();
    this.updateControlsVisibility();
    this.render();
    return this;
  }

  addLayer(layer, options = {}) {
    this.applyLayerOptions(options);
    this.clearLayerFadeTransitions();
    const nextLayer = this.createLayerRecord(layer, this.layers.length, {
      includePolygonIds: Object.prototype.hasOwnProperty.call(options, 'includePolygonIds')
        ? normalizeIdList(options.includePolygonIds)
        : this.defaultLayerFilter.includePolygonIds,
      excludePolygonIds: Object.prototype.hasOwnProperty.call(options, 'excludePolygonIds')
        ? normalizeIdList(options.excludePolygonIds)
        : this.defaultLayerFilter.excludePolygonIds
    });
    this.layers.push(nextLayer);
    this.refreshProjectedFeatures({ resetView: options.fit !== false });
    this.captureHomeState();
    this.hoverTarget = null;
    this.hideTooltip();
    this.applyPanBehavior();
    this.updateControlsVisibility();
    this.render();
    return nextLayer;
  }

  removeLayer(layerId) {
    this.clearLayerFadeTransitions();
    this.layers = this.layers.filter((layer) => layer.id !== layerId)
      .map((layer, index) => this.createLayerRecord(layer, index));
    this.refreshProjectedFeatures({ resetView: false });
    this.captureHomeState();
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  clearLayers() {
    this.layers = [];
    this.fullFeatureEntries = [];
    this.featureEntries = [];
    this.projectedFeatureEntries = [];
    this.visibleLayerMarkers = [];
    this.visibleLayerLines = [];
    this.homeLayerVisibility = new Map();
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  captureHomeState() {
    this.homeLayerVisibility = new Map(this.layers.map((layer) => [layer.id, Boolean(layer.visible)]));
    return this;
  }

  getLayers() {
    return this.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      sourceId: layer.sourceId,
      geojson: layer.geojson,
      visible: layer.visible,
      order: layer.order,
      antimeridianMode: layer.antimeridianMode,
      antimeridianReferenceLon: layer.antimeridianReferenceLon,
      regionJoinField: layer.regionJoinField,
      regions: Array.from(layer.regions.values()),
      defaults: cloneEntityDefaultsState(layer.defaults),
      tooltip: cloneLayerTooltipOptions(layer.tooltip),
      markers: layer.markers.map((marker) => this.serializeMarkerRecord(marker)),
      lines: layer.lines.map((line) => this.serializeLineRecord(line)),
      bindings: { ...layer.bindings },
      labels: { ...layer.labels },
      markerLabels: { ...layer.markerLabels },
      markerClusters: { ...layer.markerClusters },
      interaction: clonePlainObject(layer.interaction),
      regionStyle: { ...layer.regionStyle },
      contributeToBounds: layer.contributeToBounds,
      includePolygonIds: Array.from(layer.includePolygonIds ?? []),
      excludePolygonIds: Array.from(layer.excludePolygonIds ?? [])
    }));
  }

  getLayerDefaults(layerId) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    return layer ? cloneEntityDefaultsState(layer.defaults) : null;
  }

  getLayerTooltipOptions(layerId) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    return layer ? cloneLayerTooltipOptions(layer.tooltip) ?? {} : null;
  }

  getDefaults() {
    return cloneEntityDefaultsState(this.defaults);
  }

  getLegendOptions() {
    return clonePlainObject(this.legendOptions);
  }

  getViewOptions() {
    return {
      projection: this.options.projection,
      initialZoom: this.options.initialZoom,
      initialCenter: this.options.initialCenter == null ? null : { ...this.options.initialCenter },
      minZoom: this.options.minZoom,
      maxZoom: this.options.maxZoom,
      controls: {
        enabled: this.options.showControls,
        position: this.options.controlsPosition,
        homeIconSvg: this.options.homeIconSvg ?? null
      },
      gestures: {
        panEnabled: this.options.panEnabled,
        pinchZoomEnabled: this.options.pinchZoomEnabled,
        doubleTapZoomEnabled: this.options.doubleTapZoomEnabled,
        scrollWheelZoomEnabled: this.options.scrollWheelZoomEnabled
      },
      animationDuration: this.options.animationDuration,
      hoverTransitionDuration: this.options.hoverTransitionDuration,
      hoverTrail: this.options.hoverTrail,
      hoverRegionToFront: this.options.hoverRegionToFront,
      zoomStep: this.options.zoomStep,
      restoreLayerVisibilityOnHome: this.options.restoreLayerVisibilityOnHome
    };
  }

  serializeMarkerRecord(marker) {
    return {
      id: marker.id,
      lon: marker.lon,
      lat: marker.lat,
      title: marker.title,
      name: marker.name,
      label: marker.label,
      type: marker.type,
      image: marker.image ? { ...marker.image } : null,
      ...(Object.prototype.hasOwnProperty.call(marker, 'itemAnimation')
        ? { animation: clonePlainObject(marker.itemAnimation) }
        : {}),
      properties: marker.properties ? { ...marker.properties } : {},
      data: marker.data,
      region: marker.region ?? null,
      style: marker.style ? { ...marker.style } : {},
      hoverStyle: marker.hoverStyle ? { ...marker.hoverStyle } : {},
      bindings: marker.itemBindings ? { ...marker.itemBindings } : {},
      tooltip: Object.prototype.hasOwnProperty.call(marker, 'itemTooltip') ? marker.itemTooltip : marker.tooltip,
      interaction: clonePlainObject(Object.prototype.hasOwnProperty.call(marker, 'itemInteraction') ? marker.itemInteraction : marker.interaction)
    };
  }

  serializeLineRecord(line) {
    return {
      id: line.id,
      coordinates: (line.coordinates ?? []).map(clonePoint),
      markerRefs: normalizeLineMarkerRefs(line.markerRefs),
      pathMode: normalizeLinePathMode(line.pathMode),
      data: line.data,
      properties: line.properties ? { ...line.properties } : {},
      region: line.region ?? null,
      style: line.style ? { ...line.style } : {},
      hoverStyle: line.hoverStyle ? { ...line.hoverStyle } : {},
      bindings: line.itemBindings ? { ...line.itemBindings } : {},
      tooltip: Object.prototype.hasOwnProperty.call(line, 'itemTooltip') ? line.itemTooltip : line.tooltip
    };
  }

  getResolvedRegionIdBinding(layer) {
    return typeof layer?.resolvedDefaults?.regions?.bindings?.regionId === 'string'
      ? layer.resolvedDefaults.regions.bindings.regionId
      : (typeof layer?.bindings?.regionId === 'string' ? layer.bindings.regionId : 'regionId');
  }

  rehydrateGlobalCollections() {
    const markerInputs = this.markers.map((marker) => this.serializeMarkerRecord(marker));
    const lineInputs = this.lines.map((line) => this.serializeLineRecord(line));
    this.markers = markerInputs.map((marker, index) => {
      const nextMarker = createMarkerRecord(marker, {
        fallbackId: `marker-${index}`,
        order: index,
        entityKeyPrefix: 'marker',
        markerDefaults: this.defaults.markers
      });
      nextMarker.bindings = resolveMergedObject(this.defaults.markers.bindings, nextMarker.itemBindings);
      nextMarker.interaction = resolveInteractionConfig(this.defaults.markers.interaction, nextMarker.itemInteraction);
      nextMarker.tooltip = Object.prototype.hasOwnProperty.call(nextMarker, 'itemTooltip') ? nextMarker.itemTooltip : nextMarker.tooltip;
      nextMarker.bindingContext = createLayerBindingContext({ marker: nextMarker });
      return nextMarker;
    });
    this.markerOrderCursor = this.markers.length;

    this.lines = lineInputs.map((line, index) => {
      const nextLine = {
        id: line.id ?? `line-${index}`,
        coordinates: (line.coordinates ?? []).map(clonePoint),
        markerRefs: normalizeLineMarkerRefs(line.markerRefs),
        data: line.data,
        region: line.region ?? null,
        properties: line.properties ?? {},
        style: line.style ?? {},
        hoverStyle: line.hoverStyle ?? {},
        bindings: resolveMergedObject(this.defaults.lines.bindings, line.bindings && typeof line.bindings === 'object' ? { ...line.bindings } : {}),
        tooltip: line.tooltip,
        itemBindings: line.bindings && typeof line.bindings === 'object' ? { ...line.bindings } : {},
        itemTooltip: Object.prototype.hasOwnProperty.call(line, 'tooltip') ? line.tooltip : undefined,
        lineDefaults: this.defaults.lines,
        order: index,
        entityKey: `line:${line.id ?? `line-${index}`}:${index}`
      };
      nextLine.bindingContext = createLayerBindingContext({ line: nextLine });
      return nextLine;
    });
    this.lineOrderCursor = this.lines.length;
  }

  rehydrateLayerCollections(layer) {
    const regionInputs = Array.from(layer.regions.values());
    const markerInputs = layer.markers.map((marker) => this.serializeMarkerRecord(marker));
    const lineInputs = layer.lines.map((line) => this.serializeLineRecord(line));

    layer.resolvedDefaults = resolveEntityDefaults(this.defaults, layer.defaults);
    layer.regions = normalizeRegionCollection(regionInputs, this.getResolvedRegionIdBinding(layer));
    layer.markers = markerInputs.map((marker, index) => this.createLayerMarkerRecord(layer, marker, index));
    layer.lines = lineInputs.map((line, index) => this.createLayerLineRecord(layer, line, index));
  }

  setLayerVisibility(layerId, visible) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }
    this.cancelLayerFade(layerId);
    layer.visible = Boolean(visible);
    this.refreshProjectedFeatures({ resetView: false, preserveBaseTransform: true });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  toggleLayerVisibility(layerId) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }
    return this.setLayerVisibility(layerId, !layer.visible);
  }

  setLayerFilter(layerId, { includePolygonIds, excludePolygonIds } = {}) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }

    if (includePolygonIds !== undefined) {
      layer.includePolygonIds = createIdSet(includePolygonIds);
    }
    if (excludePolygonIds !== undefined) {
      layer.excludePolygonIds = createIdSet(excludePolygonIds);
    }

    this.refreshProjectedFeatures({ resetView: true });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  setLayerRegions(layerId, regions = [], bindings = undefined) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }

    if (bindings && typeof bindings === 'object') {
      layer.bindings = { ...(layer.bindings ?? {}), ...bindings };
      layer.defaults.regions.bindings = resolveMergedObject(layer.defaults.regions.bindings, bindings);
    }
    layer.resolvedDefaults = resolveEntityDefaults(this.defaults, layer.defaults);
    const regionIdBinding = typeof layer.resolvedDefaults.regions.bindings?.regionId === 'string'
      ? layer.resolvedDefaults.regions.bindings.regionId
      : (typeof layer.bindings?.regionId === 'string' ? layer.bindings.regionId : 'regionId');
    layer.regions = normalizeRegionCollection(regions, regionIdBinding);
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  setLayerMarkers(layerId, markers = []) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }

    layer.markers = (markers ?? []).map((marker, index) => this.createLayerMarkerRecord(layer, marker, index));
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  setLayerMarkerLabels(layerId, markerLabels = {}) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }

    layer.markerLabels = normalizePartialMarkerLabelOptions(markerLabels);
    return this.setLayerDefaults(layerId, {
      markers: {
        labels: markerLabels
      }
    });
  }

  setLayerMarkerClusters(layerId, markerClusters = {}) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }

    layer.markerClusters = normalizePartialMarkerClusterOptions(markerClusters);
    return this.setLayerDefaults(layerId, {
      markers: {
        clusters: markerClusters
      }
    });
  }

  setLayerRegionDefaults(layerId, regions = {}) {
    return this.setLayerDefaults(layerId, { regions });
  }

  setLayerMarkerDefaults(layerId, markers = {}) {
    return this.setLayerDefaults(layerId, { markers });
  }

  setLayerLineDefaults(layerId, lines = {}) {
    return this.setLayerDefaults(layerId, { lines });
  }

  setLayerLines(layerId, lines = []) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }

    layer.lines = (lines ?? []).map((line, index) => this.createLayerLineRecord(layer, line, index));
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  applyLayerOptions(options = {}) {
    const viewOptions = options.view && typeof options.view === 'object' ? options.view : {};
    const controlsOptions = viewOptions.controls && typeof viewOptions.controls === 'object' ? viewOptions.controls : {};
    const gestureOptions = viewOptions.gestures && typeof viewOptions.gestures === 'object' ? viewOptions.gestures : {};
    if (Object.prototype.hasOwnProperty.call(options, 'projection') || Object.prototype.hasOwnProperty.call(viewOptions, 'projection')) {
      this.options.projection = normalizeProjectionName(
        Object.prototype.hasOwnProperty.call(options, 'projection') ? options.projection : viewOptions.projection
      );
      this.currentProjection = createProjection(this.options.projection);
    }

    if (Object.prototype.hasOwnProperty.call(options, 'initialZoom') || Object.prototype.hasOwnProperty.call(viewOptions, 'initialZoom')) {
      this.options.initialZoom = Object.prototype.hasOwnProperty.call(options, 'initialZoom') ? options.initialZoom : viewOptions.initialZoom;
    }
    if (Object.prototype.hasOwnProperty.call(options, 'initialCenter') || Object.prototype.hasOwnProperty.call(viewOptions, 'initialCenter')) {
      this.options.initialCenter = (Object.prototype.hasOwnProperty.call(options, 'initialCenter') ? options.initialCenter : viewOptions.initialCenter) ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(viewOptions, 'minZoom')) {
      this.options.minZoom = Number(viewOptions.minZoom ?? DEFAULT_MIN_ZOOM);
    }
    if (Object.prototype.hasOwnProperty.call(viewOptions, 'maxZoom')) {
      this.options.maxZoom = Number(viewOptions.maxZoom ?? DEFAULT_MAX_ZOOM);
    }
    if (Object.prototype.hasOwnProperty.call(controlsOptions, 'enabled')) {
      this.options.showControls = Boolean(controlsOptions.enabled);
    }
    if (Object.prototype.hasOwnProperty.call(controlsOptions, 'position')) {
      this.options.controlsPosition = normalizeControlsPosition(controlsOptions.position);
    }
    if (Object.prototype.hasOwnProperty.call(controlsOptions, 'homeIconSvg')) {
      this.options.homeIconSvg = normalizeInlineSvgMarkup(controlsOptions.homeIconSvg);
    }
    if (Object.prototype.hasOwnProperty.call(gestureOptions, 'panEnabled')) {
      this.options.panEnabled = Boolean(gestureOptions.panEnabled);
    }
    if (Object.prototype.hasOwnProperty.call(gestureOptions, 'pinchZoomEnabled')) {
      this.options.pinchZoomEnabled = Boolean(gestureOptions.pinchZoomEnabled);
    }
    if (Object.prototype.hasOwnProperty.call(gestureOptions, 'doubleTapZoomEnabled')) {
      this.options.doubleTapZoomEnabled = Boolean(gestureOptions.doubleTapZoomEnabled);
    }
    if (Object.prototype.hasOwnProperty.call(gestureOptions, 'scrollWheelZoomEnabled')) {
      this.options.scrollWheelZoomEnabled = Boolean(gestureOptions.scrollWheelZoomEnabled);
    }
    if (Object.prototype.hasOwnProperty.call(viewOptions, 'animationDuration')) {
      this.options.animationDuration = Number(viewOptions.animationDuration ?? DEFAULT_ANIMATION_DURATION);
    }
    if (Object.prototype.hasOwnProperty.call(viewOptions, 'hoverTransitionDuration')) {
      this.options.hoverTransitionDuration = Math.max(0, Number(viewOptions.hoverTransitionDuration ?? DEFAULT_HOVER_TRANSITION_DURATION));
    }
    if (Object.prototype.hasOwnProperty.call(viewOptions, 'hoverTrail')) {
      this.options.hoverTrail = (viewOptions.hoverTrail ?? DEFAULT_HOVER_TRAIL) !== false;
    }
    if (Object.prototype.hasOwnProperty.call(viewOptions, 'zoomStep')) {
      this.options.zoomStep = Number(viewOptions.zoomStep ?? DEFAULT_ZOOM_STEP);
    }
    if (Object.prototype.hasOwnProperty.call(viewOptions, 'restoreLayerVisibilityOnHome')) {
      this.options.restoreLayerVisibilityOnHome = Boolean(viewOptions.restoreLayerVisibilityOnHome);
    }

    if (typeof this.updateHomeButtonIcon === 'function') {
      this.updateHomeButtonIcon();
    }
  }

  createLayerRecord(layer, index, fallbackFilter = {}) {
    const mergedLayer = {
      ...(layer ?? {}),
      includePolygonIds: layer?.includePolygonIds ?? fallbackFilter.includePolygonIds,
      excludePolygonIds: layer?.excludePolygonIds ?? fallbackFilter.excludePolygonIds
    };
    const normalizedLayer = normalizeLayerDefinition(mergedLayer, index);
    const resolvedDefaults = resolveEntityDefaults(this.defaults, normalizedLayer.defaults);
    const regionIdBinding = typeof resolvedDefaults.regions.bindings?.regionId === 'string'
      ? resolvedDefaults.regions.bindings.regionId
      : (typeof normalizedLayer.bindings?.regionId === 'string' ? normalizedLayer.bindings.regionId : 'regionId');
    return {
      ...normalizedLayer,
      resolvedDefaults,
      fullFeatureEntries: [],
      featureEntries: [],
      projectedFeatureEntries: [],
      tooltip: normalizedLayer.tooltip,
      regions: normalizeRegionCollection(
        normalizedLayer.regions,
        regionIdBinding
      ),
      markers: normalizedLayer.markers.map((marker, markerIndex) => this.createLayerMarkerRecord({ ...normalizedLayer, resolvedDefaults }, marker, markerIndex)),
      lines: normalizedLayer.lines.map((line, lineIndex) => this.createLayerLineRecord(normalizedLayer, line, lineIndex)),
      includePolygonIds: createIdSet(normalizedLayer.includePolygonIds),
      excludePolygonIds: createIdSet(normalizedLayer.excludePolygonIds)
    };
  }

  createSourceRecord(source) {
    return {
      ...source,
      featureEntries: normalizeGeoJSON(source.geojson),
      projectedFeatureEntries: [],
      projectedProjectionName: null
    };
  }

  getSourceRecord(sourceId) {
    if (sourceId == null) {
      return null;
    }
    return this.sources.get(String(sourceId)) ?? null;
  }

  isGlobeProjection() {
    return isGlobeProjection(this.currentProjection);
  }

  syncProjectionState(view = this.view) {
    if (this.isGlobeProjection()) {
      this.currentProjection.setCenter?.(view.center);
    }
  }

  getProjectedSourceEntries(sourceRecord) {
    if (!sourceRecord) {
      return [];
    }

    if (this.isGlobeProjection()) {
      return sourceRecord.featureEntries;
    }

    if (sourceRecord.projectedProjectionName !== this.currentProjection.name) {
      sourceRecord.projectedFeatureEntries = projectFeatureEntries(sourceRecord.featureEntries, this.currentProjection);
      sourceRecord.projectedProjectionName = this.currentProjection.name;
    }

    return sourceRecord.projectedFeatureEntries;
  }

  getLayerSourceEntries(layer) {
    const sourceRecord = this.getSourceRecord(layer.sourceId);
    const createLayerFeatureEntries = (entries = []) => {
      const normalizedEntries = [];
      const grouped = new Map();

      (entries ?? []).forEach((entry, index) => {
        const key = entry?.sourceId == null ? `entry:${index}` : String(entry.sourceId);
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key).push(entry);
      });

      grouped.forEach((featureEntries) => {
        normalizeFeatureEntriesForAntimeridian(featureEntries, layer).forEach((entry) => {
          normalizedEntries.push(entry);
        });
      });

      return attachLayerMetadata(
        normalizedEntries,
        layer.id,
        layer.name,
        layer.order,
        layer.regionJoinField
      );
    };

    if (sourceRecord) {
      const fullFeatureEntries = createLayerFeatureEntries(sourceRecord.featureEntries);
      return {
        sourceRecord,
        fullFeatureEntries,
        projectedFeatureEntries: projectFeatureEntries(fullFeatureEntries, this.currentProjection)
      };
    }

    if (!layer.inlineSourceRecord || layer.inlineSourceRecord.geojson !== layer.geojson) {
      layer.inlineSourceRecord = this.createSourceRecord({
        id: layer.id,
        name: layer.name,
        geojson: layer.geojson
      });
    }

    const fullFeatureEntries = createLayerFeatureEntries(layer.inlineSourceRecord.featureEntries);
    return {
      sourceRecord: layer.inlineSourceRecord,
      fullFeatureEntries,
      projectedFeatureEntries: projectFeatureEntries(fullFeatureEntries, this.currentProjection)
    };
  }

  buildLayerRegionTransformIndex(layer) {
    const grouped = new Map();
    (layer?.fullFeatureEntries ?? []).forEach((entry) => {
      if (entry?.kind !== 'polygon') {
        return;
      }

      const joinId = resolveRegionTransformJoinId(entry);
      if (!joinId) {
        return;
      }

      if (!grouped.has(joinId)) {
        grouped.set(joinId, []);
      }
      grouped.get(joinId).push(entry);
    });

    const byJoinId = new Map();
    grouped.forEach((entries, joinId) => {
      const definition = resolveRegionTransformDefinition(
        entries[0],
        layer?.resolvedDefaults?.regions?.transforms ?? {}
      );
      const delta = resolveRegionTransformDelta(entries, definition);
      if (!hasRegionTransformDelta(delta)) {
        return;
      }

      byJoinId.set(joinId, {
        joinId,
        entries,
        definition,
        delta,
        anchor: computeCoordinateAnchor(entries)
      });
    });

    return { byJoinId };
  }

  getLayerRegionTransformRecord(layer, joinId = null) {
    if (!layer?.regionTransformIndex?.byJoinId || joinId == null) {
      return null;
    }

    return layer.regionTransformIndex.byJoinId.get(String(joinId)) ?? null;
  }

  findContainingLayerRegionTransform(layer, lon, lat, preferredJoinId = null) {
    if (!layer?.regionTransformIndex?.byJoinId || !Number.isFinite(Number(lon)) || !Number.isFinite(Number(lat))) {
      return null;
    }

    const point = { x: Number(lon), y: Number(lat) };
    const matchesPoint = (record) => record?.entries?.some((entry) => {
      if (entry.kind !== 'polygon') {
        return false;
      }

      const rings = (entry.coordinates ?? []).map((ring) => (
        (ring ?? []).map((coordinate) => ({
          x: Number(coordinate?.[0]),
          y: Number(coordinate?.[1])
        }))
      ));
      return isPointInPolygonRings(point, rings);
    });

    if (preferredJoinId != null) {
      const preferred = this.getLayerRegionTransformRecord(layer, preferredJoinId);
      if (preferred && matchesPoint(preferred)) {
        return preferred;
      }
    }

    for (const record of layer.regionTransformIndex.byJoinId.values()) {
      if (matchesPoint(record)) {
        return record;
      }
    }

    return null;
  }

  transformGeoPointForLayer(layer, lon, lat, options = {}) {
    const preferredJoinId = options?.preferredJoinId ?? null;
    const forcePreferred = options?.forcePreferred === true;
    const antimeridianMode = normalizeAntimeridianMode(layer?.antimeridianMode);
    const antimeridianReferenceLon = normalizeAntimeridianReferenceLongitude(layer?.antimeridianReferenceLon);
    const basePoint = {
      lon: Number(lon),
      lat: Number(lat)
    };

    if (!Number.isFinite(basePoint.lon) || !Number.isFinite(basePoint.lat)) {
      return null;
    }

    let record = null;
    if (preferredJoinId != null) {
      const preferred = this.getLayerRegionTransformRecord(layer, preferredJoinId);
      if (preferred && (forcePreferred || this.findContainingLayerRegionTransform(layer, basePoint.lon, basePoint.lat, preferredJoinId))) {
        record = preferred;
      }
    }
    if (!record) {
      record = this.findContainingLayerRegionTransform(layer, basePoint.lon, basePoint.lat, preferredJoinId);
    }

    if (!record) {
      if (antimeridianMode === 'unwrap' && isFiniteNumber(antimeridianReferenceLon)) {
        return {
          lon: shiftLongitudeTowardReference(basePoint.lon, antimeridianReferenceLon),
          lat: basePoint.lat,
          regionJoinId: null
        };
      }
      return {
        ...basePoint,
        regionJoinId: null
      };
    }

    return {
      lon: basePoint.lon + record.delta.lon,
      lat: basePoint.lat + record.delta.lat,
      regionJoinId: record.joinId
    };
  }

  inverseTransformGeoPointForLayer(layer, lon, lat, joinId = null) {
    const basePoint = {
      lon: Number(lon),
      lat: Number(lat)
    };

    if (!Number.isFinite(basePoint.lon) || !Number.isFinite(basePoint.lat) || joinId == null) {
      return basePoint;
    }

    const record = this.getLayerRegionTransformRecord(layer, joinId);
    if (!record) {
      return basePoint;
    }

    return {
      lon: basePoint.lon - record.delta.lon,
      lat: basePoint.lat - record.delta.lat,
      regionJoinId: record.joinId
    };
  }

  transformCoordinatesForLayer(layer, coordinates, options = {}) {
    if (!Array.isArray(coordinates)) {
      return coordinates;
    }

    if (coordinates.length >= 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
      const baseCoordinates = options.skipAntimeridian
        ? coordinates.slice()
        : normalizeCoordinatesForAntimeridian('point', coordinates, layer);
      const point = this.transformGeoPointForLayer(layer, baseCoordinates[0], baseCoordinates[1], {
        ...options,
        skipAntimeridian: true
      });
      return point ? [point.lon, point.lat] : baseCoordinates.slice();
    }

    if (Array.isArray(coordinates[0]) && coordinates[0].length >= 2 && typeof coordinates[0][0] === 'number' && typeof coordinates[0][1] === 'number') {
      const baseCoordinates = options.skipAntimeridian
        ? cloneGeoCoordinates(coordinates)
        : normalizeCoordinatesForAntimeridian('line', coordinates, layer);
      return baseCoordinates.map((entry) => this.transformCoordinatesForLayer(layer, entry, {
        ...options,
        skipAntimeridian: true
      }));
    }

    return coordinates.map((entry) => this.transformCoordinatesForLayer(layer, entry, options));
  }

  getFeatureDisplayCoordinates(layer, entry) {
    if (!entry) {
      return null;
    }

    if (entry.kind === 'polygon') {
      const record = this.getLayerRegionTransformRecord(layer, resolveRegionTransformJoinId(entry));
      if (record) {
        return translateGeoCoordinates(entry.coordinates, record.delta);
      }
      return cloneGeoCoordinates(entry.coordinates);
    }

    if (entry.kind === 'point') {
      const point = this.transformGeoPointForLayer(layer, entry.coordinates?.[0], entry.coordinates?.[1]);
      return point ? [point.lon, point.lat] : cloneGeoCoordinates(entry.coordinates);
    }

    if (entry.kind === 'line') {
      return this.transformCoordinatesForLayer(layer, entry.coordinates);
    }

    return cloneGeoCoordinates(entry.coordinates);
  }

  projectCoordinatesForView(kind, coordinates, center = this.view.center) {
    if (!this.isGlobeProjection()) {
      return projectCoordinateArray(coordinates, this.currentProjection);
    }

    if (kind === 'point') {
      const projected = orthographicForward(coordinates[0], coordinates[1], center);
      return projected.visible ? [projected.x, projected.y] : null;
    }

    if (kind === 'line') {
      return projectGlobeLineCoordinates(coordinates ?? [], center);
    }

    if (kind === 'polygon') {
      return (coordinates ?? [])
        .map((ring) => projectGlobePolygonRing(ring, center))
        .filter((ring) => ring.length >= 4);
    }

    return null;
  }

  projectLayerFeatureEntryForView(layer, entry, center = this.view.center) {
    const displayCoordinates = this.getFeatureDisplayCoordinates(layer, entry);
    return {
      displayCoordinates,
      projectedCoordinates: this.projectCoordinatesForView(entry?.kind, displayCoordinates, center)
    };
  }

  projectFeatureEntryForView(entry, center = this.view.center) {
    return this.projectCoordinatesForView(entry?.kind, entry?.coordinates, center);
  }

  refreshGlobeProjectionState() {
    if (!this.isGlobeProjection()) {
      return;
    }

    this.syncProjectionState();
    this.projectedFeatureEntries = [];

    this.layers.forEach((layer) => {
      layer.projectedFeatureEntries = (layer.featureEntries ?? [])
        .map((entry) => {
          const { projectedCoordinates, displayCoordinates } = this.projectLayerFeatureEntryForView(layer, entry);
          if (!hasProjectedGeometry(projectedCoordinates)) {
            return null;
          }
          return {
            ...entry,
            displayCoordinates,
            projectedCoordinates
          };
        })
        .filter(Boolean);

      if (layer.visible) {
        this.projectedFeatureEntries.push(...layer.projectedFeatureEntries);
      }
    });
  }

  createLayerMarkerRecord(layer, marker, index) {
    return createMarkerRecord(marker, {
      fallbackId: `${layer.id}-marker-${index}`,
      order: index,
      layerId: layer.id,
      layerName: layer.name,
      entityKeyPrefix: `layer:${layer.id}:marker`,
      markerDefaults: layer.resolvedDefaults?.markers
    });
  }

  createLayerLineRecord(layer, line, index) {
    const id = line.id ?? `${layer.id}-line-${index}`;
    return {
      id,
      coordinates: (line.coordinates ?? []).map(clonePoint),
      markerRefs: normalizeLineMarkerRefs(line.markerRefs),
      pathMode: normalizeLinePathMode(line.pathMode),
      data: line.data,
      region: line.region ?? null,
      properties: line.properties ?? {},
      style: line.style ?? {},
      hoverStyle: line.hoverStyle ?? {},
      bindings: line.bindings && typeof line.bindings === 'object' ? { ...line.bindings } : {},
      tooltip: line.tooltip,
      itemBindings: line.itemBindings && typeof line.itemBindings === 'object'
        ? { ...line.itemBindings }
        : (line.bindings && typeof line.bindings === 'object' ? { ...line.bindings } : {}),
      itemTooltip: Object.prototype.hasOwnProperty.call(line, 'itemTooltip') ? line.itemTooltip : line.tooltip,
      layerId: layer.id,
      layerName: layer.name,
      entityKey: `layer:${layer.id}:line:${id}:${index}`,
      order: index
    };
  }

  setMarkers(markers = []) {
    this.markers = markers.map((marker, index) => {
      const nextMarker = createMarkerRecord(marker, {
        fallbackId: `marker-${index}`,
        order: index,
        entityKeyPrefix: 'marker',
        markerDefaults: this.defaults.markers
      });
      nextMarker.bindings = resolveMergedObject(this.defaults.markers.bindings, nextMarker.itemBindings);
      nextMarker.interaction = resolveInteractionConfig(this.defaults.markers.interaction, nextMarker.itemInteraction);
      nextMarker.tooltip = Object.prototype.hasOwnProperty.call(nextMarker, 'itemTooltip') ? nextMarker.itemTooltip : nextMarker.tooltip;
      nextMarker.bindingContext = createLayerBindingContext({ marker: nextMarker });
      return nextMarker;
    });
    this.markerOrderCursor = this.markers.length;
    this.refreshProjectedFeatures({ resetView: false, preserveBaseTransform: true });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  addMarker(marker) {
    const order = this.markerOrderCursor++;
    const next = createMarkerRecord(marker, {
      fallbackId: `marker-${order + 1}`,
      order,
      entityKeyPrefix: 'marker',
      markerDefaults: this.defaults.markers
    });
    next.bindings = resolveMergedObject(this.defaults.markers.bindings, next.itemBindings);
    next.interaction = resolveInteractionConfig(this.defaults.markers.interaction, next.itemInteraction);
    next.tooltip = Object.prototype.hasOwnProperty.call(next, 'itemTooltip') ? next.itemTooltip : next.tooltip;
    next.bindingContext = createLayerBindingContext({ marker: next });
    this.markers.push(next);
    this.refreshProjectedFeatures({ resetView: false, preserveBaseTransform: true });
    this.render();
    return next;
  }

  clearMarkers() {
    this.markers = [];
    this.refreshProjectedFeatures({ resetView: false, preserveBaseTransform: true });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  setLines(lines = []) {
    this.lines = lines.map((line, index) => ({
      id: line.id ?? `line-${index}`,
      coordinates: (line.coordinates ?? []).map(clonePoint),
      markerRefs: normalizeLineMarkerRefs(line.markerRefs),
      pathMode: normalizeLinePathMode(line.pathMode),
      data: line.data,
      region: line.region ?? null,
      properties: line.properties ?? {},
      style: line.style ?? {},
      hoverStyle: line.hoverStyle ?? {},
      bindings: resolveMergedObject(this.defaults.lines.bindings, line.bindings && typeof line.bindings === 'object' ? { ...line.bindings } : {}),
      tooltip: line.tooltip,
      itemBindings: line.itemBindings && typeof line.itemBindings === 'object'
        ? { ...line.itemBindings }
        : (line.bindings && typeof line.bindings === 'object' ? { ...line.bindings } : {}),
      itemTooltip: Object.prototype.hasOwnProperty.call(line, 'itemTooltip') ? line.itemTooltip : line.tooltip,
      lineDefaults: this.defaults.lines,
      order: index,
      entityKey: `line:${line.id ?? `line-${index}`}:${index}`,
      bindingContext: null
    }));
    this.lines.forEach((line) => {
      line.bindingContext = createLayerBindingContext({ line });
    });
    this.lineOrderCursor = this.lines.length;
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  addLine(line) {
    const id = line.id ?? `line-${this.lineOrderCursor + 1}`;
    const order = this.lineOrderCursor++;
    const next = {
      id,
      coordinates: (line.coordinates ?? []).map(clonePoint),
      markerRefs: normalizeLineMarkerRefs(line.markerRefs),
      pathMode: normalizeLinePathMode(line.pathMode),
      data: line.data,
      region: line.region ?? null,
      properties: line.properties ?? {},
      style: line.style ?? {},
      hoverStyle: line.hoverStyle ?? {},
      bindings: resolveMergedObject(this.defaults.lines.bindings, line.bindings && typeof line.bindings === 'object' ? { ...line.bindings } : {}),
      tooltip: line.tooltip,
      itemBindings: line.itemBindings && typeof line.itemBindings === 'object'
        ? { ...line.itemBindings }
        : (line.bindings && typeof line.bindings === 'object' ? { ...line.bindings } : {}),
      itemTooltip: Object.prototype.hasOwnProperty.call(line, 'itemTooltip') ? line.itemTooltip : line.tooltip,
      lineDefaults: this.defaults.lines,
      order,
      entityKey: `line:${id}:${order}`
    };
    next.bindingContext = createLayerBindingContext({ line: next });
    this.lines.push(next);
    this.render();
    return next;
  }

  buildMarkerReferenceIndex({ globalMarkers = this.markers, layers = this.layers } = {}) {
    const globalMarkerIndex = new Map();
    (globalMarkers ?? []).forEach((marker) => {
      const markerId = String(marker?.id ?? '').trim();
      if (markerId) {
        globalMarkerIndex.set(markerId, marker);
      }
    });

    const layerMarkerIndex = new Map();
    (layers ?? []).forEach((layer) => {
      const layerId = String(layer?.id ?? '').trim();
      if (!layerId) {
        return;
      }
      const markerIndex = new Map();
      (layer.markers ?? []).forEach((marker) => {
        const markerId = String(marker?.id ?? '').trim();
        if (markerId) {
          markerIndex.set(markerId, marker);
        }
      });
      layerMarkerIndex.set(layerId, markerIndex);
    });

    return {
      globalMarkers: globalMarkerIndex,
      layerMarkers: layerMarkerIndex
    };
  }

  resolveLineMarkerCoordinates(line, markerReferenceIndex = this.buildMarkerReferenceIndex()) {
    const refs = normalizeLineMarkerRefs(line?.markerRefs);
    if (!refs.length) {
      return null;
    }

    const coordinates = refs.reduce((points, ref) => {
      const marker = ref.layerId
        ? markerReferenceIndex.layerMarkers.get(ref.layerId)?.get(ref.markerId)
        : markerReferenceIndex.globalMarkers.get(ref.markerId);
      if (!marker) {
        return points;
      }

      const lon = Number(marker.displayLon ?? marker.lon);
      const lat = Number(marker.displayLat ?? marker.lat);
      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        points.push([lon, lat]);
      }
      return points;
    }, []);

    return coordinates.length >= 2 ? coordinates : null;
  }

  resolveLinePathMode(line) {
    return normalizeLinePathMode(line?.pathMode) ?? (this.isGlobeProjection() ? 'geodesic' : 'polyline');
  }

  resolveLineDisplayCoordinates(layer, line, markerReferenceIndex = this.buildMarkerReferenceIndex()) {
    return this.resolveLineMarkerCoordinates(line, markerReferenceIndex)
      ?? this.transformCoordinatesForLayer(layer, line.coordinates);
  }

  resolveLineRenderCoordinates(line, markerReferenceIndex = this.buildMarkerReferenceIndex()) {
    return this.resolveLineMarkerCoordinates(line, markerReferenceIndex)
      ?? line.displayCoordinates
      ?? line.coordinates
      ?? [];
  }

  clearLines() {
    this.lines = [];
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  setTooltipOptions(options = {}) {
    this.tooltipOptions = normalizeTooltipOptions({ ...this.tooltipOptions, ...options });
    this.applyTooltipClassName();
    this.applyTooltipPointerBehavior();
    this.applyTooltipInlineStyle();
    if (!this.tooltipOptions.enabled) {
      this.hideTooltip();
    } else if (this.tooltipState.payload) {
      this.showTooltip(this.tooltipState.payload, this.tooltipState.anchorPoint);
    }
    return this;
  }

  setLegendOptions(options = {}) {
    if (options === false || options == null) {
      this.legendOptions = normalizeLegendOptions(false);
    } else {
      this.legendOptions = normalizeLegendOptions({
        ...this.legendOptions,
        ...options
      });
    }
    this.legendRenderKey = null;
    this.render();
    return this;
  }

  setDefaults(defaults = {}) {
    this.defaults = mergeEntityDefaultsState(this.defaults, normalizeEntityDefaults(defaults));
    this.rehydrateGlobalCollections();
    this.layers.forEach((layer) => this.rehydrateLayerCollections(layer));
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  setLayerDefaults(layerId, defaults = {}) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }

    layer.defaults = mergeEntityDefaultsState(layer.defaults, normalizeEntityDefaults(defaults));
    this.rehydrateLayerCollections(layer);
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  setLayerTooltipOptions(layerId, tooltip = {}) {
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return this;
    }

    if (isNullish(tooltip)) {
      layer.tooltip = undefined;
    } else {
      layer.tooltip = normalizeLayerTooltipOptions({
        ...(layer.tooltip ?? {}),
        ...(tooltip ?? {})
      });
    }
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  setViewOptions(view = {}, options = {}) {
    const controls = view.controls && typeof view.controls === 'object' ? view.controls : {};
    const gestures = view.gestures && typeof view.gestures === 'object' ? view.gestures : {};
    let projectionChanged = false;
    let cameraOptionChanged = false;

    if (Object.prototype.hasOwnProperty.call(view, 'projection')) {
      this.options.projection = normalizeProjectionName(view.projection);
      this.currentProjection = createProjection(this.options.projection);
      projectionChanged = true;
    }
    if (Object.prototype.hasOwnProperty.call(view, 'initialZoom')) {
      this.options.initialZoom = view.initialZoom;
      cameraOptionChanged = true;
    }
    if (Object.prototype.hasOwnProperty.call(view, 'initialCenter')) {
      this.options.initialCenter = view.initialCenter ?? null;
      cameraOptionChanged = true;
    }
    if (Object.prototype.hasOwnProperty.call(view, 'minZoom')) {
      this.options.minZoom = Number(view.minZoom ?? DEFAULT_MIN_ZOOM);
      cameraOptionChanged = true;
    }
    if (Object.prototype.hasOwnProperty.call(view, 'maxZoom')) {
      this.options.maxZoom = Number(view.maxZoom ?? DEFAULT_MAX_ZOOM);
      cameraOptionChanged = true;
    }
    if (Object.prototype.hasOwnProperty.call(controls, 'enabled')) {
      this.options.showControls = Boolean(controls.enabled);
    }
    if (Object.prototype.hasOwnProperty.call(controls, 'position')) {
      this.options.controlsPosition = normalizeControlsPosition(controls.position);
    }
    if (Object.prototype.hasOwnProperty.call(controls, 'homeIconSvg')) {
      this.options.homeIconSvg = normalizeInlineSvgMarkup(controls.homeIconSvg);
    }
    if (Object.prototype.hasOwnProperty.call(gestures, 'panEnabled')) {
      this.options.panEnabled = Boolean(gestures.panEnabled);
    }
    if (Object.prototype.hasOwnProperty.call(gestures, 'pinchZoomEnabled')) {
      this.options.pinchZoomEnabled = Boolean(gestures.pinchZoomEnabled);
    }
    if (Object.prototype.hasOwnProperty.call(gestures, 'doubleTapZoomEnabled')) {
      this.options.doubleTapZoomEnabled = Boolean(gestures.doubleTapZoomEnabled);
    }
    if (Object.prototype.hasOwnProperty.call(gestures, 'scrollWheelZoomEnabled')) {
      this.options.scrollWheelZoomEnabled = Boolean(gestures.scrollWheelZoomEnabled);
    }
    if (Object.prototype.hasOwnProperty.call(view, 'animationDuration')) {
      this.options.animationDuration = Number(view.animationDuration ?? DEFAULT_ANIMATION_DURATION);
    }
    if (Object.prototype.hasOwnProperty.call(view, 'hoverTransitionDuration')) {
      this.options.hoverTransitionDuration = Math.max(0, Number(view.hoverTransitionDuration ?? DEFAULT_HOVER_TRANSITION_DURATION));
    }
    if (Object.prototype.hasOwnProperty.call(view, 'hoverTrail')) {
      this.options.hoverTrail = (view.hoverTrail ?? DEFAULT_HOVER_TRAIL) !== false;
      if (this.options.hoverTrail === false && this.hoverTransitions?.size) {
        this.hoverTransitions.forEach((_, key) => {
          if (key !== getHoverIdentity(this.hoverTarget)) {
            this.hoverTransitions.delete(key);
          }
        });
        this.render();
      }
    }
    if (Object.prototype.hasOwnProperty.call(view, 'hoverRegionToFront')) {
      this.options.hoverRegionToFront = view.hoverRegionToFront === true;
    }
    if (Object.prototype.hasOwnProperty.call(view, 'zoomStep')) {
      this.options.zoomStep = Number(view.zoomStep ?? DEFAULT_ZOOM_STEP);
    }
    if (Object.prototype.hasOwnProperty.call(view, 'restoreLayerVisibilityOnHome')) {
      this.options.restoreLayerVisibilityOnHome = Boolean(view.restoreLayerVisibilityOnHome);
    }

    if (typeof this.updateHomeButtonIcon === 'function') {
      this.updateHomeButtonIcon();
    }
    this.updateControlsVisibility();
    this.applyPanBehavior();

    if (projectionChanged) {
      this.refreshProjectedFeatures({ resetView: options.resetView !== false });
      this.hoverTarget = null;
      this.hideTooltip();
      this.render();
      return this;
    }

    if (cameraOptionChanged) {
      this.updateHomeView({ resetView: false });
      this.view = this.clampView(this.view);
      this.render();
      return this;
    }

    return this;
  }

  setMarkerLabelOptions(markerLabels = {}) {
    this.options.markerLabels = normalizeMarkerLabelOptions(markerLabels);
    return this.setDefaults({
      markers: {
        labels: markerLabels
      }
    });
  }

  setMarkerClusterOptions(markerClusters = {}) {
    this.options.markerClusters = normalizeMarkerClusterOptions(markerClusters);
    return this.setDefaults({
      markers: {
        clusters: markerClusters
      }
    });
  }

  setHoverTargetStyles({ hoverFeatureStyle, hoverMarkerStyle } = {}) {
    this.options.hoverFeatureStyle = hoverFeatureStyle ?? this.options.hoverFeatureStyle;
    this.options.hoverMarkerStyle = hoverMarkerStyle ?? this.options.hoverMarkerStyle;
    this.render();
    return this;
  }

  setControlsOptions({ showControls, controlsPosition, homeIconSvg } = {}) {
    return this.setViewOptions({
      controls: {
        ...(showControls !== undefined ? { enabled: showControls } : {}),
        ...(controlsPosition !== undefined ? { position: controlsPosition } : {}),
        ...(homeIconSvg !== undefined ? { homeIconSvg } : {})
      }
    });
  }

  setPolygonFilter({ layerId = null, includePolygonIds, excludePolygonIds } = {}) {
    const targetLayers = layerId == null
      ? this.layers
      : this.layers.filter((layer) => layer.id === layerId);

    targetLayers.forEach((layer) => {
      if (includePolygonIds !== undefined) {
        layer.includePolygonIds = createIdSet(includePolygonIds);
      }
      if (excludePolygonIds !== undefined) {
        layer.excludePolygonIds = createIdSet(excludePolygonIds);
      }
    });
    this.refreshProjectedFeatures({ resetView: true });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  setProjection(projection, options = {}) {
    return this.setViewOptions({ projection }, options);
  }

  setPanEnabled(enabled) {
    return this.setInteractionOptions({ panEnabled: enabled });
  }

  setInteractionOptions({
    panEnabled,
    pinchZoomEnabled,
    doubleTapZoomEnabled,
    scrollWheelZoomEnabled
  } = {}) {
    return this.setViewOptions({
      gestures: {
        ...(panEnabled !== undefined ? { panEnabled } : {}),
        ...(pinchZoomEnabled !== undefined ? { pinchZoomEnabled } : {}),
        ...(doubleTapZoomEnabled !== undefined ? { doubleTapZoomEnabled } : {}),
        ...(scrollWheelZoomEnabled !== undefined ? { scrollWheelZoomEnabled } : {})
      }
    });
  }

  zoomIn(step = this.options.zoomStep, options = {}) {
    return this.setZoom(this.view.zoom * Number(step || this.options.zoomStep), {
      ...options,
      zoomEventTrigger: options.zoomEventTrigger ?? 'zoomIn'
    });
  }

  zoomOut(step = this.options.zoomStep, options = {}) {
    return this.setZoom(this.view.zoom / Number(step || this.options.zoomStep), {
      ...options,
      zoomEventTrigger: options.zoomEventTrigger ?? 'zoomOut'
    });
  }

  setZoom(zoom, options = {}) {
    const targetView = {
      zoom: normalizeZoom(zoom, this.options.minZoom, this.options.maxZoom),
      center: { ...this.view.center }
    };
    return this.animateToView(targetView, {
      ...options,
      zoomEventTrigger: options.zoomEventTrigger ?? 'setZoom'
    });
  }

  setCenter(center, options = {}) {
    const targetView = {
      zoom: this.view.zoom,
      center: normalizeCenter(center, this.view.center)
    };
    return this.animateToView(targetView, options);
  }

  resetView(options = {}) {
    const shouldRestoreLayerVisibility = options.restoreLayerVisibility ?? this.options.restoreLayerVisibilityOnHome;
    if (typeof this.hideBuiltInActionUi === 'function') {
      this.hideBuiltInActionUi({ immediate: true });
    } else {
      this.closeBuiltInActionUi();
    }
    if (shouldRestoreLayerVisibility) {
      this.restoreHomeLayerVisibility();
    }

    return this.animateToView({
      zoom: this.homeView.zoom,
      center: { ...this.homeView.center }
    }, {
      ...options,
      zoomEventTrigger: options.zoomEventTrigger ?? 'resetView'
    });
  }

  restoreHomeLayerVisibility() {
    if (!this.homeLayerVisibility.size) {
      return this;
    }

    this.clearLayerFadeTransitions();
    this.layers.forEach((layer) => {
      if (this.homeLayerVisibility.has(layer.id)) {
        layer.visible = this.homeLayerVisibility.get(layer.id);
      }
    });
    this.refreshProjectedFeatures({ resetView: false });
    this.hoverTarget = null;
    this.hideTooltip();
    this.render();
    return this;
  }

  fitProjectedBounds(bounds, options = {}) {
    if (!bounds) {
      return this;
    }

    const padding = Math.max(0, Number(options.padding ?? 24));
    const maxZoom = options.maxZoom == null
      ? this.options.maxZoom
      : Math.min(this.options.maxZoom, Number(options.maxZoom));
    const minZoom = options.minZoom == null
      ? this.options.minZoom
      : Math.max(this.options.minZoom, Number(options.minZoom));

    if (this.isGlobeProjection()) {
      const targetCenter = {
        lon: wrapLongitude((bounds.minX + bounds.maxX) / 2),
        lat: clamp((bounds.minY + bounds.maxY) / 2, -89.999, 89.999)
      };
      const circleTransform = createFitTransform(GLOBE_BOUNDS, this.width, this.height, this.options.padding);
      const projectedEntries = (options.globeEntries ?? [])
        .map((entry) => ({
          projectedCoordinates: this.projectFeatureEntryForView(entry, targetCenter)
        }))
        .filter((entry) => hasProjectedGeometry(entry.projectedCoordinates));
      let targetZoom = clamp(this.view.zoom, minZoom, maxZoom);

      if (projectedEntries.length > 0) {
        const projectedBounds = collectProjectedBounds(projectedEntries);
        const topLeft = circleTransform.project(projectedBounds.minX, projectedBounds.maxY);
        const bottomRight = circleTransform.project(projectedBounds.maxX, projectedBounds.minY);
        const featureWidth = Math.max(1e-9, Math.abs(bottomRight.x - topLeft.x));
        const featureHeight = Math.max(1e-9, Math.abs(bottomRight.y - topLeft.y));
        targetZoom = clamp(
          Math.min(
            Math.max(1, (this.width - padding * 2) / featureWidth),
            Math.max(1, (this.height - padding * 2) / featureHeight)
          ),
          minZoom,
          maxZoom
        );
      }

      return this.animateToView({
        zoom: targetZoom,
        center: targetCenter
      }, {
        ...options,
        zoomEventTrigger: options.zoomEventTrigger ?? 'fitProjectedBounds'
      });
    }

    const topLeft = this.baseTransform.project(bounds.minX, bounds.maxY);
    const bottomRight = this.baseTransform.project(bounds.maxX, bounds.minY);
    const featureWidth = Math.max(1e-9, Math.abs(bottomRight.x - topLeft.x));
    const featureHeight = Math.max(1e-9, Math.abs(bottomRight.y - topLeft.y));
    const targetZoom = clamp(
      Math.min(
        Math.max(1, (this.width - padding * 2) / featureWidth),
        Math.max(1, (this.height - padding * 2) / featureHeight)
      ),
      minZoom,
      maxZoom
    );
    const projectedCenter = computeCenterFromBounds(bounds);
    const targetCenter = invertProjection(this.currentProjection, projectedCenter.lon, projectedCenter.lat, this.view.center);

    return this.animateToView({
      zoom: targetZoom,
      center: targetCenter
    }, {
      ...options,
      zoomEventTrigger: options.zoomEventTrigger ?? 'fitProjectedBounds'
    });
  }

  zoomToFeature(targetOrPayload, options = {}) {
    const entries = this.findFeatureEntriesForTarget(targetOrPayload);
    if (!entries.length) {
      if (typeof options.onComplete === 'function') {
        options.onComplete(this.view, this);
      }
      return this;
    }

    const bounds = this.isGlobeProjection()
      ? computeBounds(entries)
      : collectProjectedBounds(entries);
    return this.fitProjectedBounds(bounds, {
      ...options,
      globeEntries: this.isGlobeProjection() ? entries : undefined,
      zoomEventTrigger: options.zoomEventTrigger ?? 'zoomToFeature',
      padding: options.padding ?? options.zoomPadding ?? 24
    });
  }

  zoomToMarker(targetOrPayload, options = {}) {
    if (targetOrPayload?.clusterData) {
      const clusterZoom = options.zoomScale == null
        ? targetOrPayload.clusterOptions?.zoomScale == null
          ? Math.min(this.options.maxZoom, Math.max(this.view.zoom * this.options.zoomStep * 2, this.view.zoom + 1))
          : Number(targetOrPayload.clusterOptions.zoomScale)
        : Number(options.zoomScale);
      const maxZoom = options.maxZoom == null ? this.options.maxZoom : Number(options.maxZoom);
      return this.animateToView({
        zoom: clamp(clusterZoom, this.options.minZoom, maxZoom),
        center: {
          lon: Number(targetOrPayload.clusterData.center?.lon ?? targetOrPayload.lon),
          lat: Number(targetOrPayload.clusterData.center?.lat ?? targetOrPayload.lat)
        }
      }, {
        ...options,
        zoomEventTrigger: options.zoomEventTrigger ?? 'zoomToMarker'
      });
    }

    const marker = this.findMarkerForTarget(targetOrPayload);
    if (!marker) {
      if (typeof options.onComplete === 'function') {
        options.onComplete(this.view, this);
      }
      return this;
    }

    const scaleZoom = options.zoomScale == null ? 4 : Number(options.zoomScale);
    const maxZoom = options.maxZoom == null ? this.options.maxZoom : Number(options.maxZoom);
    return this.animateToView({
      zoom: clamp(scaleZoom, this.options.minZoom, maxZoom),
      center: { lon: marker.lon, lat: marker.lat }
    }, {
      ...options,
      zoomEventTrigger: options.zoomEventTrigger ?? 'zoomToMarker'
    });
  }

  getView() {
    return {
      zoom: this.view.zoom,
      center: { ...this.view.center },
      home: {
        zoom: this.homeView.zoom,
        center: { ...this.homeView.center },
        explicit: this.homeView.explicit
      },
      projection: this.options.projection,
      panEnabled: this.options.panEnabled,
      layers: this.layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        order: layer.order
      }))
    };
  }

  stopAnimation(commitCurrent = true) {
    if (!this.animationState) {
      return this;
    }

    if (commitCurrent) {
      this.commitAnimationFrame(performance.now());
    }

    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.animationState = null;
    return this;
  }

  snapshotView(view = this.view) {
    return cloneViewState(view);
  }

  emitZoomEnd(previousView, nextView, trigger = null) {
    if (!didZoomChange(previousView, nextView)) {
      return;
    }

    this.emit('zoomend', {
      zoom: nextView.zoom,
      previousZoom: previousView.zoom,
      center: { ...nextView.center },
      previousCenter: { ...previousView.center },
      trigger
    });
  }

  animateToView(targetView, options = {}) {
    const animate = options.animate !== false;
    const duration = Number(options.duration ?? this.options.animationDuration);

    if (typeof this.clearClusterExpansionTransitions === 'function') {
      this.clearClusterExpansionTransitions();
    }
    this.stopAnimation(true);

    const previousView = this.snapshotView();
    const normalizedTarget = this.clampView({
      zoom: normalizeZoom(targetView.zoom, this.options.minZoom, this.options.maxZoom),
      center: normalizeCenter(targetView.center, this.view.center)
    });

    if (!animate || duration <= 0) {
      this.view = normalizedTarget;
      this.render();
      this.emitZoomEnd(previousView, this.view, options.zoomEventTrigger ?? null);
      if (typeof options.onComplete === 'function') {
        options.onComplete(this.view, this);
      }
      return this;
    }

    const startTime = performance.now();
    this.animationState = createAnimationState(
      previousView,
      normalizedTarget,
      duration,
      startTime,
      {
        zoomEventTrigger: options.zoomEventTrigger ?? null,
        fromAnchor: this.getViewAnchor?.(previousView) ?? null,
        toAnchor: this.getViewAnchor?.(normalizedTarget) ?? null,
        onComplete: typeof options.onComplete === 'function' ? options.onComplete : null
      }
    );

    const step = (time) => {
      const state = this.animationState;
      if (!state) {
        return;
      }

      const completed = this.commitAnimationFrame(time);
      this.render();
      if (completed) {
        this.emitZoomEnd(state.from, state.to, state.zoomEventTrigger ?? null);
        if (typeof state.onComplete === 'function') {
          state.onComplete(state.to, this);
        }
        this.animationState = null;
        this.animationFrame = null;
        if (typeof this.scheduleClusterExpansionFrame === 'function') {
          this.scheduleClusterExpansionFrame();
        }
        return;
      }

      this.animationFrame = requestAnimationFrame(step);
    };

    this.animationFrame = requestAnimationFrame(step);
    return this;
  }

  commitAnimationFrame(time) {
    const state = this.animationState;
    if (!state) {
      return true;
    }

    const progress = clamp((time - state.startTime) / state.duration, 0, 1);
    const eased = easeOutCubic(progress);
    this.view = interpolateAnimatedView(
      state,
      eased,
      this.currentProjection,
      this.baseTransform,
      { x: this.width / 2, y: this.height / 2 }
    );
    return progress >= 1;
  }

  pruneHoverTransitions(time = getNow()) {
    let active = false;

    this.hoverTransitions.forEach((transition, key) => {
      const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
      if (progress >= 1) {
        this.hoverTransitions.delete(key);
      } else {
        active = true;
      }
    });

    return active;
  }

  cancelLayerFade(layerId) {
    if (layerId == null) {
      return false;
    }
    return this.layerFadeTransitions.delete(String(layerId));
  }

  clearLayerFadeTransitions() {
    if (!this.layerFadeTransitions.size) {
      return false;
    }
    this.layerFadeTransitions.clear();
    if (this.layerFadeFrame != null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.layerFadeFrame);
      this.layerFadeFrame = null;
    }
    return true;
  }

  getLayerVisibilityOpacity(layerId, time = getNow()) {
    if (layerId == null) {
      return 1;
    }

    const transition = this.layerFadeTransitions.get(String(layerId));
    if (!transition) {
      return 1;
    }

    const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
    return 1 - progress;
  }

  pruneLayerFadeTransitions(time = getNow()) {
    if (!this.layerFadeTransitions.size) {
      return false;
    }

    let active = false;
    let changedVisibility = false;

    this.layerFadeTransitions.forEach((transition, layerId) => {
      const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
      if (progress >= 1) {
        this.layerFadeTransitions.delete(layerId);
        const layer = this.layers.find((candidate) => candidate.id === layerId);
        if (layer && layer.visible) {
          layer.visible = false;
          changedVisibility = true;
        }
      } else {
        active = true;
      }
    });

    if (changedVisibility) {
      this.refreshProjectedFeatures({ resetView: false, preserveBaseTransform: true });
      this.hoverTarget = null;
      this.hideTooltip();
    }

    return active;
  }

  scheduleLayerFadeFrame() {
    if (this.layerFadeFrame != null || this.layerFadeTransitions.size === 0 || typeof requestAnimationFrame !== 'function') {
      return;
    }

    const step = (time) => {
      this.layerFadeFrame = null;
      const active = this.pruneLayerFadeTransitions(time);
      this.render();
      if (active) {
        this.layerFadeFrame = requestAnimationFrame(step);
      }
    };

    this.layerFadeFrame = requestAnimationFrame(step);
  }

  startLayerHideFade(layerIds = [], { duration = DEFAULT_LAYER_HIDE_FADE_DURATION } = {}) {
    const normalizedLayerIds = resolveLayerTargetIds(this.layers, layerIds);
    if (!normalizedLayerIds.length) {
      return this;
    }

    const safeDuration = Math.max(0, Number(duration ?? DEFAULT_LAYER_HIDE_FADE_DURATION));
    if (safeDuration <= 0 || typeof requestAnimationFrame !== 'function') {
      normalizedLayerIds.forEach((layerId) => this.setLayerVisibility(layerId, false));
      return this;
    }

    const startTime = getNow();
    normalizedLayerIds.forEach((layerId) => {
      const layer = this.layers.find((candidate) => candidate.id === layerId);
      if (!layer) {
        return;
      }
      layer.visible = true;
      this.layerFadeTransitions.set(layerId, {
        layerId,
        startTime,
        duration: safeDuration
      });
    });

    this.scheduleLayerFadeFrame();
    this.render();
    return this;
  }

  clearClusterExpansionTransitions() {
    if (this.clusterExpansionFrame != null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.clusterExpansionFrame);
      this.clusterExpansionFrame = null;
    }
    const hadTransitions = Boolean(this.clusterExpansionTransitions?.size || this.clusterFadeTransitions?.size);
    this.clusterExpansionTransitions.clear();
    this.clusterFadeTransitions.clear();
    return hadTransitions;
  }

  pruneClusterExpansionTransitions(time = getNow()) {
    if (!this.clusterExpansionTransitions.size && !this.clusterFadeTransitions.size) {
      return false;
    }

    let active = false;
    this.clusterExpansionTransitions.forEach((transition, entityKey) => {
      const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
      if (progress >= 1) {
        this.clusterExpansionTransitions.delete(entityKey);
      } else {
        active = true;
      }
    });

    this.clusterFadeTransitions.forEach((transition, clusterId) => {
      const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
      if (progress >= 1) {
        this.clusterFadeTransitions.delete(clusterId);
      } else {
        active = true;
      }
    });
    return active;
  }

  scheduleClusterExpansionFrame() {
    if (
      this.clusterExpansionFrame != null
      || (!this.clusterExpansionTransitions.size && !this.clusterFadeTransitions.size)
      || this.animationState != null
      || typeof requestAnimationFrame !== 'function'
    ) {
      return;
    }

    const step = (time) => {
      this.clusterExpansionFrame = null;
      const active = this.pruneClusterExpansionTransitions(time);
      this.render();
      if (active) {
        this.clusterExpansionFrame = requestAnimationFrame(step);
      }
    };

    this.clusterExpansionFrame = requestAnimationFrame(step);
  }

  updateMarkerClusterTransitions(renderedLayerMarkers = [], renderedGlobalMarkers = { items: [] }, time = getNow()) {
    const currentClusters = new Map();
    const currentMarkers = new Map();
    const previousMarkers = this.previousRenderedVisibleMarkers ?? new Map();

    renderedLayerMarkers.forEach(({ rendered }) => {
      (rendered?.items ?? []).forEach((marker) => {
        if (marker.cluster) {
          currentClusters.set(marker.id, marker);
        } else {
          currentMarkers.set(marker.entityKey, marker);
        }
      });
    });
    (renderedGlobalMarkers.items ?? []).forEach((marker) => {
      if (marker.cluster) {
        currentClusters.set(marker.id, marker);
      } else {
        currentMarkers.set(marker.entityKey, marker);
      }
    });

    const previousZoom = Number(this.lastRenderedMarkerZoom);
    const currentZoom = Number(this.view.zoom);
    const zoomingIn = Number.isFinite(previousZoom) && currentZoom > previousZoom + 1e-9;
    const zoomingOut = Number.isFinite(previousZoom) && currentZoom < previousZoom - 1e-9;

    if (!this.prefersReducedMotion() && zoomingIn) {
      this.previousRenderedClusterMarkers.forEach((cluster, clusterId) => {
        if (currentClusters.has(clusterId)) {
          return;
        }

        const startPoint = cluster.clusterData?.screenPoint;
        if (!startPoint) {
          return;
        }

        let startedExpansion = false;
        (cluster.clusterData?.markers ?? []).forEach((member) => {
          const currentMarker = currentMarkers.get(member.entityKey);
          if (!currentMarker || previousMarkers.has(member.entityKey)) {
            return;
          }
          const point = this.projectPoint(
            currentMarker.displayLon ?? currentMarker.lon,
            currentMarker.displayLat ?? currentMarker.lat
          );
          if (!point || computeScreenDistance(startPoint, point) < 0.5) {
            return;
          }
          this.clusterExpansionTransitions.set(currentMarker.entityKey, {
            marker: currentMarker,
            phase: 'enter',
            center: {
              lon: Number(cluster.clusterData?.center?.lon ?? cluster.lon),
              lat: Number(cluster.clusterData?.center?.lat ?? cluster.lat)
            },
            startTime: time,
            duration: DEFAULT_CLUSTER_EXPANSION_DURATION
          });
          startedExpansion = true;
        });

        if (startedExpansion) {
          this.clusterFadeTransitions.set(clusterId, {
            marker: cluster,
            phase: 'out',
            startTime: time,
            duration: DEFAULT_CLUSTER_EXPANSION_DURATION
          });
        }
      });
    }

    if (!this.prefersReducedMotion() && zoomingOut) {
      currentClusters.forEach((cluster, clusterId) => {
        if (this.previousRenderedClusterMarkers.has(clusterId)) {
          return;
        }

        let startedCollapse = false;
        (cluster.clusterData?.markers ?? []).forEach((member) => {
          const previousMarker = previousMarkers.get(member.entityKey);
          if (!previousMarker || currentMarkers.has(member.entityKey)) {
            return;
          }
          this.clusterExpansionTransitions.set(member.entityKey, {
            marker: previousMarker,
            phase: 'exit',
            center: {
              lon: Number(cluster.clusterData?.center?.lon ?? cluster.lon),
              lat: Number(cluster.clusterData?.center?.lat ?? cluster.lat)
            },
            startTime: time,
            duration: DEFAULT_CLUSTER_EXPANSION_DURATION
          });
          startedCollapse = true;
        });

        if (startedCollapse) {
          this.clusterFadeTransitions.set(clusterId, {
            marker: cluster,
            phase: 'in',
            startTime: time,
            duration: DEFAULT_CLUSTER_EXPANSION_DURATION
          });
        }
      });
    }

    this.previousRenderedClusterMarkers = currentClusters;
    this.previousRenderedVisibleMarkers = currentMarkers;
    this.lastRenderedMarkerZoom = currentZoom;

    if (this.clusterExpansionTransitions.size || this.clusterFadeTransitions.size) {
      this.scheduleClusterExpansionFrame();
    }
  }

  drawMarkerClusterTransitionGhosts(time = getNow()) {
    this.clusterExpansionTransitions.forEach((transition) => {
      if (transition.phase !== 'exit' || !transition.marker) {
        return;
      }
      const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
      if (progress >= 1) {
        return;
      }
      const eased = easeOutCubic(progress);
      const startPoint = this.projectPoint(
        transition.marker.displayLon ?? transition.marker.lon,
        transition.marker.displayLat ?? transition.marker.lat
      );
      const endPoint = this.projectPoint(transition.center?.lon, transition.center?.lat);
      if (!startPoint || !endPoint) {
        return;
      }
      const point = {
        x: interpolateNumber(startPoint.x, endPoint.x, eased),
        y: interpolateNumber(startPoint.y, endPoint.y, eased)
      };
      const style = {
        ...this.resolveMarkerStyle(transition.marker),
        opacity: Number(this.resolveMarkerStyle(transition.marker).opacity ?? 1) * (1 - eased)
      };
      this.drawMarkerVisual(transition.marker, point, style, null);
    });
  }

  drawMarkerClusterFadeTransitions(time = getNow()) {
    this.clusterFadeTransitions.forEach((transition) => {
      const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
      if (progress >= 1) {
        return;
      }
      if (transition.phase !== 'out') {
        return;
      }
      const fadeMultiplier = 1 - easeOutCubic(progress);
      const point = transition.marker.clusterData?.screenPoint ?? this.projectPoint(transition.marker.lon, transition.marker.lat);
      if (!point) {
        return;
      }
      const style = applyStyleOpacity(this.resolveMarkerStyle(transition.marker), fadeMultiplier);
      this.drawMarkerVisual(transition.marker, point, style, null);
    });
  }

  scheduleHoverTransitionFrame() {
    if (this.hoverTransitionFrame != null || this.hoverTransitions.size === 0 || typeof requestAnimationFrame !== 'function') {
      return;
    }

    const step = (time) => {
      this.hoverTransitionFrame = null;
      const active = this.pruneHoverTransitions(time);
      this.render();
      if (active) {
        this.hoverTransitionFrame = requestAnimationFrame(step);
      }
    };

    this.hoverTransitionFrame = requestAnimationFrame(step);
  }

  startHoverTransition(previousTarget, nextTarget) {
    const trailEnabled = this.options.hoverTrail !== false;
    const nextIdentity = getHoverIdentity(nextTarget);
    if (!trailEnabled && nextIdentity) {
      this.hoverTransitions.forEach((_, key) => {
        if (key !== nextIdentity) {
          this.hoverTransitions.delete(key);
        }
      });
    }

    const duration = Math.max(0, Number(this.options.hoverTransitionDuration ?? 0));
    if (duration <= 0) {
      return;
    }

    const time = getNow();
    const updateTarget = (target, to) => {
      const identity = getHoverIdentity(target);
      if (!identity) {
        return;
      }

      const from = this.getHoverStyleMix(target, time);
      if (Math.abs(from - to) < 1e-6) {
        this.hoverTransitions.delete(identity);
        return;
      }

      this.hoverTransitions.set(identity, {
        from,
        to,
        duration,
        startTime: time
      });
    };

    if (previousTarget && (trailEnabled || !nextTarget)) {
      updateTarget(previousTarget, 0);
    }
    if (nextTarget) {
      updateTarget(nextTarget, 1);
    }

    this.scheduleHoverTransitionFrame();
  }

  getHoverStyleMix(target, time = getNow()) {
    const identity = getHoverIdentity(target);
    if (!identity) {
      return 0;
    }

    const transition = this.hoverTransitions.get(identity);
    if (transition) {
      const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
      return interpolateNumber(transition.from, transition.to, easeInOutCubic(progress));
    }

    return this.isHovered(target) ? 1 : 0;
  }

  hideTooltip() {
    if (this.tooltipHideFrame) {
      cancelAnimationFrame(this.tooltipHideFrame);
      this.tooltipHideFrame = null;
    }
    this.tooltipState.visible = false;
    this.tooltipState.payload = null;
    this.tooltipState.anchorPoint = null;
    this.tooltipState.anchorPosition = null;
    if (this.tooltipElement) {
      this.tooltipElement.style.display = 'none';
      if (this.tooltipContentElement) {
        this.tooltipContentElement.innerHTML = '';
      } else {
        this.tooltipElement.innerHTML = '';
      }
    }
  }

  on(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new Error('GeoCanvas: event handler must be a function.');
    }

    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    const set = this.handlers.get(eventName);
    if (set) {
      set.delete(handler);
    }
  }

  emit(eventName, payload) {
    const set = this.handlers.get(eventName);
    if (!set) {
      return;
    }
    set.forEach((handler) => handler(payload));
  }

  resize(width, height) {
    const hasExplicitWidth = width !== undefined && width !== null;
    const hasExplicitHeight = height !== undefined && height !== null;
    const measuredSize = measureViewportSize(this.getViewportMeasurementElement(), this.canvas, this.width, this.height);
    const targetWidth = Number(hasExplicitWidth ? width : measuredSize.width) || this.width;
    const targetHeight = Number(hasExplicitHeight ? height : measuredSize.height) || this.height;

    this.width = Math.max(1, Math.round(targetWidth));
    this.height = Math.max(1, Math.round(targetHeight));
    this.dpr = Math.max(1, window.devicePixelRatio || 1);

    this.canvas.width = Math.max(1, Math.round(this.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(this.height * this.dpr));
    if (hasExplicitWidth) {
      this.canvas.style.width = `${this.width}px`;
    } else if (this.ownsCanvas) {
      this.canvas.style.width = '100%';
    }
    if (hasExplicitHeight) {
      this.canvas.style.height = `${this.height}px`;
    } else if (this.ownsCanvas) {
      this.canvas.style.height = '100%';
    }

    this.hitCanvas.width = Math.max(1, Math.round(this.width * this.dpr));
    this.hitCanvas.height = Math.max(1, Math.round(this.height * this.dpr));

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.hitCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (typeof this.clearClusterExpansionTransitions === 'function') {
      this.clearClusterExpansionTransitions();
    }
    this.baseTransform = createFitTransform(this.computeProjectedBounds(), this.width, this.height, this.options.padding);
    this.updateHomeView({ resetView: false });
    this.render();

    if (this.tooltipState.visible && this.tooltipState.payload && this.tooltipState.anchorPoint) {
      this.positionTooltip(this.tooltipState.anchorPoint);
    }
  }

  refreshProjectedFeatures({ resetView = true, preserveBaseTransform = false } = {}) {
    this.fullFeatureEntries = [];
    this.featureEntries = [];
    this.projectedFeatureEntries = [];
    this.visibleLayerMarkers = [];
    this.visibleLayerLines = [];
    const preparedLayers = [];

    this.layers.forEach((layer, index) => {
      const normalizedLayer = {
        ...layer,
        order: index
      };
      normalizedLayer.resolvedDefaults = resolveEntityDefaults(this.defaults, normalizedLayer.defaults);
      const { sourceRecord, fullFeatureEntries } = this.getLayerSourceEntries(normalizedLayer);
      normalizedLayer.source = sourceRecord;
      normalizedLayer.fullFeatureEntries = fullFeatureEntries.map((entry, entryIndex) => {
        const region = entry.filterId == null ? null : normalizedLayer.regions.get(String(entry.filterId)) ?? null;
        const bindings = resolveMergedObject(
          normalizedLayer.resolvedDefaults.regions.bindings,
          region?.bindings
        );
        const interaction = resolveInteractionConfig(
          normalizedLayer.resolvedDefaults.regions.interaction,
          region?.interaction
        );
        const resolvedData = (entry.data && typeof entry.data === 'object') || (region?.data && typeof region.data === 'object')
          ? resolveMergedObject(entry.data, region?.data)
          : (region?.data ?? entry.data);
        const nextEntry = {
          ...entry,
          order: entryIndex,
          source: sourceRecord,
          layerTooltip: normalizedLayer.tooltip,
          region,
          data: resolvedData,
          bindings,
          interaction,
          tooltip: region?.tooltip,
          explicitStyle: region?.style ?? {},
          explicitHoverStyle: region?.hoverStyle ?? {},
          layerRegionDefaults: normalizedLayer.resolvedDefaults.regions
        };
        nextEntry.bindingContext = createLayerBindingContext({
          layer: normalizedLayer,
          source: sourceRecord,
          feature: nextEntry
        });
        return nextEntry;
      });
      normalizedLayer.regionTransformIndex = this.buildLayerRegionTransformIndex(normalizedLayer);
      normalizedLayer.featureEntries = filterFeatureEntries(
        normalizedLayer.fullFeatureEntries,
        normalizedLayer.includePolygonIds,
        normalizedLayer.excludePolygonIds
      );
      preparedLayers.push({ layer, normalizedLayer, sourceRecord });
    });

    if (this.isGlobeProjection()) {
      preparedLayers.forEach(({ layer, normalizedLayer, sourceRecord }) => {
        normalizedLayer.projectedFeatureEntries = normalizedLayer.featureEntries
          .map((entry) => {
            const { projectedCoordinates, displayCoordinates } = this.projectLayerFeatureEntryForView(normalizedLayer, entry);
            if (!hasProjectedGeometry(projectedCoordinates)) {
              return null;
            }
            return {
              ...entry,
              displayCoordinates,
              projectedCoordinates
            };
          })
          .filter(Boolean);

        normalizedLayer.markers = normalizedLayer.markers.map((marker) => {
          const displayPoint = this.transformGeoPointForLayer(normalizedLayer, marker.lon, marker.lat);
          const nextMarker = {
            ...marker,
            source: sourceRecord,
            layerTooltip: normalizedLayer.tooltip,
            bindings: resolveMergedObject(normalizedLayer.resolvedDefaults.markers.bindings, marker.itemBindings ?? marker.bindings),
            interaction: resolveInteractionConfig(normalizedLayer.resolvedDefaults.markers.interaction, marker.itemInteraction ?? marker.interaction),
            tooltip: Object.prototype.hasOwnProperty.call(marker, 'itemTooltip') ? marker.itemTooltip : marker.tooltip,
            markerDefaults: normalizedLayer.resolvedDefaults.markers,
            displayLon: displayPoint?.lon ?? marker.lon,
            displayLat: displayPoint?.lat ?? marker.lat,
            displayRegionJoinId: displayPoint?.regionJoinId ?? null
          };
          nextMarker.bindingContext = createLayerBindingContext({
            layer: normalizedLayer,
            source: sourceRecord,
            marker: nextMarker
          });
          return nextMarker;
        });
      });

      const markerReferenceIndex = this.buildMarkerReferenceIndex({
        globalMarkers: this.markers,
        layers: preparedLayers.map(({ normalizedLayer }) => normalizedLayer)
      });

      preparedLayers.forEach(({ layer, normalizedLayer, sourceRecord }) => {
        normalizedLayer.lines = normalizedLayer.lines.map((line) => {
          const displayCoordinates = this.resolveLineDisplayCoordinates(normalizedLayer, line, markerReferenceIndex);
          const nextLine = {
            ...line,
            source: sourceRecord,
            layerTooltip: normalizedLayer.tooltip,
            bindings: resolveMergedObject(normalizedLayer.resolvedDefaults.lines.bindings, line.itemBindings ?? line.bindings),
            tooltip: Object.prototype.hasOwnProperty.call(line, 'itemTooltip') ? line.itemTooltip : line.tooltip,
            lineDefaults: normalizedLayer.resolvedDefaults.lines,
            displayCoordinates
          };
          nextLine.bindingContext = createLayerBindingContext({
            layer: normalizedLayer,
            source: sourceRecord,
            line: nextLine
          });
          return nextLine;
        });

        this.fullFeatureEntries.push(...normalizedLayer.fullFeatureEntries);
        if (normalizedLayer.visible) {
          this.featureEntries.push(...normalizedLayer.featureEntries);
          this.visibleLayerMarkers.push(...normalizedLayer.markers);
          this.visibleLayerLines.push(...normalizedLayer.lines);
        }
        Object.assign(layer, normalizedLayer);
      });

      this.lastComputedBounds = { ...GLOBE_BOUNDS };
      this.baseTransform = createFitTransform(GLOBE_BOUNDS, this.width, this.height, this.options.padding);
      this.updateHomeView({ resetView });
      this.refreshGlobeProjectionState();
      return;
    }

    this.currentProjection.fitEntries?.(
      preparedLayers
        .filter(({ normalizedLayer }) => normalizedLayer.visible)
        .flatMap(({ normalizedLayer }) => normalizedLayer.featureEntries ?? [])
    );

    preparedLayers.forEach(({ layer, normalizedLayer, sourceRecord }) => {
      normalizedLayer.projectedFeatureEntries = normalizedLayer.featureEntries
        .map((entry) => {
          const { projectedCoordinates, displayCoordinates } = this.projectLayerFeatureEntryForView(normalizedLayer, entry);
          if (!hasProjectedGeometry(projectedCoordinates)) {
            return null;
          }
          return {
            ...entry,
            displayCoordinates,
            projectedCoordinates
          };
        })
        .filter(Boolean);

      normalizedLayer.markers = normalizedLayer.markers.map((marker) => {
        const displayPoint = this.transformGeoPointForLayer(normalizedLayer, marker.lon, marker.lat);
        const nextMarker = {
          ...marker,
          source: sourceRecord,
          layerTooltip: normalizedLayer.tooltip,
          bindings: resolveMergedObject(normalizedLayer.resolvedDefaults.markers.bindings, marker.itemBindings ?? marker.bindings),
          interaction: resolveInteractionConfig(normalizedLayer.resolvedDefaults.markers.interaction, marker.itemInteraction ?? marker.interaction),
          tooltip: Object.prototype.hasOwnProperty.call(marker, 'itemTooltip') ? marker.itemTooltip : marker.tooltip,
          markerDefaults: normalizedLayer.resolvedDefaults.markers,
          displayLon: displayPoint?.lon ?? marker.lon,
          displayLat: displayPoint?.lat ?? marker.lat,
          displayRegionJoinId: displayPoint?.regionJoinId ?? null
        };
        nextMarker.bindingContext = createLayerBindingContext({
          layer: normalizedLayer,
          source: sourceRecord,
          marker: nextMarker
        });
        return nextMarker;
      });
    });

    const markerReferenceIndex = this.buildMarkerReferenceIndex({
      globalMarkers: this.markers,
      layers: preparedLayers.map(({ normalizedLayer }) => normalizedLayer)
    });

    preparedLayers.forEach(({ layer, normalizedLayer, sourceRecord }) => {
      normalizedLayer.lines = normalizedLayer.lines.map((line) => {
        const displayCoordinates = this.resolveLineDisplayCoordinates(normalizedLayer, line, markerReferenceIndex);
        const nextLine = {
          ...line,
          source: sourceRecord,
          layerTooltip: normalizedLayer.tooltip,
          bindings: resolveMergedObject(normalizedLayer.resolvedDefaults.lines.bindings, line.itemBindings ?? line.bindings),
          tooltip: Object.prototype.hasOwnProperty.call(line, 'itemTooltip') ? line.itemTooltip : line.tooltip,
          lineDefaults: normalizedLayer.resolvedDefaults.lines,
          displayCoordinates
        };
        nextLine.bindingContext = createLayerBindingContext({
          layer: normalizedLayer,
          source: sourceRecord,
          line: nextLine
        });
        return nextLine;
      });

      this.fullFeatureEntries.push(...normalizedLayer.fullFeatureEntries);
      if (normalizedLayer.visible) {
        this.featureEntries.push(...normalizedLayer.featureEntries);
        this.visibleLayerMarkers.push(...normalizedLayer.markers);
        this.visibleLayerLines.push(...normalizedLayer.lines);
        this.projectedFeatureEntries.push(...normalizedLayer.projectedFeatureEntries);
      }
      Object.assign(layer, normalizedLayer);
    });

    if (preserveBaseTransform) {
      return;
    }

    const boundsEntries = this.layers
      .filter((layer) => layer.visible && layer.contributeToBounds)
      .flatMap((layer) => layer.projectedFeatureEntries ?? []);

    if (boundsEntries.length > 0) {
      const bounds = computeBounds(boundsEntries, 'projectedCoordinates');
      this.lastComputedBounds = bounds;
      this.baseTransform = createFitTransform(bounds, this.width, this.height, this.options.padding);
      this.updateHomeView({ resetView });
    }
  }

  computeProjectedBounds() {
    if (this.isGlobeProjection()) {
      return { ...GLOBE_BOUNDS };
    }
    if (this.projectedFeatureEntries.length === 0) {
      return this.lastComputedBounds;
    }
    return computeBounds(this.projectedFeatureEntries, 'projectedCoordinates');
  }

  updateHomeView({ resetView = false } = {}) {
    if (this.isGlobeProjection()) {
      const hasExplicitHome = this.options.initialZoom !== undefined || this.options.initialCenter !== null;
      this.homeView = {
        zoom: hasExplicitHome ? normalizeZoom(this.options.initialZoom ?? 1, this.options.minZoom, this.options.maxZoom) : 1,
        center: hasExplicitHome ? normalizeCenter(this.options.initialCenter, { lon: 0, lat: 0 }) : { lon: 0, lat: 0 },
        explicit: hasExplicitHome
      };
      this.homeView = {
        ...this.clampView(this.homeView),
        explicit: hasExplicitHome
      };

      if (resetView) {
        this.view = {
          zoom: this.homeView.zoom,
          center: { ...this.homeView.center }
        };
      } else {
        this.view = this.clampView({
          zoom: normalizeZoom(this.view.zoom, this.options.minZoom, this.options.maxZoom),
          center: normalizeCenter(this.view.center, this.homeView.center)
        });
      }
      this.syncProjectionState();
      return;
    }

    const bounds = this.computeProjectedBounds();
    const projectedCenter = computeCenterFromBounds(bounds);
    const defaultCenter = invertProjection(this.currentProjection, projectedCenter.lon, projectedCenter.lat, this.view.center);
    const hasExplicitHome = this.options.initialZoom !== undefined || this.options.initialCenter !== null;

    this.homeView = {
      zoom: hasExplicitHome ? normalizeZoom(this.options.initialZoom ?? 1, this.options.minZoom, this.options.maxZoom) : 1,
      center: hasExplicitHome ? normalizeCenter(this.options.initialCenter, defaultCenter) : defaultCenter,
      explicit: hasExplicitHome
    };
    this.homeView = {
      ...this.clampView(this.homeView),
      explicit: hasExplicitHome
    };

    if (resetView) {
      this.view = {
        zoom: this.homeView.zoom,
        center: { ...this.homeView.center }
      };
    } else {
      this.view = this.clampView({
        zoom: normalizeZoom(this.view.zoom, this.options.minZoom, this.options.maxZoom),
        center: normalizeCenter(this.view.center, defaultCenter)
      });
    }
  }

  projectGeoPoint(lon, lat) {
    this.syncProjectionState();
    return this.currentProjection.forward(Number(lon), Number(lat));
  }

  inverseProjectedPoint(x, y, guess = this.view.center) {
    this.syncProjectionState();
    return invertProjection(this.currentProjection, x, y, guess);
  }

  getBaseAnchor() {
    if (this.isGlobeProjection()) {
      return this.baseTransform.project(0, 0);
    }
    const projectedCenter = this.projectGeoPoint(this.view.center.lon, this.view.center.lat);
    return this.baseTransform.project(projectedCenter.x, projectedCenter.y);
  }

  getViewAnchor(view) {
    if (this.isGlobeProjection()) {
      return this.baseTransform.project(0, 0);
    }
    const projectedCenter = this.projectGeoPoint(view.center.lon, view.center.lat);
    return this.baseTransform.project(projectedCenter.x, projectedCenter.y);
  }

  getGlobeScreenRadius(zoom = this.view.zoom) {
    const origin = this.baseTransform.project(0, 0);
    const edge = this.baseTransform.project(1, 0);
    return Math.abs(edge.x - origin.x) * zoom;
  }

  buildGlobeViewFromDrag(startCenter, deltaX, deltaY) {
    const radius = Math.max(this.getGlobeScreenRadius(), 1e-6);
    const lonDelta = (-deltaX / radius) * DEG;
    const latDelta = (deltaY / radius) * DEG;
    return this.clampView({
      zoom: this.view.zoom,
      center: {
        lon: wrapLongitude(startCenter.lon + lonDelta),
        lat: clamp(startCenter.lat + latDelta, -89.999, 89.999)
      }
    });
  }

  buildViewForZoomAtPoint(targetZoom, screenPoint, anchorGeo = null) {
    if (this.isGlobeProjection()) {
      return this.clampView({
        zoom: normalizeZoom(targetZoom, this.options.minZoom, this.options.maxZoom),
        center: { ...this.view.center }
      });
    }
    const zoom = normalizeZoom(targetZoom, this.options.minZoom, this.options.maxZoom);
    const point = {
      x: Math.max(0, Math.min(this.width, Number(screenPoint?.x) || 0)),
      y: Math.max(0, Math.min(this.height, Number(screenPoint?.y) || 0))
    };
    const pinnedGeo = anchorGeo ?? this.unprojectPoint(point.x, point.y);
    const projectedPinned = this.projectGeoPoint(pinnedGeo.lon, pinnedGeo.lat);
    const pinnedBase = this.baseTransform.project(projectedPinned.x, projectedPinned.y);
    const nextAnchor = {
      x: pinnedBase.x - (point.x - this.width / 2) / zoom,
      y: pinnedBase.y - (point.y - this.height / 2) / zoom
    };
    const projectedCenter = this.baseTransform.unproject(nextAnchor.x, nextAnchor.y);

    return this.clampView({
      zoom,
      center: this.inverseProjectedPoint(projectedCenter.lon, projectedCenter.lat, this.view.center)
    });
  }

  zoomAtPoint(targetZoom, screenPoint, options = {}) {
    return this.animateToView(this.buildViewForZoomAtPoint(targetZoom, screenPoint), {
      ...options,
      zoomEventTrigger: options.zoomEventTrigger ?? 'zoomAtPoint'
    });
  }

  getCameraClampBounds() {
    if (this.isGlobeProjection()) {
      return { ...GLOBE_BOUNDS };
    }
    const bounds = this.computeProjectedBounds();
    const topLeft = this.baseTransform.project(bounds.minX, bounds.maxY);
    const bottomRight = this.baseTransform.project(bounds.maxX, bounds.minY);
    return {
      minX: Math.min(topLeft.x, bottomRight.x),
      maxX: Math.max(topLeft.x, bottomRight.x),
      minY: Math.min(topLeft.y, bottomRight.y),
      maxY: Math.max(topLeft.y, bottomRight.y)
    };
  }

  clampView(view) {
    const zoom = normalizeZoom(view?.zoom, this.options.minZoom, this.options.maxZoom);
    const fallbackCenter = this.homeView?.center ?? this.view.center ?? { lon: 0, lat: 0 };
    const center = normalizeCenter(view?.center, fallbackCenter);

    if (this.isGlobeProjection()) {
      return {
        zoom,
        center: {
          lon: wrapLongitude(center.lon),
          lat: clamp(center.lat, -89.999, 89.999)
        }
      };
    }

    const projectedCenter = this.projectGeoPoint(center.lon, center.lat);
    const anchor = this.baseTransform.project(projectedCenter.x, projectedCenter.y);
    const clampedAnchor = clampCameraAnchor(
      anchor,
      this.getCameraClampBounds(),
      { width: this.width, height: this.height },
      zoom
    );

    if (Math.abs(clampedAnchor.x - anchor.x) < 1e-9 && Math.abs(clampedAnchor.y - anchor.y) < 1e-9) {
      return { zoom, center };
    }

    const clampedProjectedCenter = this.baseTransform.unproject(clampedAnchor.x, clampedAnchor.y);
    return {
      zoom,
      center: this.inverseProjectedPoint(clampedProjectedCenter.lon, clampedProjectedCenter.lat, center)
    };
  }

  projectPoint(lon, lat) {
    const projected = this.projectGeoPoint(lon, lat);
    if (this.isGlobeProjection() && projected.visible === false) {
      return null;
    }
    const basePoint = this.baseTransform.project(projected.x, projected.y);
    return applyCameraTransform(basePoint, this.getBaseAnchor(), { x: this.width / 2, y: this.height / 2 }, this.view.zoom);
  }

  unprojectPoint(x, y) {
    if (this.isGlobeProjection()) {
      const basePoint = invertCameraTransform(
        { x, y },
        this.getBaseAnchor(),
        { x: this.width / 2, y: this.height / 2 },
        this.view.zoom
      );
      const projectedPoint = this.baseTransform.unproject(basePoint.x, basePoint.y);
      return this.inverseProjectedPoint(projectedPoint.lon, projectedPoint.lat, this.view.center);
    }

    const basePoint = invertCameraTransform(
      { x, y },
      this.getBaseAnchor(),
      { x: this.width / 2, y: this.height / 2 },
      this.view.zoom
    );
    const projectedPoint = this.baseTransform.unproject(basePoint.x, basePoint.y);
    return this.inverseProjectedPoint(projectedPoint.lon, projectedPoint.lat, this.view.center);
  }

  render() {
    const renderTime = getNow();
    if (this.isGlobeProjection()) {
      this.refreshGlobeProjectionState();
    }
    this.pruneHoverTransitions(renderTime);
    this.pruneLayerFadeTransitions(renderTime);
    this.pruneClusterExpansionTransitions(renderTime);
    this.hitMap.clear();
    this.hitIdCursor = 1;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.hitCtx.clearRect(0, 0, this.width, this.height);

    if (this.options.background) {
      this.ctx.save();
      this.ctx.fillStyle = this.options.background;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }

    if (this.isGlobeProjection()) {
      this.drawGlobeShell();
    }

    const polygons = this.projectedFeatureEntries.filter((entry) => entry.kind === 'polygon');
    const featureLines = this.projectedFeatureEntries.filter((entry) => entry.kind === 'line');
    const points = this.projectedFeatureEntries.filter((entry) => entry.kind === 'point');

    this.getOrderedProjectedPolygons(polygons).forEach((entry) => this.drawProjectedPolygon(entry));
    featureLines.forEach((entry) => this.drawProjectedLine(entry));
    this.drawLayerLabels();
    this.visibleLayerLines.forEach((line) => this.drawCustomLine(line));
    this.lines.forEach((line) => this.drawCustomLine(line));
    points.forEach((entry) => this.drawProjectedPoint(entry));

    const renderedLayerMarkers = this.layers
      .filter((layer) => layer.visible)
      .map((layer) => ({
        layer,
        rendered: this.getRenderedMarkerCollection(layer.markers, {
          layerId: layer.id,
          layerName: layer.name,
          source: layer.source ?? null,
          bindings: layer.resolvedDefaults?.markers?.bindings ?? {},
          clusterOptions: layer.resolvedDefaults?.markers?.clusters ?? normalizeMarkerClusterOptions(false),
          interaction: layer.resolvedDefaults?.markers?.interaction ?? {},
          clusterIdPrefix: `cluster:${layer.id}`
        })
      }));
    const renderedGlobalMarkers = this.getRenderedMarkerCollection(this.markers, {
      layerId: null,
      layerName: null,
      source: null,
      bindings: this.defaults.markers.bindings ?? {},
      clusterOptions: resolveDisableableConfig(normalizeMarkerClusterOptions, this.defaults.markers.clusters),
      interaction: resolveInteractionConfig(this.defaults.markers.interaction),
      clusterIdPrefix: 'cluster:global'
    });

    this.updateMarkerClusterTransitions(renderedLayerMarkers, renderedGlobalMarkers, renderTime);
    this.drawMarkerClusterTransitionGhosts(renderTime);
    this.drawMarkerClusterFadeTransitions(renderTime);
    renderedLayerMarkers.forEach(({ rendered }) => {
      rendered.items.forEach((marker) => this.drawMarker(marker, renderTime));
    });
    renderedGlobalMarkers.items.forEach((marker) => this.drawMarker(marker, renderTime));
    this.drawMarkerLabels(renderedLayerMarkers, renderedGlobalMarkers, renderTime);
    if (this.hasActiveMarkerAnimations(renderedLayerMarkers, renderedGlobalMarkers, renderTime)) {
      this.scheduleMarkerAnimationFrame();
    } else {
      this.cancelMarkerAnimationFrame();
    }
    this.updateLegend();
  }

  drawGlobeShell() {
    const center = this.projectProjectedPoint(0, 0);
    const edge = this.projectProjectedPoint(1, 0);
    const radius = Math.hypot(edge.x - center.x, edge.y - center.y);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(47, 72, 96, 0.24)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.restore();
  }

  createRegionLabelHitTarget(entry, labels) {
    if (!entry || entry.kind !== 'polygon') {
      return null;
    }

    return {
      category: 'feature',
      id: entry.sourceId,
      layerId: entry.layerId,
      layerName: entry.layerName,
      geometryType: entry.geometryType,
      type: 'polygon',
      hitRole: 'label',
      regionJoinId: resolveRegionLabelJoinId(entry),
      properties: entry.properties,
      data: entry.data,
      region: entry.region,
      layer: { id: entry.layerId, name: entry.layerName },
      source: entry.source ? { id: entry.source.id, name: entry.source.name } : null,
      tooltipBinding: entry.bindings?.tooltip ?? entry.tooltip ?? null,
      layerTooltip: entry.layerTooltip ?? null,
      interaction: entry.interaction ?? {},
      style: this.resolveFeatureStyle(entry),
      entityKey: entry.entityKey,
      hoverKey: entry.hoverKey,
      order: entry.order,
      interactive: isFeatureInteractive(entry),
      labelOptions: labels
    };
  }

  resolveRegionLabelAnchor(entries, labels) {
    const representative = entries[0];
    const customPosition = resolveRegionLabelPosition(representative, labels);
    if (customPosition) {
      return this.projectGeoPoint(customPosition.lon, customPosition.lat);
    }
    return computeLabelAnchor(entries);
  }

  drawLayerLabels() {
    if (this.isGlobeProjection()) {
      return;
    }

    this.layers.forEach((layer) => {
      const labels = layer.resolvedDefaults?.regions?.labels ?? normalizeLabelOptions(false);
      const layerOpacity = this.getLayerVisibilityOpacity(layer.id);
      if (!layer.visible || !labels?.enabled || layerOpacity <= 0) {
        return;
      }

      if (labels.minZoom != null && this.view.zoom < labels.minZoom) {
        return;
      }
      if (labels.maxZoom != null && this.view.zoom > labels.maxZoom) {
        return;
      }

      const grouped = new Map();
      (layer.projectedFeatureEntries ?? [])
        .filter((entry) => entry.kind === 'polygon')
        .forEach((entry) => {
          const key = getHoverIdentity(entry) ?? entry.entityKey;
          if (!grouped.has(key)) {
            grouped.set(key, []);
          }
          grouped.get(key).push(entry);
        });

      grouped.forEach((entries) => {
        const representative = entries[0];
        const anchor = this.resolveRegionLabelAnchor(entries, labels);
        const text = computeLabelText(representative, labels);
        if (!anchor || !text) {
          return;
        }
        this.drawLabel(text, anchor, labels, layerOpacity, {
          hitTarget: this.createRegionLabelHitTarget(representative, labels)
        });
      });
    });
  }

  drawLabel(text, projectedAnchor, labels, opacity = 1, options = {}) {
    const screenPoint = this.projectProjectedPoint(projectedAnchor.x, projectedAnchor.y);
    this.drawScreenLabel(text, screenPoint, labels, opacity, {
      ...options,
      projectedAnchor
    });
  }

  drawScreenLabel(text, screenPoint, labels, opacity = 1, options = {}) {
    this.ctx.save();
    this.ctx.globalAlpha = Math.max(0, Number.isFinite(opacity) ? opacity : 1);
    this.ctx.font = labels.font;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const metrics = this.ctx.measureText(text);
    const width = metrics.width + labels.paddingX * 2;
    const fontSize = Number.parseFloat(labels.font) || 12;
    const height = fontSize + labels.paddingY * 2;
    const hitTarget = options.hitTarget ?? null;
    const hitId = hitTarget
      ? this.allocateHitTarget({
        ...hitTarget,
        labelScreenPoint: { x: screenPoint.x, y: screenPoint.y },
        labelProjectedAnchor: options.projectedAnchor
          ? { x: options.projectedAnchor.x, y: options.projectedAnchor.y }
          : null
      })
      : null;

    if (labels.background) {
      this.ctx.fillStyle = labels.background;
      this.drawRoundedRectPath(
        this.ctx,
        screenPoint.x - width / 2,
        screenPoint.y - height / 2,
        width,
        height,
        labels.borderRadius
      );
      this.ctx.fill();
    }

    this.ctx.fillStyle = labels.color;
    this.ctx.fillText(text, screenPoint.x, screenPoint.y);
    this.ctx.restore();

    if (hitId != null) {
      this.paintLabelHitArea(screenPoint, width, height, labels, hitId);
    }
  }

  drawMarkerLabels(renderedLayerMarkers = [], renderedGlobalMarkers = { items: [] }, time = getNow()) {
    renderedLayerMarkers.forEach(({ layer, rendered }) => {
      const markerLabels = layer.resolvedDefaults?.markers?.labels ?? normalizeMarkerLabelOptions(false);
      const layerOpacity = this.getLayerVisibilityOpacity(layer.id);
      if (!markerLabels?.enabled || layerOpacity <= 0) {
        return;
      }
      this.drawMarkerLabelCollection(rendered.items, markerLabels, layerOpacity, time);
    });

    const globalMarkerLabels = resolveDisableableConfig(normalizeMarkerLabelOptions, this.defaults.markers.labels);
    if (globalMarkerLabels?.enabled) {
      this.drawMarkerLabelCollection(renderedGlobalMarkers.items, globalMarkerLabels, 1, time);
    }
  }

  drawMarkerLabelCollection(markers = [], markerLabels = {}, opacity = 1, time = getNow()) {
    if (!markerLabels?.enabled || opacity <= 0) {
      return;
    }

    if (markerLabels.minZoom != null && this.view.zoom < markerLabels.minZoom) {
      return;
    }
    if (markerLabels.maxZoom != null && this.view.zoom > markerLabels.maxZoom) {
      return;
    }

    const renderedLabels = resolveMarkerLabelRenderOptions(markerLabels, this.view.zoom);

    (markers ?? []).forEach((marker) => {
      if (marker.cluster) {
        return;
      }
      const text = computeMarkerLabelText(marker, markerLabels);
      if (!text) {
        return;
      }

      const resolvedPoint = this.projectPoint(marker.displayLon ?? marker.lon, marker.displayLat ?? marker.lat);
      const point = typeof this.resolveAnimatedMarkerScreenPoint === 'function'
        ? this.resolveAnimatedMarkerScreenPoint(marker, resolvedPoint, time)
        : resolvedPoint;
      if (!point) {
        return;
      }

      const style = this.resolveMarkerStyle(marker);
      const anchor = computeMarkerLabelAnchor(point, marker, style, renderedLabels);
      if (!anchor) {
        return;
      }

      this.drawScreenLabel(text, anchor, renderedLabels, opacity);
    });
  }

  getRenderedMarkerCollection(markers = [], {
    layerId = null,
    layerName = null,
    source = null,
    bindings = {},
    clusterOptions = {},
    interaction = {},
    clusterIdPrefix = 'cluster'
  } = {}) {
    return clusterMarkersForDisplay(markers, {
      clusterIdPrefix,
      layerId,
      layerName,
      source,
      bindings,
      clusterOptions,
      interaction
    }, (lon, lat, marker) => this.projectPoint(marker?.displayLon ?? lon, marker?.displayLat ?? lat), this.unprojectPoint.bind(this), this.view.zoom);
  }

  drawRoundedRectPath(ctx, x, y, width, height, radius) {
    const safeRadius = Math.max(0, Math.min(Number(radius) || 0, width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
  }

  resolveFeatureStyle(entry) {
    const regionDefaults = resolveRegionPresentationStyle(entry);
    const boundStyle = resolveBoundFeatureStyle(entry.bindings, entry.bindingContext, false);
    const callbackStyle = this.options.styleFeature ? this.options.styleFeature(entry) : null;
    const baseStyle = mergeStyle(
      DEFAULT_FEATURE_STYLE,
      regionDefaults,
      callbackStyle,
      entry.explicitStyle,
      boundStyle
    );
    const hoverMix = this.getHoverStyleMix(entry);
    const layerOpacity = this.getLayerVisibilityOpacity(entry.layerId);
    if (hoverMix <= 0) {
      return applyStyleOpacity(baseStyle, layerOpacity);
    }
    const hoverStyle = this.resolveHoverStyle(this.options.hoverFeatureStyle, entry);
    const boundHoverStyle = resolveBoundFeatureStyle(entry.bindings, entry.bindingContext, true);
    const regionHoverDefaults = entry.region
      ? entry.layerRegionDefaults?.joinedHoverStyle
      : entry.layerRegionDefaults?.emptyHoverStyle;
    const hoveredStyle = mergeStyle(
      baseStyle,
      regionHoverDefaults,
      hoverStyle,
      entry.explicitHoverStyle,
      boundHoverStyle
    );
    return applyStyleOpacity(interpolateStyle(baseStyle, hoveredStyle, hoverMix), layerOpacity);
  }

  resolveMarkerStyle(marker) {
    const { baseStyle, hoveredStyle, hoverMix } = this.resolveMarkerStyleState(marker);
    const layerOpacity = this.getLayerVisibilityOpacity(marker.layerId);
    if (hoverMix <= 0) {
      return applyStyleOpacity(baseStyle, layerOpacity);
    }
    if (hoverMix >= 1) {
      return applyStyleOpacity(mergeStyle(hoveredStyle), layerOpacity);
    }
    return applyStyleOpacity(interpolateStyle(baseStyle, hoveredStyle, hoverMix), layerOpacity);
  }

  resolveMarkerStyleState(marker) {
    const callbackStyle = !marker.cluster && this.options.styleMarker ? this.options.styleMarker(marker) : null;
    const boundStyle = resolveBoundFeatureStyle(marker.bindings, marker.bindingContext, false);
    const defaultStyle = marker.cluster ? DEFAULT_CLUSTER_MARKER_STYLE : DEFAULT_MARKER_STYLE;
    const baseStyle = mergeStyle(
      defaultStyle,
      marker.markerDefaults?.style,
      callbackStyle,
      marker.style,
      boundStyle
    );
    const hoverMix = this.getHoverStyleMix(marker);
    const hoverStyle = this.resolveHoverStyle(this.options.hoverMarkerStyle, marker);
    const boundHoverStyle = resolveBoundFeatureStyle(marker.bindings, marker.bindingContext, true);
    const hoveredStyle = mergeStyle(
      baseStyle,
      marker.markerDefaults?.hoverStyle,
      hoverStyle,
      marker.hoverStyle,
      boundHoverStyle
    );
    return {
      baseStyle,
      hoveredStyle,
      hoverMix
    };
  }

  resolveMarkerImageRenderStyles(marker) {
    const { baseStyle, hoveredStyle, hoverMix } = this.resolveMarkerStyleState(marker);
    if (hoverMix <= 0) {
      return {
        primaryStyle: baseStyle,
        fallbackStyle: null
      };
    }
    if (hoverMix >= 1) {
      return {
        primaryStyle: hoveredStyle,
        fallbackStyle: baseStyle
      };
    }

    const prefersHover = hoverMix >= 0.5;
    return {
      primaryStyle: prefersHover ? hoveredStyle : baseStyle,
      fallbackStyle: prefersHover ? baseStyle : hoveredStyle
    };
  }

  resolveLineStyle(line) {
    const boundStyle = resolveBoundFeatureStyle(line.bindings, line.bindingContext, false);
    const baseStyle = mergeStyle(DEFAULT_FEATURE_STYLE, line.lineDefaults?.style, line.style, boundStyle);
    const hoverMix = this.getHoverStyleMix(line);
    const layerOpacity = this.getLayerVisibilityOpacity(line.layerId);
    if (hoverMix <= 0) {
      return applyStyleOpacity(baseStyle, layerOpacity);
    }
    const hoverStyle = this.resolveHoverStyle(this.options.hoverFeatureStyle, line);
    const boundHoverStyle = resolveBoundFeatureStyle(line.bindings, line.bindingContext, true);
    const hoveredStyle = mergeStyle(
      baseStyle,
      line.lineDefaults?.hoverStyle,
      hoverStyle,
      line.hoverStyle,
      boundHoverStyle
    );
    return applyStyleOpacity(interpolateStyle(baseStyle, hoveredStyle, hoverMix), layerOpacity);
  }

  resolveHoverStyle(resolver, item) {
    if (typeof resolver === 'function') {
      return resolver(item, this.hoverTarget);
    }
    return resolver ?? null;
  }

  isHovered(target) {
    return getHoverIdentity(this.hoverTarget) === getHoverIdentity(target);
  }

  getOrderedProjectedPolygons(polygons = []) {
    if (this.options.hoverRegionToFront !== true) {
      return polygons;
    }
    const hoveredKey = getHoverIdentity(this.hoverTarget);
    if (!hoveredKey) {
      return polygons;
    }

    const hovered = [];
    const remaining = [];
    polygons.forEach((entry) => {
      if (getHoverIdentity(entry) === hoveredKey) {
        hovered.push(entry);
      } else {
        remaining.push(entry);
      }
    });

    if (!hovered.length) {
      return polygons;
    }
    return remaining.concat(hovered);
  }

  drawProjectedPolygon(entry) {
    const style = this.resolveFeatureStyle(entry);
    const interactive = isFeatureInteractive(entry);
    const hitId = this.allocateHitTarget({
      category: 'feature',
      id: entry.sourceId,
      regionJoinId: resolveRegionLabelJoinId(entry),
      layerId: entry.layerId,
      layerName: entry.layerName,
      geometryType: entry.geometryType,
      type: 'polygon',
      properties: entry.properties,
      data: entry.data,
      region: entry.region,
      layer: { id: entry.layerId, name: entry.layerName },
      source: entry.source ? { id: entry.source.id, name: entry.source.name } : null,
      tooltipBinding: entry.bindings?.tooltip ?? entry.tooltip ?? null,
      layerTooltip: entry.layerTooltip ?? null,
      interaction: entry.interaction ?? {},
      style,
      entityKey: entry.entityKey,
      hoverKey: entry.hoverKey,
      order: entry.order,
      interactive
    });

    const drawPath = (ctx) => {
      ctx.beginPath();
      (entry.projectedCoordinates ?? []).forEach((ring) => {
        (ring ?? []).forEach((point, index) => {
          const projected = this.projectProjectedPoint(point[0], point[1]);
          if (index === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        });
        ctx.closePath();
      });
    };

    this.paintPolygon(drawPath, style, hitId);
  }

  drawProjectedLine(entry) {
    const style = this.resolveFeatureStyle(entry);
    const hitId = this.allocateHitTarget({
      category: 'feature',
      id: entry.sourceId,
      layerId: entry.layerId,
      layerName: entry.layerName,
      geometryType: entry.geometryType,
      type: 'line',
      properties: entry.properties,
      data: entry.data,
      region: entry.region,
      layer: { id: entry.layerId, name: entry.layerName },
      source: entry.source ? { id: entry.source.id, name: entry.source.name } : null,
      tooltipBinding: entry.bindings?.tooltip ?? entry.tooltip ?? null,
      layerTooltip: entry.layerTooltip ?? null,
      interaction: entry.interaction ?? {},
      style,
      entityKey: entry.entityKey,
      hoverKey: entry.hoverKey,
      order: entry.order
    });

    const drawPath = (ctx) => {
      const coordinates = entry.projectedCoordinates ?? [];
      const segments = Array.isArray(coordinates[0]?.[0]) ? coordinates : [coordinates];
      ctx.beginPath();
      segments.forEach((segment) => {
        (segment ?? []).forEach((point, index) => {
          const projected = this.projectProjectedPoint(point[0], point[1]);
          if (index === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        });
      });
    };

    this.paintLine(drawPath, style, hitId);
  }

  drawProjectedPoint(entry) {
    const style = this.resolveFeatureStyle(entry);
    if (!Array.isArray(entry.projectedCoordinates)) {
      return;
    }
    const point = this.projectProjectedPoint(entry.projectedCoordinates[0], entry.projectedCoordinates[1]);
    const hitId = this.allocateHitTarget({
      category: 'feature',
      id: entry.sourceId,
      layerId: entry.layerId,
      layerName: entry.layerName,
      geometryType: entry.geometryType,
      type: 'point',
      properties: entry.properties,
      data: entry.data,
      region: entry.region,
      layer: { id: entry.layerId, name: entry.layerName },
      source: entry.source ? { id: entry.source.id, name: entry.source.name } : null,
      tooltipBinding: entry.bindings?.tooltip ?? entry.tooltip ?? null,
      layerTooltip: entry.layerTooltip ?? null,
      interaction: entry.interaction ?? {},
      style,
      entityKey: entry.entityKey,
      hoverKey: entry.hoverKey,
      order: entry.order
    });

    this.paintCircle(point, style, hitId, 6);
  }

  drawCustomLine(line) {
    const style = this.resolveLineStyle(line);
    const resolvedCoordinates = this.resolveLineRenderCoordinates(line);
    const pathMode = this.resolveLinePathMode(line);
    if (!Array.isArray(resolvedCoordinates) || resolvedCoordinates.length < 2) {
      return;
    }
    const hitId = this.allocateHitTarget({
      category: 'feature',
      id: line.id,
      layerId: line.layerId ?? null,
      layerName: line.layerName ?? null,
      geometryType: 'LineString',
      type: 'line',
      properties: line.properties ?? {},
      data: line.data,
      region: line.region ?? null,
      layer: line.layerId ? { id: line.layerId, name: line.layerName } : null,
      source: line.source ? { id: line.source.id, name: line.source.name } : null,
      tooltipBinding: line.bindings?.tooltip ?? line.tooltip ?? null,
      layerTooltip: line.layerTooltip ?? null,
      style,
      entityKey: line.entityKey,
      order: line.order
    });

    const drawPath = (ctx) => {
      const segments = this.isGlobeProjection()
        ? projectGlobeLineCoordinates(resolvedCoordinates, this.view.center, { pathMode })
        : [pathMode === 'geodesic' ? expandGlobePathCoordinates(resolvedCoordinates, 'geodesic') : resolvedCoordinates];
      ctx.beginPath();
      segments.forEach((segment) => {
        (segment ?? []).forEach((point, index) => {
          const projected = this.isGlobeProjection()
            ? this.projectProjectedPoint(point[0], point[1])
            : this.projectPoint(point[0], point[1]);
          if (!projected) {
            return;
          }
          if (index === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        });
      });
    };

    this.paintLine(drawPath, style, hitId);
  }

  drawMarker(marker, time = getNow()) {
    const baseStyle = this.resolveMarkerStyle(marker);
    const style = typeof this.resolveAnimatedMarkerStyle === 'function'
      ? this.resolveAnimatedMarkerStyle(marker, baseStyle, time)
      : baseStyle;
    const resolvedPoint = marker.clusterData?.screenPoint ?? this.projectPoint(marker.displayLon ?? marker.lon, marker.displayLat ?? marker.lat);
    const point = typeof this.resolveAnimatedMarkerScreenPoint === 'function'
      ? this.resolveAnimatedMarkerScreenPoint(marker, resolvedPoint, time)
      : resolvedPoint;
    const visualState = typeof this.resolveMarkerVisualState === 'function'
      ? this.resolveMarkerVisualState(marker, style, time)
      : null;
    if (!point) {
      return;
    }
    const hitId = this.allocateHitTarget({
      category: 'marker',
      id: marker.id,
      layerId: marker.layerId ?? null,
      layerName: marker.layerName ?? null,
      geometryType: 'Point',
      type: 'marker',
      properties: marker.properties ?? {},
      data: marker.data,
      region: marker.region ?? null,
      layer: marker.layerId ? { id: marker.layerId, name: marker.layerName } : null,
      source: marker.source ? { id: marker.source.id, name: marker.source.name } : null,
      tooltipBinding: marker.bindings?.tooltip ?? marker.tooltip ?? null,
      layerTooltip: marker.layerTooltip ?? null,
      interaction: marker.interaction ?? {},
      style,
      entityKey: marker.entityKey,
      hoverKey: marker.hoverKey,
      clusterData: marker.clusterData ?? null,
      clusterOptions: marker.clusterOptions ?? null,
      order: marker.order
    });

    if (typeof this.drawMarkerVisual === 'function') {
      this.drawMarkerVisual(marker, point, style, hitId, visualState);
      return;
    }

    if (marker.type === 'image') {
      this.drawImageMarker(marker, point, style, hitId, this.resolveMarkerImageRenderStyles(marker), visualState);
      return;
    }

    if (visualState?.pulse) {
      this.drawMarkerPulseEffect(marker, point, style, visualState.pulse);
    }
    const visualStyle = visualState?.scale && visualState.scale !== 1
      ? mergeStyle(style, {
        radius: Number(style.radius ?? DEFAULT_MARKER_STYLE.radius) * visualState.scale,
        strokeWidth: Number(style.strokeWidth ?? DEFAULT_MARKER_STYLE.strokeWidth) * visualState.scale
      })
      : style;
    this.paintCircle(point, visualStyle, hitId, 8, {
      hitRadius: Math.max(Number(style.radius ?? DEFAULT_MARKER_STYLE.radius), 8)
    });
    if (marker.cluster) {
      this.drawClusterCount(marker, point, style);
    }
  }

  drawMarkerVisual(marker, point, style, hitId, visualState = null) {
    if (marker.type === 'image') {
      this.drawImageMarker(marker, point, style, hitId, this.resolveMarkerImageRenderStyles(marker), visualState);
      return;
    }

    if (visualState?.pulse) {
      this.drawMarkerPulseEffect(marker, point, style, visualState.pulse);
    }
    const visualStyle = visualState?.scale && visualState.scale !== 1
      ? mergeStyle(style, {
        radius: Number(style.radius ?? DEFAULT_MARKER_STYLE.radius) * visualState.scale,
        strokeWidth: Number(style.strokeWidth ?? DEFAULT_MARKER_STYLE.strokeWidth) * visualState.scale
      })
      : style;
    this.paintCircle(point, visualStyle, hitId, 8, {
      hitRadius: Math.max(Number(style.radius ?? DEFAULT_MARKER_STYLE.radius), 8)
    });
    if (marker.cluster) {
      this.drawClusterCount(marker, point, style);
    }
  }

  resolveAnimatedMarkerStyle(marker, style, time = getNow()) {
    const baseOpacity = Number(style?.opacity ?? 1);
    if (marker?.cluster) {
      const transition = this.clusterFadeTransitions.get(marker.id);
      if (transition?.phase !== 'in') {
        return style;
      }
      const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
      return {
        ...style,
        opacity: baseOpacity * easeOutCubic(progress)
      };
    }

    const transition = this.clusterExpansionTransitions.get(marker?.entityKey);
    if (transition?.phase !== 'enter') {
      return style;
    }
    const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
    return {
      ...style,
      opacity: baseOpacity * easeOutCubic(progress)
    };
  }

  drawClusterCount(marker, point, style = {}) {
    const clusterOptions = normalizeMarkerClusterOptions(marker.clusterOptions ?? {});
    this.ctx.save();
    this.ctx.globalAlpha = Number(style.opacity ?? 1);
    this.ctx.font = clusterOptions.labelFont;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = clusterOptions.labelColor;
    this.ctx.fillText(String(marker.clusterData?.count ?? ''), point.x, point.y);
    this.ctx.restore();
  }

  resolveAnimatedMarkerScreenPoint(marker, point, time = getNow()) {
    if (!point || marker?.cluster) {
      return point;
    }

    const transition = this.clusterExpansionTransitions.get(marker.entityKey);
    if (!transition || transition.phase !== 'enter') {
      return point;
    }

    const progress = clamp((time - transition.startTime) / transition.duration, 0, 1);
    if (progress >= 1) {
      this.clusterExpansionTransitions.delete(marker.entityKey);
      return point;
    }

    const eased = easeOutCubic(progress);
    const startPoint = this.projectPoint(transition.center?.lon, transition.center?.lat);
    if (!startPoint) {
      return point;
    }
    return {
      x: interpolateNumber(startPoint.x, point.x, eased),
      y: interpolateNumber(startPoint.y, point.y, eased)
    };
  }

  resolveMarkerVisualState(marker, style, time = getNow()) {
    if (this.prefersReducedMotion()) {
      return null;
    }
    return resolveMarkerAnimationVisualState(marker, style, time);
  }

  hasActiveMarkerAnimations(renderedLayerMarkers = [], renderedGlobalMarkers = { items: [] }, time = getNow()) {
    if (this.prefersReducedMotion()) {
      return false;
    }

    const hasActiveAnimation = (marker) => {
      if (!marker?.animation) {
        return false;
      }
      return Boolean(resolveMarkerAnimationPhase({
        ...marker.animation,
        startTime: marker.animationStartTime
      }, time)?.active);
    };

    return renderedLayerMarkers.some(({ rendered }) => (rendered?.items ?? []).some(hasActiveAnimation))
      || (renderedGlobalMarkers.items ?? []).some(hasActiveAnimation);
  }

  scheduleMarkerAnimationFrame() {
    if (this.markerAnimationFrame != null || this.animationState != null || typeof requestAnimationFrame !== 'function') {
      return;
    }

    this.markerAnimationFrame = requestAnimationFrame(() => {
      this.markerAnimationFrame = null;
      this.render();
    });
  }

  cancelMarkerAnimationFrame() {
    if (this.markerAnimationFrame != null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.markerAnimationFrame);
      this.markerAnimationFrame = null;
    }
  }

  getMarkerImageEntry(marker, style = {}) {
    const cacheKey = getMarkerImageCacheKey(marker?.image, style);
    if (!cacheKey || typeof Image === 'undefined') {
      return null;
    }

    const existing = this.markerImageCache.get(cacheKey);
    if (existing) {
      return existing;
    }

    const source = createMarkerImageSource(marker.image, style);
    if (!source) {
      return null;
    }

    const image = new Image();
    const entry = {
      status: 'loading',
      image,
      source
    };

    image.onload = () => {
      entry.status = 'loaded';
      this.render();
    };
    image.onerror = () => {
      entry.status = 'error';
      this.render();
    };
    image.src = source;
    this.markerImageCache.set(cacheKey, entry);
    return entry;
  }

  drawMarkerPulseEffect(marker, point, style = {}, pulse = null) {
    if (!pulse || pulse.opacity <= 0) {
      return;
    }

    const imageLayout = marker?.type === 'image' ? resolveImageMarkerLayout(marker, style) : null;
    const baseRadius = imageLayout
      ? Math.max(imageLayout.width, imageLayout.height) / 2
      : Number(style.radius ?? DEFAULT_MARKER_STYLE.radius);

    this.ctx.save();
    this.ctx.globalAlpha = Number(style.opacity ?? 1) * pulse.opacity;
    this.ctx.strokeStyle = pulse.color;
    this.ctx.lineWidth = pulse.strokeWidth ?? Math.max(1, Number(style.strokeWidth ?? DEFAULT_MARKER_STYLE.strokeWidth));
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, baseRadius * pulse.scale, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawImageMarker(marker, point, style, hitId, imageRenderStyles = null, visualState = null) {
    const layout = resolveImageMarkerLayout(marker, style);
    const visualScale = Number(visualState?.scale ?? 1);
    const visualLayout = visualScale !== 1
      ? {
        width: layout.width * visualScale,
        height: layout.height * visualScale,
        anchorX: layout.anchorX * visualScale,
        anchorY: layout.anchorY * visualScale
      }
      : layout;
    const left = point.x - visualLayout.anchorX;
    const top = point.y - visualLayout.anchorY;
    const hitLeft = point.x - layout.anchorX;
    const hitTop = point.y - layout.anchorY;
    const primaryStyle = imageRenderStyles?.primaryStyle ?? style;
    let imageEntry = this.getMarkerImageEntry(marker, primaryStyle);
    if (imageEntry?.status !== 'loaded' && imageRenderStyles?.fallbackStyle) {
      const fallbackEntry = this.getMarkerImageEntry(marker, imageRenderStyles.fallbackStyle);
      if (fallbackEntry?.status === 'loaded') {
        imageEntry = fallbackEntry;
      }
    }

    if (imageEntry?.status === 'loaded') {
      if (visualState?.pulse) {
        this.drawMarkerPulseEffect(marker, point, style, visualState.pulse);
      }
      this.ctx.save();
      this.ctx.globalAlpha = style.opacity;
      if (visualState?.rotation) {
        this.ctx.translate(point.x, point.y);
        this.ctx.rotate(visualState.rotation);
        this.ctx.drawImage(
          imageEntry.image,
          -visualLayout.anchorX,
          -visualLayout.anchorY,
          visualLayout.width,
          visualLayout.height
        );
      } else {
        this.ctx.drawImage(imageEntry.image, left, top, visualLayout.width, visualLayout.height);
      }
      this.ctx.restore();
    } else {
      if (visualState?.pulse) {
        this.drawMarkerPulseEffect(marker, point, style, visualState.pulse);
      }
      const fallbackStyle = mergeStyle(style, {
        radius: Math.max(2, Math.min(visualLayout.width, visualLayout.height) / 2)
      });
      this.paintCircle(point, fallbackStyle, null, 0);
    }

    if (hitId == null) {
      return;
    }
    const hitColor = encodeHitColor(hitId);
    this.hitCtx.save();
    if (imageEntry?.status === 'loaded') {
      const hitMask = this.getMarkerHitMaskSurface(layout.width, layout.height);
      if (hitMask?.ctx && hitMask.canvas) {
        hitMask.ctx.fillStyle = `rgba(${hitColor.r}, ${hitColor.g}, ${hitColor.b}, 1)`;
        hitMask.ctx.fillRect(0, 0, layout.width, layout.height);
        hitMask.ctx.globalCompositeOperation = 'destination-in';
        hitMask.ctx.drawImage(imageEntry.image, 0, 0, layout.width, layout.height);
        hitMask.ctx.globalCompositeOperation = 'source-over';
        this.hitCtx.drawImage(hitMask.canvas, hitLeft, hitTop, layout.width, layout.height);
      } else {
        this.hitCtx.fillStyle = `rgba(${hitColor.r}, ${hitColor.g}, ${hitColor.b}, 1)`;
        this.hitCtx.fillRect(hitLeft, hitTop, layout.width, layout.height);
      }
    } else {
      this.hitCtx.fillStyle = `rgba(${hitColor.r}, ${hitColor.g}, ${hitColor.b}, 1)`;
      this.hitCtx.fillRect(hitLeft, hitTop, layout.width, layout.height);
    }
    this.hitCtx.restore();
  }

  getMarkerHitMaskSurface(width, height) {
    if (typeof document === 'undefined') {
      return null;
    }

    if (!this.markerHitMaskCanvas || !this.markerHitMaskCtx) {
      this.markerHitMaskCanvas = document.createElement('canvas');
      this.markerHitMaskCtx = this.markerHitMaskCanvas.getContext('2d');
    }

    if (!this.markerHitMaskCanvas || !this.markerHitMaskCtx) {
      return null;
    }

    const dpr = Math.max(1, this.dpr || 1);
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));

    if (this.markerHitMaskCanvas.width !== pixelWidth || this.markerHitMaskCanvas.height !== pixelHeight) {
      this.markerHitMaskCanvas.width = pixelWidth;
      this.markerHitMaskCanvas.height = pixelHeight;
    }

    this.markerHitMaskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.markerHitMaskCtx.clearRect(0, 0, width, height);
    this.markerHitMaskCtx.globalCompositeOperation = 'source-over';

    return {
      canvas: this.markerHitMaskCanvas,
      ctx: this.markerHitMaskCtx
    };
  }

  paintPolygon(drawPath, style, hitId) {
    this.ctx.save();
    this.ctx.globalAlpha = style.opacity;
    this.ctx.setLineDash(style.lineDash);
    this.ctx.fillStyle = style.fill;
    this.ctx.strokeStyle = style.stroke;
    this.ctx.lineWidth = style.strokeWidth;
    drawPath(this.ctx);
    this.ctx.fill('evenodd');
    this.ctx.stroke();
    this.ctx.restore();

    if (hitId != null) {
      const hitColor = encodeHitColor(hitId);
      this.hitCtx.save();
      this.hitCtx.fillStyle = `rgba(${hitColor.r}, ${hitColor.g}, ${hitColor.b}, 1)`;
      drawPath(this.hitCtx);
      this.hitCtx.fill('evenodd');
      this.hitCtx.restore();
    }
  }

  paintLine(drawPath, style, hitId) {
    this.ctx.save();
    this.ctx.globalAlpha = style.opacity;
    this.ctx.strokeStyle = style.stroke;
    this.ctx.lineWidth = style.strokeWidth;
    this.ctx.setLineDash(style.lineDash);
    drawPath(this.ctx);
    this.ctx.stroke();
    this.ctx.restore();

    if (hitId == null) {
      return;
    }
    const hitColor = encodeHitColor(hitId);
    this.hitCtx.save();
    this.hitCtx.strokeStyle = `rgba(${hitColor.r}, ${hitColor.g}, ${hitColor.b}, 1)`;
    this.hitCtx.lineWidth = Math.max(style.strokeWidth, 6);
    drawPath(this.hitCtx);
    this.hitCtx.stroke();
    this.hitCtx.restore();
  }

  paintCircle(point, style, hitId, hitRadiusFloor, options = {}) {
    this.ctx.save();
    this.ctx.globalAlpha = style.opacity;
    this.ctx.fillStyle = style.fill;
    this.ctx.strokeStyle = style.stroke;
    this.ctx.lineWidth = style.strokeWidth;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, style.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    if (hitId == null) {
      return;
    }
    const hitColor = encodeHitColor(hitId);
    const hitRadius = Number.isFinite(Number(options.hitRadius))
      ? Number(options.hitRadius)
      : Math.max(style.radius, hitRadiusFloor);
    this.hitCtx.save();
    this.hitCtx.fillStyle = `rgba(${hitColor.r}, ${hitColor.g}, ${hitColor.b}, 1)`;
    this.hitCtx.beginPath();
    this.hitCtx.arc(point.x, point.y, hitRadius, 0, Math.PI * 2);
    this.hitCtx.fill();
    this.hitCtx.restore();
  }

  paintLabelHitArea(screenPoint, width, height, labels, hitId) {
    const hitColor = encodeHitColor(hitId);
    this.hitCtx.save();
    this.hitCtx.fillStyle = `rgba(${hitColor.r}, ${hitColor.g}, ${hitColor.b}, 1)`;
    this.drawRoundedRectPath(
      this.hitCtx,
      screenPoint.x - width / 2,
      screenPoint.y - height / 2,
      width,
      height,
      labels.borderRadius
    );
    this.hitCtx.fill();
    this.hitCtx.restore();
  }

  projectProjectedPoint(x, y) {
    const basePoint = this.baseTransform.project(x, y);
    return applyCameraTransform(basePoint, this.getBaseAnchor(), { x: this.width / 2, y: this.height / 2 }, this.view.zoom);
  }

  allocateHitTarget(target) {
    const id = this.hitIdCursor++;
    this.hitMap.set(id, { ...target, hitId: id });
    return id;
  }

  getRelativePosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  readHitTarget(screenX, screenY) {
    const x = Math.max(0, Math.min(this.width - 1, screenX));
    const y = Math.max(0, Math.min(this.height - 1, screenY));
    const pixel = this.hitCtx.getImageData(Math.round(x * this.dpr), Math.round(y * this.dpr), 1, 1).data;
    const hitId = decodeHitColor(pixel[0], pixel[1], pixel[2]);
    return hitId ? this.hitMap.get(hitId) ?? null : null;
  }

  sampleHitTargets(screenX, screenY, radius = 1) {
    const targets = [];
    const seen = new Set();

    for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        const target = this.readHitTarget(screenX + offsetX, screenY + offsetY);
        if (!target || seen.has(target.hitId)) {
          continue;
        }
        seen.add(target.hitId);
        targets.push(target);
      }
    }

    return targets;
  }

  updateTouchPointer(event, point) {
    if (event.pointerType !== 'touch') {
      return;
    }

    this.activeTouchPointers.set(event.pointerId, {
      x: point.x,
      y: point.y
    });
  }

  removeTouchPointer(pointerId) {
    this.activeTouchPointers.delete(pointerId);
  }

  getActivePinchPointers() {
    if (this.activeTouchPointers.size < 2) {
      return [];
    }

    return Array.from(this.activeTouchPointers.entries())
      .slice(0, 2)
      .map(([pointerId, point]) => ({ pointerId, point }));
  }

  beginPinchGesture() {
    if (!this.options.pinchZoomEnabled) {
      return false;
    }

    const pointers = this.getActivePinchPointers();
    if (pointers.length < 2) {
      return false;
    }

    const [first, second] = pointers;
    const midpoint = computeScreenMidpoint(first.point, second.point);
    this.stopAnimation(true);
    this.hideTooltip();
    this.dragState = null;
    this.pinchState = {
      pointerIds: [first.pointerId, second.pointerId],
      startDistance: Math.max(1e-6, computeScreenDistance(first.point, second.point)),
      startZoom: this.view.zoom,
      startView: this.snapshotView(),
      anchorGeo: this.unprojectPoint(midpoint.x, midpoint.y)
    };
    this.suppressNextClick = true;
    return true;
  }

  endPinchGesture() {
    const pinchState = this.pinchState;
    if (!pinchState) {
      return;
    }

    this.pinchState = null;
    this.dragState = null;
    this.canvas.style.cursor = this.options.panEnabled ? 'grab' : '';
    this.emitZoomEnd(pinchState.startView, this.snapshotView(), 'pinch');
  }

  handleTouchDoubleTap(point) {
    if (!this.options.doubleTapZoomEnabled) {
      return false;
    }

    const now = getNow();
    if (this.lastTap) {
      const elapsed = now - this.lastTap.time;
      const distance = computeScreenDistance(this.lastTap.point, point);
      if (elapsed <= DOUBLE_TAP_DELAY_MS && distance <= DOUBLE_TAP_DISTANCE_PX) {
        this.lastTap = null;
        this.suppressNextClick = true;
        this.zoomAtPoint(this.view.zoom * this.options.zoomStep, point, {
          animate: true,
          duration: this.options.animationDuration,
          zoomEventTrigger: 'double-tap'
        });
        return true;
      }
    }

    this.lastTap = {
      time: now,
      point: { x: point.x, y: point.y }
    };
    return false;
  }

  polygonTargetContainsPoint(target, screenPoint) {
    if (!target || target.type !== 'polygon') {
      return false;
    }

    const entries = this.findFeatureEntriesForTarget(target);
    return entries.some((entry) => {
      if (entry.kind !== 'polygon') {
        return false;
      }

      const rings = (entry.projectedCoordinates ?? []).map((ring) => (
        (ring ?? []).map((point) => this.projectProjectedPoint(point[0], point[1]))
      ));
      return isPointInPolygonRings(screenPoint, rings);
    });
  }

  pick(screenX, screenY, options = {}) {
    const includeNonInteractivePolygons = options.includeNonInteractivePolygons === true;
    const directTarget = this.readHitTarget(screenX, screenY);
    if (directTarget && directTarget.type !== 'polygon') {
      return directTarget;
    }
    if (directTarget?.type === 'polygon' && directTarget.hitRole === 'label') {
      if (includeNonInteractivePolygons || directTarget.interactive !== false) {
        return directTarget;
      }
    }

    const point = {
      x: Math.max(0, Math.min(this.width - 1, screenX)),
      y: Math.max(0, Math.min(this.height - 1, screenY))
    };
    const polygonCandidates = this.sampleHitTargets(point.x, point.y)
      .filter((target) => target.type === 'polygon'
        && (includeNonInteractivePolygons || target.interactive !== false)
        && this.polygonTargetContainsPoint(target, point))
      .sort((a, b) => (a.hitId ?? 0) - (b.hitId ?? 0));

    if (polygonCandidates.length) {
      return polygonCandidates[polygonCandidates.length - 1];
    }

    return null;
  }

  onPointerDown(event) {
    const point = this.getRelativePosition(event);
    this.updateTouchPointer(event, point);
    if (event.pointerType === 'touch' && this.beginPinchGesture()) {
      this.canvas.setPointerCapture?.(event.pointerId);
      return;
    }

    if (!this.options.panEnabled) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    this.stopAnimation(true);
    this.dragState = {
      active: true,
      pointerId: event.pointerId,
      startPoint: point,
      startAnchor: this.getBaseAnchor(),
      startCenter: { ...this.view.center },
      moved: false
    };
    this.hideTooltip();
    this.canvas.style.cursor = 'grabbing';
    this.canvas.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event) {
    const point = this.getRelativePosition(event);
    this.updateTouchPointer(event, point);

    if (this.pinchState?.pointerIds.includes(event.pointerId)) {
      const first = this.activeTouchPointers.get(this.pinchState.pointerIds[0]);
      const second = this.activeTouchPointers.get(this.pinchState.pointerIds[1]);
      if (first && second) {
        const midpoint = computeScreenMidpoint(first, second);
        const distance = Math.max(1e-6, computeScreenDistance(first, second));
        const targetZoom = this.pinchState.startZoom * (distance / this.pinchState.startDistance);
        this.view = this.buildViewForZoomAtPoint(targetZoom, midpoint, this.pinchState.anchorGeo);
        this.render();
      }
      return;
    }

    if (this.dragState?.active && this.dragState.pointerId === event.pointerId) {
      const deltaX = point.x - this.dragState.startPoint.x;
      const deltaY = point.y - this.dragState.startPoint.y;
      this.dragState.moved = this.dragState.moved || Math.abs(deltaX) + Math.abs(deltaY) > 3;

      if (this.isGlobeProjection()) {
        this.view = this.buildGlobeViewFromDrag(this.dragState.startCenter, deltaX, deltaY);
        this.syncProjectionState();
        this.render();
        return;
      }

      const nextAnchor = {
        x: this.dragState.startAnchor.x - deltaX / this.view.zoom,
        y: this.dragState.startAnchor.y - deltaY / this.view.zoom
      };
      const projectedCenter = this.baseTransform.unproject(nextAnchor.x, nextAnchor.y);
      this.view = this.clampView({
        zoom: this.view.zoom,
        center: this.inverseProjectedPoint(projectedCenter.lon, projectedCenter.lat, this.view.center)
      });
      this.render();
      return;
    }

    const nextTarget = this.pick(point.x, point.y);
    const transition = deriveHoverTransition(this.hoverTarget, nextTarget);
    const hoverTooltipEnabled = this.tooltipOptions.enabled && this.tooltipOptions.trigger === 'hover';

    if (!transition.same) {
      this.startHoverTransition(this.hoverTarget, nextTarget);
      this.hoverTarget = nextTarget;
      this.render();
    }

    if (transition.leave) {
      this.dispatchLeave(transition.leave, point, event);
      if (hoverTooltipEnabled && !nextTarget && !shouldPersistTooltip(this.tooltipOptions, this.tooltipState.hovered, this.tooltipState.focused)) {
        this.scheduleTooltipHideCheck();
      }
    }

    if (transition.enter) {
      this.dispatchEnter(transition.enter, point, event);
    }

    if (nextTarget) {
      const payloadTarget = resolveGroupedTarget(this.hoverTarget, nextTarget);
      const payload = this.buildPayload(payloadTarget, point, event);
      this.dispatchMove(payloadTarget, point, event, payload);
      if (hoverTooltipEnabled) {
        this.showTooltip(payload, point, transition.enter ? 'enter' : 'move');
      }
      this.canvas.style.cursor = nextTarget.style?.cursor || 'pointer';
    } else {
      this.canvas.style.cursor = this.options.panEnabled ? 'grab' : '';
      if (hoverTooltipEnabled && !shouldPersistTooltip(this.tooltipOptions, this.tooltipState.hovered, this.tooltipState.focused)) {
        this.scheduleTooltipHideCheck();
      }
    }
  }

  onPointerUp(event) {
    const point = this.getRelativePosition(event);
    this.removeTouchPointer(event.pointerId);

    if (this.pinchState?.pointerIds.includes(event.pointerId)) {
      this.endPinchGesture();
      this.canvas.releasePointerCapture?.(event.pointerId);
      return;
    }

    if (!this.dragState?.active || this.dragState.pointerId !== event.pointerId) {
      if (event.pointerType === 'touch') {
        this.handleTouchDoubleTap(point);
      }
      return;
    }

    this.suppressNextClick = this.dragState.moved;
    this.dragState = null;
    this.canvas.releasePointerCapture?.(event.pointerId);
    this.canvas.style.cursor = this.options.panEnabled ? 'grab' : '';

    if (event.pointerType === 'touch' && !this.suppressNextClick) {
      this.handleTouchDoubleTap(point);
    }
  }

  onPointerCancel(event) {
    this.removeTouchPointer(event.pointerId);
    if (this.pinchState?.pointerIds.includes(event.pointerId)) {
      this.endPinchGesture();
      return;
    }
    if (!this.dragState?.active || this.dragState.pointerId !== event.pointerId) {
      return;
    }
    this.dragState = null;
    this.canvas.style.cursor = this.options.panEnabled ? 'grab' : '';
  }

  onPointerLeave(event) {
    if (event.pointerType === 'touch') {
      this.removeTouchPointer(event.pointerId);
      if (this.pinchState?.pointerIds.includes(event.pointerId)) {
        this.endPinchGesture();
      }
    }

    if (this.dragState?.active || this.pinchState) {
      return;
    }

    const point = this.getRelativePosition(event);
    if (this.hoverTarget) {
      const previous = this.hoverTarget;
      this.startHoverTransition(previous, null);
      this.hoverTarget = null;
      this.render();
      this.dispatchLeave(previous, point, event);
    }
    this.canvas.style.cursor = this.options.panEnabled ? 'grab' : '';
    if (this.tooltipOptions.trigger === 'hover'
      && !shouldPersistTooltip(this.tooltipOptions, this.tooltipState.hovered, this.tooltipState.focused)) {
      this.scheduleTooltipHideCheck();
    }
  }

  onClick(event) {
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      return;
    }

    const point = this.getRelativePosition(event);
    const target = this.pick(point.x, point.y)
      ?? this.pick(point.x, point.y, { includeNonInteractivePolygons: true });
    if (!target) {
      if (this.activeClickActionUi === 'panel' && this.panelState?.closeOnMapClick) {
        this.closeBuiltInActionUi();
      }
      if (this.tooltipOptions.enabled && this.tooltipOptions.trigger === 'click') {
        this.hideTooltip();
      }
      return;
    }

    const payload = this.buildPayload(target, point, event);
    if (target.category === 'marker') {
      this.emit('markerclick', payload);
      if (this.tooltipOptions.enabled && this.tooltipOptions.trigger === 'click') {
        this.showTooltip(payload, point, 'click');
      }
      this.runClickInteraction(target, payload);
      return;
    }
    this.emit('featureclick', payload);
    if (this.activeClickActionUi === 'panel' && payload.region == null && this.panelState?.closeOnEmptyRegionClick) {
      this.closeBuiltInActionUi();
    }
    if (target.interactive === false) {
      return;
    }
    if (this.tooltipOptions.enabled && this.tooltipOptions.trigger === 'click') {
      this.showTooltip(payload, point, 'click');
    }
    this.runClickInteraction(target, payload);
  }

  onDoubleClick(event) {
    if (!this.options.doubleTapZoomEnabled) {
      return;
    }

    event.preventDefault();
    const point = this.getRelativePosition(event);
    this.zoomAtPoint(this.view.zoom * this.options.zoomStep, point, {
      animate: true,
      duration: this.options.animationDuration,
      zoomEventTrigger: 'double-click'
    });
  }

  onWheel(event) {
    if (!this.options.scrollWheelZoomEnabled) {
      return;
    }

    event.preventDefault();
    const point = this.getRelativePosition(event);
    const delta = event.deltaMode === 1
      ? event.deltaY * 16
      : event.deltaMode === 2
        ? event.deltaY * this.height
        : event.deltaY;
    const factor = Math.exp(-delta * 0.0015);
    this.zoomAtPoint(this.view.zoom * factor, point, {
      animate: false,
      zoomEventTrigger: 'wheel'
    });
  }

  onTooltipEnter() {
    this.tooltipState.hovered = true;
  }

  onTooltipLeave() {
    this.tooltipState.hovered = false;
    if (this.tooltipOptions.trigger === 'hover' || this.tooltipOptions.interactive) {
      this.scheduleTooltipHideCheck();
    }
  }

  onTooltipFocusIn() {
    this.tooltipState.focused = true;
  }

  onTooltipFocusOut() {
    requestAnimationFrame(() => {
      this.tooltipState.focused = this.tooltipElement?.matches(':focus-within') ?? false;
      if (this.tooltipOptions.trigger === 'hover' || this.tooltipOptions.interactive) {
        this.scheduleTooltipHideCheck();
      }
    });
  }

  scheduleTooltipHideCheck() {
    if (this.tooltipHideFrame) {
      cancelAnimationFrame(this.tooltipHideFrame);
    }

    this.tooltipHideFrame = requestAnimationFrame(() => {
      this.tooltipHideFrame = null;
      if (!this.hoverTarget && !shouldPersistTooltip(this.tooltipOptions, this.tooltipState.hovered, this.tooltipState.focused)) {
        this.hideTooltip();
      }
    });
  }

  dispatchEnter(target, point, event) {
    const payload = this.buildPayload(target, point, event);
    if (target.category === 'marker') {
      this.emit('markerenter', payload);
      return;
    }
    this.emit('featureenter', payload);
  }

  dispatchLeave(target, point, event) {
    const payload = this.buildPayload(target, point, event);
    if (target.category === 'marker') {
      this.emit('markerleave', payload);
      return;
    }
    this.emit('featureleave', payload);
  }

  dispatchMove(target, point, event, payload = null) {
    const nextPayload = payload ?? this.buildPayload(target, point, event);
    if (target.category === 'marker') {
      this.emit('markermove', nextPayload);
      return;
    }
    this.emit('featuremove', nextPayload);
  }

  buildPayload(target, point, event) {
    const payload = {
      type: target.type,
      id: target.id,
      regionJoinId: target.regionJoinId ?? null,
      layerId: target.layerId ?? null,
      layerName: target.layerName ?? null,
      geometryType: target.geometryType,
      properties: target.properties,
      data: target.data,
      region: target.region ?? null,
      layer: target.layer ?? (target.layerId ? { id: target.layerId, name: target.layerName } : null),
      source: target.source ?? null,
      layerTooltip: target.layerTooltip ?? null,
      screenX: point.x,
      screenY: point.y,
      originalEvent: event
    };

    if (target.clusterData) {
      payload.cluster = {
        count: target.clusterData.count,
        markerIds: target.clusterData.markerIds.slice(),
        markers: target.clusterData.markers.slice(),
        center: { ...target.clusterData.center }
      };
    }

    if (target.tooltipBinding != null) {
      const tooltipValue = resolveTooltipBinding(target.tooltipBinding, payload);
      if (tooltipValue != null) {
        payload.tooltipContent = String(tooltipValue);
      }
      if (typeof target.tooltipBinding === 'string' && target.tooltipBinding.includes('{')) {
        payload.tooltipTemplate = target.tooltipBinding;
      } else if (tooltipValue != null) {
        payload.tooltipHtml = String(tooltipValue);
      }
    }

    return payload;
  }

  findFeatureEntriesForTarget(targetOrPayload) {
    if (!targetOrPayload) {
      return [];
    }

    const targetLayerId = targetOrPayload.layerId ?? targetOrPayload.layer?.id ?? null;
    const targetId = targetOrPayload.id ?? null;
    const targetHoverKey = targetOrPayload.hoverKey ?? null;

    const layerEntries = targetLayerId == null
      ? this.projectedFeatureEntries
      : this.layers.find((layer) => layer.id === targetLayerId)?.projectedFeatureEntries ?? [];

    if (targetHoverKey) {
      const grouped = layerEntries.filter((entry) => getHoverIdentity(entry) === targetHoverKey);
      if (grouped.length) {
        return grouped;
      }
    }

    return layerEntries.filter((entry) => entry.sourceId === targetId);
  }

  findMarkerForTarget(targetOrPayload) {
    if (!targetOrPayload) {
      return null;
    }

    const targetLayerId = targetOrPayload.layerId ?? targetOrPayload.layer?.id ?? null;
    const targetId = targetOrPayload.id ?? null;
    const pool = [
      ...this.visibleLayerMarkers,
      ...this.markers,
      ...this.layers.flatMap((layer) => layer.markers ?? [])
    ];

    return pool.find((marker) => marker.id === targetId && (targetLayerId == null || marker.layerId === targetLayerId)) ?? null;
  }

  runClickInteraction(target, payload) {
    const click = target?.interaction?.click;
    if (click) {
      if (target?.category === 'feature' && payload?.region == null && click.emptyRegions === false) {
        return;
      }

      const showLayerIds = resolveLayerTargetIds(this.layers, click.showLayers);
      const hideLayerIds = resolveLayerTargetIds(this.layers, click.hideLayers);
      const toggleLayerIds = resolveLayerTargetIds(this.layers, click.toggleLayers);

      const zoomTarget = click.zoomTo === true ? 'target' : click.zoomTo;
      const deferredHideLayerIds = [];
      const immediateToggleLayerIds = [];
      const shouldZoomToFeature = zoomTarget === 'feature' || (zoomTarget === 'target' && target.category !== 'marker');
      const shouldZoomToMarker = zoomTarget === 'marker' || (zoomTarget === 'target' && target.category === 'marker');
      const shouldZoomToCluster = !shouldZoomToFeature && !shouldZoomToMarker && target.clusterData && target.clusterOptions?.clickToZoom;
      const shouldDeferHiddenLayers = shouldZoomToFeature || shouldZoomToMarker || shouldZoomToCluster;

      showLayerIds.forEach((layerId) => this.setLayerVisibility(layerId, true));
      if (shouldDeferHiddenLayers) {
        deferredHideLayerIds.push(...hideLayerIds);
        toggleLayerIds.forEach((layerId) => {
          const layer = this.layers.find((candidate) => candidate.id === layerId);
          if (layer?.visible) {
            deferredHideLayerIds.push(layerId);
          } else {
            immediateToggleLayerIds.push(layerId);
          }
        });
      } else {
        hideLayerIds.forEach((layerId) => this.setLayerVisibility(layerId, false));
        immediateToggleLayerIds.push(...toggleLayerIds);
      }
      immediateToggleLayerIds.forEach((layerId) => this.toggleLayerVisibility(layerId));

      const runDeferredHideFade = deferredHideLayerIds.length
        ? () => this.startLayerHideFade(Array.from(new Set(deferredHideLayerIds)))
        : null;

      if (shouldZoomToFeature) {
        this.zoomToFeature(target, {
          animate: true,
          padding: click.zoomPadding,
          maxZoom: click.zoomMax,
          onComplete: runDeferredHideFade
        });
      } else if (shouldZoomToMarker) {
        this.zoomToMarker(target, {
          animate: true,
          zoomScale: click.zoomScale ?? 4,
          maxZoom: click.zoomMax,
          onComplete: runDeferredHideFade
        });
      } else if (shouldZoomToCluster) {
        this.zoomToMarker(target, {
          animate: true,
          zoomScale: target.clusterOptions.zoomScale,
          maxZoom: click.zoomMax,
          onComplete: runDeferredHideFade
        });
      } else if (runDeferredHideFade) {
        runDeferredHideFade();
      }

      if (click.handler) {
        click.handler(payload, this);
      }
      if (click.action) {
        this.executeBuiltInClickAction(click.action, payload);
      }
      return;
    }

    if (target.clusterData && target.clusterOptions?.clickToZoom) {
      this.zoomToMarker(target, {
        animate: true,
        zoomScale: target.clusterOptions.zoomScale
      });
    }
  }

  onZoomInClick() {
    this.zoomIn();
  }

  onZoomOutClick() {
    this.zoomOut();
  }

  onHomeClick() {
    this.resetView({ restoreLayerVisibility: this.options.restoreLayerVisibilityOnHome });
  }

  getOverlayHostElement() {
    return this.surfaceElement ?? this.container ?? this.canvas.parentElement;
  }

  getViewportMeasurementElement() {
    return this.surfaceElement ?? this.container ?? this.canvas.parentElement;
  }

  getGlobalOverlayHostElement() {
    if (typeof document !== 'undefined') {
      return document.body ?? document.documentElement ?? null;
    }
    return null;
  }

  createActionPanelElements(className) {
    const root = document.createElement('div');
    root.className = className;
    Object.assign(root.style, {
      display: 'none',
      overflow: 'visible',
      boxSizing: 'border-box'
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      minWidth: '0',
      minHeight: '0',
      boxSizing: 'border-box',
      overflow: 'hidden'
    });

    const head = document.createElement('div');
    Object.assign(head.style, {
      display: 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '0 0 12px 0',
      borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontSize: '15px',
      fontWeight: '600',
      color: 'inherit'
    });

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = 'Close';
    Object.assign(closeButton.style, {
      border: '1px solid rgba(15, 23, 42, 0.12)',
      borderRadius: '10px',
      background: 'rgba(255, 255, 255, 0.92)',
      color: '#18344b',
      padding: '6px 10px',
      cursor: 'pointer'
    });

    const body = document.createElement('div');
    Object.assign(body.style, {
      flex: '1 1 auto',
      minWidth: '0',
      minHeight: '0',
      overflow: 'auto',
      boxSizing: 'border-box'
    });

    head.appendChild(title);
    head.appendChild(closeButton);
    card.appendChild(head);
    card.appendChild(body);
    root.appendChild(card);

    return {
      root,
      card,
      head,
      title,
      closeButton,
      body
    };
  }

  ensureActionElements() {
    const host = this.getOverlayHostElement();
    const globalOverlayHost = this.getGlobalOverlayHostElement();
    if (!host) {
      this.surfaceElement = this.canvas.parentElement ?? null;
      this.actionLayoutElement = null;
      this.layoutPanelElement = null;
      this.overlayElement = null;
      this.lightboxElement = null;
      return;
    }

    this.actionLayoutElement = document.createElement('div');
    this.actionLayoutElement.className = 'geocanvas-action-layout';
    Object.assign(this.actionLayoutElement.style, {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '0px',
      width: '100%',
      height: '100%'
    });

    this.surfaceElement = document.createElement('div');
    this.surfaceElement.className = 'geocanvas-surface';
    Object.assign(this.surfaceElement.style, {
      position: 'relative',
      flex: '1 1 auto',
      minWidth: '0',
      minHeight: '0',
      width: '100%',
      height: '100%'
    });

    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'geocanvas-overlays';
    Object.assign(this.overlayElement.style, {
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '35'
    });

    const layoutPanel = this.createActionPanelElements('geocanvas-layout-panel');
    this.layoutPanelElement = layoutPanel.root;
    this.layoutPanelCard = layoutPanel.card;
    this.layoutPanelHead = layoutPanel.head;
    this.layoutPanelTitleElement = layoutPanel.title;
    this.layoutPanelCloseButton = layoutPanel.closeButton;
    this.layoutPanelBodyElement = layoutPanel.body;
    Object.assign(this.layoutPanelElement.style, {
      flex: '0 0 auto',
      minWidth: '0',
      minHeight: '0'
    });

    const overlayPanel = this.createActionPanelElements('geocanvas-overlay-panel');
    this.overlayPanelElement = overlayPanel.root;
    this.overlayPanelCard = overlayPanel.card;
    this.overlayPanelHead = overlayPanel.head;
    this.overlayPanelTitleElement = overlayPanel.title;
    this.overlayPanelCloseButton = overlayPanel.closeButton;
    this.overlayPanelBodyElement = overlayPanel.body;
    Object.assign(this.overlayPanelElement.style, {
      position: 'absolute',
      zIndex: '1',
      pointerEvents: 'auto'
    });

    this.lightboxElement = document.createElement('div');
    this.lightboxElement.className = 'geocanvas-lightbox';
    Object.assign(this.lightboxElement.style, {
      position: 'fixed',
      inset: '0',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      pointerEvents: 'auto',
      zIndex: '1200'
    });

    this.lightboxBackdropElement = document.createElement('div');
    this.lightboxBackdropElement.className = 'geocanvas-lightbox-backdrop';
    Object.assign(this.lightboxBackdropElement.style, {
      position: 'absolute',
      inset: '0',
      background: 'rgba(15, 23, 42, 0.55)'
    });

    this.lightboxDialogElement = document.createElement('div');
    this.lightboxDialogElement.className = 'geocanvas-lightbox-dialog';
    Object.assign(this.lightboxDialogElement.style, {
      position: 'relative',
      zIndex: '1',
      display: 'flex',
      flexDirection: 'column',
      width: 'min(90vw, 960px)',
      maxWidth: '960px',
      height: '80vh',
      maxHeight: '80vh',
      padding: '16px',
      margin: 'auto',
      background: '#ffffff',
      color: '#18344b',
      borderRadius: '16px',
      boxShadow: '0 24px 64px rgba(15, 23, 42, 0.28)',
      boxSizing: 'border-box'
    });

    this.lightboxHeadElement = document.createElement('div');
    Object.assign(this.lightboxHeadElement.style, {
      display: 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '0 0 12px 0',
      borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
    });

    this.lightboxTitleElement = document.createElement('div');
    Object.assign(this.lightboxTitleElement.style, {
      fontSize: '16px',
      fontWeight: '600',
      color: 'inherit'
    });

    this.lightboxCloseButton = document.createElement('button');
    this.lightboxCloseButton.type = 'button';
    this.lightboxCloseButton.textContent = 'Close';
    Object.assign(this.lightboxCloseButton.style, {
      border: '1px solid rgba(15, 23, 42, 0.12)',
      borderRadius: '10px',
      background: 'rgba(255, 255, 255, 0.92)',
      color: '#18344b',
      padding: '6px 10px',
      cursor: 'pointer'
    });

    this.lightboxBodyElement = document.createElement('div');
    Object.assign(this.lightboxBodyElement.style, {
      flex: '1 1 auto',
      minWidth: '0',
      minHeight: '0',
      overflow: 'auto',
      boxSizing: 'border-box'
    });

    this.lightboxHeadElement.appendChild(this.lightboxTitleElement);
    this.lightboxHeadElement.appendChild(this.lightboxCloseButton);
    this.lightboxDialogElement.appendChild(this.lightboxHeadElement);
    this.lightboxDialogElement.appendChild(this.lightboxBodyElement);
    this.lightboxElement.appendChild(this.lightboxBackdropElement);
    this.lightboxElement.appendChild(this.lightboxDialogElement);

    host.appendChild(this.actionLayoutElement);
    this.actionLayoutElement.appendChild(this.surfaceElement);
    this.surfaceElement.appendChild(this.canvas);
    this.surfaceElement.appendChild(this.overlayElement);
    this.overlayElement.appendChild(this.overlayPanelElement);
    this.actionLayoutElement.appendChild(this.layoutPanelElement);

    (globalOverlayHost ?? host).appendChild(this.lightboxElement);
  }

  createActionIframe(url, iframeOptions = {}) {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    Object.assign(iframe.style, {
      width: '100%',
      height: '100%',
      border: '0',
      display: 'block',
      background: '#ffffff'
    });
    if (iframeOptions.sandbox) {
      iframe.setAttribute('sandbox', iframeOptions.sandbox);
    }
    if (iframeOptions.allow) {
      iframe.setAttribute('allow', iframeOptions.allow);
    }
    if (iframeOptions.loading) {
      iframe.loading = iframeOptions.loading;
    }
    if (iframeOptions.referrerPolicy) {
      iframe.referrerPolicy = iframeOptions.referrerPolicy;
    }
    return iframe;
  }

  clearElementChildren(element) {
    if (!element) {
      return;
    }
    element.innerHTML = '';
  }

  applyActionPanelContent(bodyElement, request, action) {
    this.clearElementChildren(bodyElement);
    if (!bodyElement || !request) {
      return;
    }

    if (request.renderMode === 'iframe') {
      bodyElement.appendChild(this.createActionIframe(request.url, action.iframe));
      return;
    }

    if (request.renderMode === 'text') {
      bodyElement.textContent = request.content;
      return;
    }

    bodyElement.innerHTML = request.content;
  }

  updateActionPanelHeader(headElement, titleElement, closeButton, title, closeable) {
    if (!headElement || !titleElement || !closeButton) {
      return;
    }
    titleElement.textContent = title || '';
    closeButton.style.display = closeable ? 'inline-flex' : 'none';
    headElement.style.display = title || closeable ? 'flex' : 'none';
  }

  applyLayoutPanelPlacement(placement, panelOptions = {}) {
    if (!this.actionLayoutElement || !this.layoutPanelElement || !this.surfaceElement) {
      return;
    }

    const panelSize = panelOptions.size || '320px';
    this.actionLayoutElement.style.gap = panelOptions.gap || '16px';
    this.layoutPanelElement.style.width = '';
    this.layoutPanelElement.style.height = '';

    if (placement === 'left' || placement === 'right') {
      this.actionLayoutElement.style.flexDirection = 'row';
      this.layoutPanelElement.style.width = panelSize;
      this.layoutPanelElement.style.height = '100%';
    } else {
      this.actionLayoutElement.style.flexDirection = 'column';
      this.layoutPanelElement.style.width = '100%';
      this.layoutPanelElement.style.height = panelSize;
    }

    this.surfaceElement.style.order = placement === 'left' || placement === 'above' ? '2' : '1';
    this.layoutPanelElement.style.order = placement === 'left' || placement === 'above' ? '1' : '2';
  }

  applyActionPanelStyles(elements, action) {
    if (!elements?.card || !elements?.body) {
      return;
    }
    const panel = action.panel ?? normalizeClickActionPanelOptions();
    Object.assign(elements.card.style, {
      padding: panel.padding,
      background: panel.background,
      color: panel.color,
      border: panel.border,
      borderRadius: panel.borderRadius || (action.mode === 'overlay' ? '16px' : '14px'),
      boxShadow: action.mode === 'overlay' ? '0 18px 48px rgba(15, 23, 42, 0.22)' : 'none'
    });
    elements.body.style.padding = '0';
  }

  prefersReducedMotion() {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  getActionUiAnimationDuration(immediate = false) {
    if (immediate || this.prefersReducedMotion()) {
      return 0;
    }
    return DEFAULT_ACTION_UI_ANIMATION_DURATION;
  }

  setActionUiAnimationState(key, state) {
    this.actionUiAnimations.set(key, state);
  }

  cancelActionUiAnimation(key) {
    const pending = this.actionUiAnimations.get(key);
    if (!pending) {
      return;
    }
    if (pending.frame != null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(pending.frame);
    }
    if (pending.timeout != null) {
      clearTimeout(pending.timeout);
    }
    this.actionUiAnimations.delete(key);
  }

  cancelAllActionUiAnimations() {
    this.actionUiAnimations.forEach((_, key) => {
      this.cancelActionUiAnimation(key);
    });
  }

  getActionPanelHiddenTransform(placement) {
    if (placement === 'left') {
      return 'translate3d(-20px, 0, 0)';
    }
    if (placement === 'right') {
      return 'translate3d(20px, 0, 0)';
    }
    if (placement === 'above') {
      return 'translate3d(0, -20px, 0)';
    }
    return 'translate3d(0, 20px, 0)';
  }

  finishPanelVisibility(elements, { visible, resetLayout = false } = {}) {
    if (!elements?.root || !elements?.card) {
      if (resetLayout) {
        this.resetActionLayout();
      }
      return;
    }

    elements.root.style.display = visible ? 'block' : 'none';
    elements.root.style.pointerEvents = visible ? 'auto' : '';
    elements.card.style.transition = '';
    elements.card.style.opacity = '1';
    elements.card.style.transform = 'translate3d(0, 0, 0)';
    elements.card.style.willChange = '';

    if (!visible && resetLayout) {
      this.resetActionLayout();
    }
  }

  animatePanelVisibility(elements, placement, { visible, immediate = false, resetLayout = false } = {}) {
    if (!elements?.root || !elements?.card) {
      if (!visible && resetLayout) {
        this.resetActionLayout();
      }
      return;
    }

    const key = elements.animationKey;
    this.cancelActionUiAnimation(key);

    const duration = this.getActionUiAnimationDuration(immediate);
    const hiddenTransform = this.getActionPanelHiddenTransform(placement);

    if (visible) {
      elements.root.style.display = 'block';
      elements.root.style.pointerEvents = 'auto';

      if (duration <= 0 || typeof requestAnimationFrame !== 'function') {
        this.finishPanelVisibility(elements, { visible: true });
        return;
      }

      elements.card.style.transition = 'none';
      elements.card.style.opacity = '0';
      elements.card.style.transform = hiddenTransform;
      elements.card.style.willChange = 'opacity, transform';

      const frame = requestAnimationFrame(() => {
        elements.card.style.transition = `opacity ${duration}ms ${ACTION_UI_ANIMATION_EASING}, transform ${duration}ms ${ACTION_UI_ANIMATION_EASING}`;
        elements.card.style.opacity = '1';
        elements.card.style.transform = 'translate3d(0, 0, 0)';
        const timeout = setTimeout(() => {
          if (this.actionUiAnimations.get(key)?.timeout !== timeout) {
            return;
          }
          this.actionUiAnimations.delete(key);
          this.finishPanelVisibility(elements, { visible: true });
        }, duration + 40);
        this.setActionUiAnimationState(key, { timeout });
      });
      this.setActionUiAnimationState(key, { frame });
      return;
    }

    if (elements.root.style.display === 'none') {
      this.finishPanelVisibility(elements, { visible: false, resetLayout });
      return;
    }

    if (duration <= 0 || typeof requestAnimationFrame !== 'function') {
      this.finishPanelVisibility(elements, { visible: false, resetLayout });
      return;
    }

    elements.root.style.pointerEvents = 'none';
    elements.card.style.transition = `opacity ${duration}ms ${ACTION_UI_ANIMATION_EASING}, transform ${duration}ms ${ACTION_UI_ANIMATION_EASING}`;
    elements.card.style.opacity = '1';
    elements.card.style.transform = 'translate3d(0, 0, 0)';
    elements.card.style.willChange = 'opacity, transform';

    const frame = requestAnimationFrame(() => {
      elements.card.style.opacity = '0';
      elements.card.style.transform = hiddenTransform;
    });
    const timeout = setTimeout(() => {
      if (this.actionUiAnimations.get(key)?.timeout !== timeout) {
        return;
      }
      this.actionUiAnimations.delete(key);
      this.finishPanelVisibility(elements, { visible: false, resetLayout });
    }, duration + 40);
    this.setActionUiAnimationState(key, { frame, timeout });
  }

  finishLightboxVisibility(visible) {
    if (!this.lightboxElement || !this.lightboxBackdropElement || !this.lightboxDialogElement) {
      return;
    }

    this.lightboxElement.style.display = visible ? 'flex' : 'none';
    this.lightboxElement.style.pointerEvents = visible ? 'auto' : '';
    this.lightboxBackdropElement.style.transition = '';
    this.lightboxBackdropElement.style.opacity = '1';
    this.lightboxDialogElement.style.transition = '';
    this.lightboxDialogElement.style.opacity = '1';
    this.lightboxDialogElement.style.transform = 'translate3d(0, 0, 0) scale(1)';
    this.lightboxDialogElement.style.willChange = '';
  }

  animateLightboxVisibility(visible, { immediate = false } = {}) {
    if (!this.lightboxElement || !this.lightboxBackdropElement || !this.lightboxDialogElement) {
      return;
    }

    this.cancelActionUiAnimation('lightbox');

    const duration = this.getActionUiAnimationDuration(immediate);
    const hiddenTransform = 'translate3d(0, 18px, 0) scale(0.985)';

    if (visible) {
      this.lightboxElement.style.display = 'flex';
      this.lightboxElement.style.pointerEvents = 'auto';

      if (duration <= 0 || typeof requestAnimationFrame !== 'function') {
        this.finishLightboxVisibility(true);
        return;
      }

      this.lightboxBackdropElement.style.transition = 'none';
      this.lightboxBackdropElement.style.opacity = '0';
      this.lightboxDialogElement.style.transition = 'none';
      this.lightboxDialogElement.style.opacity = '0';
      this.lightboxDialogElement.style.transform = hiddenTransform;
      this.lightboxDialogElement.style.willChange = 'opacity, transform';

      const frame = requestAnimationFrame(() => {
        this.lightboxBackdropElement.style.transition = `opacity ${duration}ms ${ACTION_UI_ANIMATION_EASING}`;
        this.lightboxBackdropElement.style.opacity = '1';
        this.lightboxDialogElement.style.transition = `opacity ${duration}ms ${ACTION_UI_ANIMATION_EASING}, transform ${duration}ms ${ACTION_UI_ANIMATION_EASING}`;
        this.lightboxDialogElement.style.opacity = '1';
        this.lightboxDialogElement.style.transform = 'translate3d(0, 0, 0) scale(1)';
        const timeout = setTimeout(() => {
          if (this.actionUiAnimations.get('lightbox')?.timeout !== timeout) {
            return;
          }
          this.actionUiAnimations.delete('lightbox');
          this.finishLightboxVisibility(true);
        }, duration + 40);
        this.setActionUiAnimationState('lightbox', { timeout });
      });
      this.setActionUiAnimationState('lightbox', { frame });
      return;
    }

    if (this.lightboxElement.style.display === 'none') {
      this.finishLightboxVisibility(false);
      return;
    }

    if (duration <= 0 || typeof requestAnimationFrame !== 'function') {
      this.finishLightboxVisibility(false);
      return;
    }

    this.lightboxElement.style.pointerEvents = 'none';
    this.lightboxBackdropElement.style.transition = `opacity ${duration}ms ${ACTION_UI_ANIMATION_EASING}`;
    this.lightboxBackdropElement.style.opacity = '1';
    this.lightboxDialogElement.style.transition = `opacity ${duration}ms ${ACTION_UI_ANIMATION_EASING}, transform ${duration}ms ${ACTION_UI_ANIMATION_EASING}`;
    this.lightboxDialogElement.style.opacity = '1';
    this.lightboxDialogElement.style.transform = 'translate3d(0, 0, 0) scale(1)';
    this.lightboxDialogElement.style.willChange = 'opacity, transform';

    const frame = requestAnimationFrame(() => {
      this.lightboxBackdropElement.style.opacity = '0';
      this.lightboxDialogElement.style.opacity = '0';
      this.lightboxDialogElement.style.transform = hiddenTransform;
    });
    const timeout = setTimeout(() => {
      if (this.actionUiAnimations.get('lightbox')?.timeout !== timeout) {
        return;
      }
      this.actionUiAnimations.delete('lightbox');
      this.finishLightboxVisibility(false);
    }, duration + 40);
    this.setActionUiAnimationState('lightbox', { frame, timeout });
  }

  resetActionLayout() {
    if (this.actionLayoutElement) {
      this.actionLayoutElement.style.gap = '0px';
      this.actionLayoutElement.style.flexDirection = 'column';
    }
    if (this.surfaceElement) {
      this.surfaceElement.style.order = '1';
    }
    if (this.layoutPanelElement) {
      this.layoutPanelElement.style.order = '2';
    }
  }

  getLayoutPanelElements() {
    return {
      animationKey: 'layoutPanel',
      root: this.layoutPanelElement,
      card: this.layoutPanelCard
    };
  }

  getOverlayPanelElements() {
    return {
      animationKey: 'overlayPanel',
      root: this.overlayPanelElement,
      card: this.overlayPanelCard
    };
  }

  hideBuiltInActionUi({ immediate = false } = {}) {
    const activeUi = this.activeClickActionUi;
    const panelState = this.panelState ? { ...this.panelState } : null;
    this.activeClickActionUi = null;
    this.lightboxState = null;
    this.panelState = null;

    if (activeUi === 'lightbox') {
      this.animateLightboxVisibility(false, { immediate });
      this.animatePanelVisibility(this.getOverlayPanelElements(), panelState?.placement || 'below', { visible: false, immediate: true });
      this.animatePanelVisibility(this.getLayoutPanelElements(), panelState?.placement || 'below', { visible: false, immediate: true, resetLayout: true });
      return this;
    }

    if (activeUi === 'panel' && panelState?.mode === 'overlay') {
      this.animateLightboxVisibility(false, { immediate: true });
      this.animatePanelVisibility(this.getLayoutPanelElements(), panelState.placement || 'below', { visible: false, immediate: true, resetLayout: true });
      this.animatePanelVisibility(this.getOverlayPanelElements(), panelState.placement || 'below', { visible: false, immediate });
      return this;
    }

    if (activeUi === 'panel' && panelState?.mode === 'layout') {
      this.animateLightboxVisibility(false, { immediate: true });
      this.animatePanelVisibility(this.getOverlayPanelElements(), panelState.placement || 'below', { visible: false, immediate: true });
      this.animatePanelVisibility(this.getLayoutPanelElements(), panelState.placement || 'below', { visible: false, immediate, resetLayout: true });
      return this;
    }

    this.animateLightboxVisibility(false, { immediate: true });
    this.animatePanelVisibility(this.getOverlayPanelElements(), 'below', { visible: false, immediate: true });
    this.animatePanelVisibility(this.getLayoutPanelElements(), 'below', { visible: false, immediate: true, resetLayout: true });
    return this;
  }

  showPanelAction(action, request) {
    const isOverlay = action.mode === 'overlay';
    const activeElements = isOverlay
      ? {
        root: this.overlayPanelElement,
        card: this.overlayPanelCard,
        head: this.overlayPanelHead,
        title: this.overlayPanelTitleElement,
        closeButton: this.overlayPanelCloseButton,
        body: this.overlayPanelBodyElement
      }
      : {
        root: this.layoutPanelElement,
        card: this.layoutPanelCard,
        head: this.layoutPanelHead,
        title: this.layoutPanelTitleElement,
        closeButton: this.layoutPanelCloseButton,
        body: this.layoutPanelBodyElement
      };

    const inactiveRoot = isOverlay ? this.layoutPanelElement : this.overlayPanelElement;
    if (inactiveRoot) {
      inactiveRoot.style.display = 'none';
    }

    const placement = action.placement || 'below';
    const panelOptions = action.panel ?? normalizeClickActionPanelOptions();
    this.applyActionPanelStyles(activeElements, action);
    this.updateActionPanelHeader(activeElements.head, activeElements.title, activeElements.closeButton, request.title, panelOptions.closeable !== false);
    this.applyActionPanelContent(activeElements.body, request, action);
    activeElements.root.className = `${isOverlay ? 'geocanvas-overlay-panel' : 'geocanvas-layout-panel'}${action.className ? ` ${action.className}` : ''}`;

    if (isOverlay) {
      Object.assign(this.overlayPanelElement.style, {
        display: 'block',
        top: '',
        right: '',
        bottom: '',
        left: '',
        width: '',
        height: '',
        maxWidth: '100%',
        maxHeight: '100%'
      });
      if (placement === 'left') {
        this.overlayPanelElement.style.left = '12px';
        this.overlayPanelElement.style.top = '12px';
        this.overlayPanelElement.style.bottom = '12px';
        this.overlayPanelElement.style.width = panelOptions.size;
      } else if (placement === 'right') {
        this.overlayPanelElement.style.right = '12px';
        this.overlayPanelElement.style.top = '12px';
        this.overlayPanelElement.style.bottom = '12px';
        this.overlayPanelElement.style.width = panelOptions.size;
      } else if (placement === 'above') {
        this.overlayPanelElement.style.left = '12px';
        this.overlayPanelElement.style.right = '12px';
        this.overlayPanelElement.style.top = '12px';
        this.overlayPanelElement.style.height = panelOptions.size;
      } else {
        this.overlayPanelElement.style.left = '12px';
        this.overlayPanelElement.style.right = '12px';
        this.overlayPanelElement.style.bottom = '12px';
        this.overlayPanelElement.style.height = panelOptions.size;
      }
      this.animatePanelVisibility(this.getOverlayPanelElements(), placement, { visible: true });
    } else {
      this.animatePanelVisibility(this.getOverlayPanelElements(), placement, { visible: false, immediate: true });
      this.applyLayoutPanelPlacement(placement, panelOptions);
      this.animatePanelVisibility(this.getLayoutPanelElements(), placement, { visible: true });
    }

    this.activeClickActionUi = 'panel';
    this.panelState = {
      mode: action.mode,
      placement,
      closeOnEscape: panelOptions.closeable !== false,
      closeOnEmptyRegionClick: panelOptions.closeOnEmptyRegionClick === true,
      closeOnMapClick: panelOptions.closeOnMapClick === true
    };
  }

  showLightboxAction(action, request) {
    if (!this.lightboxElement || !this.lightboxDialogElement || !this.lightboxBodyElement) {
      return;
    }
    const lightbox = action.lightbox ?? normalizeClickActionLightboxOptions();
    this.lightboxElement.className = `geocanvas-lightbox${action.className ? ` ${action.className}` : ''}`;
    this.lightboxBackdropElement.style.background = lightbox.backdrop;
    Object.assign(this.lightboxDialogElement.style, {
      width: lightbox.width,
      maxWidth: lightbox.maxWidth,
      height: lightbox.height,
      maxHeight: `min(${lightbox.maxHeight}, calc(100dvh - 48px))`,
      padding: lightbox.padding,
      background: lightbox.background,
      color: lightbox.color,
      borderRadius: lightbox.borderRadius,
      boxShadow: lightbox.boxShadow
    });
    this.lightboxBodyElement.style.padding = '0';
    this.updateActionPanelHeader(
      this.lightboxHeadElement,
      this.lightboxTitleElement,
      this.lightboxCloseButton,
      request.title,
      lightbox.showCloseButton !== false
    );
    this.applyActionPanelContent(this.lightboxBodyElement, request, action);
    this.animateLightboxVisibility(true);
    this.activeClickActionUi = 'lightbox';
    this.lightboxState = {
      closeOnBackdrop: lightbox.closeOnBackdrop !== false,
      closeOnEscape: lightbox.closeOnEscape !== false
    };
  }

  closeBuiltInActionUi() {
    return this.hideBuiltInActionUi();
  }

  executeBuiltInClickAction(action, payload) {
    const request = resolveClickActionRequest(action, payload, this);
    if (!request) {
      return;
    }

    if (action.type === 'navigate') {
      if (typeof window === 'undefined') {
        return;
      }
      if (action.target === 'blank') {
        window.open?.(request.url, '_blank', 'noopener');
        return;
      }
      if (window.location?.assign) {
        window.location.assign(request.url);
      } else if (window.location) {
        window.location.href = request.url;
      }
      return;
    }

    this.hideBuiltInActionUi({ immediate: true });

    if (action.type === 'lightbox') {
      this.showLightboxAction(action, request);
      return;
    }

    if (action.type === 'panel') {
      this.showPanelAction(action, request);
    }
  }

  onDocumentKeyDown(event) {
    if (event?.key !== 'Escape') {
      return;
    }
    if (this.lightboxState?.closeOnEscape || this.panelState?.closeOnEscape) {
      this.closeBuiltInActionUi();
    }
  }

  onLightboxBackdropClick() {
    if (this.lightboxState?.closeOnBackdrop) {
      this.closeBuiltInActionUi();
    }
  }

  onLightboxCloseClick() {
    this.closeBuiltInActionUi();
  }

  onLayoutPanelCloseClick() {
    this.closeBuiltInActionUi();
  }

  onOverlayPanelCloseClick() {
    this.closeBuiltInActionUi();
  }

  ensureLegendElement() {
    const host = this.getOverlayHostElement();
    if (!host) {
      this.legendElement = null;
      return;
    }

    const computedPosition = typeof window !== 'undefined' ? window.getComputedStyle(host).position : '';
    if (!computedPosition || computedPosition === 'static') {
      host.style.position = 'relative';
    }

    this.legendElement = document.createElement('div');
    this.legendElement.className = 'geocanvas-legend';
    Object.assign(this.legendElement.style, {
      position: 'absolute',
      display: 'none',
      zIndex: '24',
      pointerEvents: 'auto',
      maxWidth: '240px'
    });
    host.appendChild(this.legendElement);
    this.updateLegend();
  }

  getLegendSizeStyle(size = this.legendOptions?.size) {
    if (size === 'sm') {
      return {
        panelPadding: '10px 12px',
        panelGap: '8px',
        rowGap: '6px',
        fontSize: '12px',
        swatchSize: '12px',
        borderRadius: '10px'
      };
    }
    if (size === 'lg') {
      return {
        panelPadding: '14px 16px',
        panelGap: '12px',
        rowGap: '10px',
        fontSize: '14px',
        swatchSize: '16px',
        borderRadius: '14px'
      };
    }
    return {
      panelPadding: '12px 14px',
      panelGap: '10px',
      rowGap: '8px',
      fontSize: '13px',
      swatchSize: '14px',
      borderRadius: '12px'
    };
  }

  applyLegendPosition(position = this.legendOptions?.position) {
    if (!this.legendElement) {
      return;
    }

    this.legendElement.style.top = '';
    this.legendElement.style.right = '';
    this.legendElement.style.bottom = '';
    this.legendElement.style.left = '';

    const normalized = normalizeLegendPosition(position);
    if (normalized.includes('top')) {
      this.legendElement.style.top = '12px';
    } else {
      this.legendElement.style.bottom = '12px';
    }
    if (normalized.includes('right')) {
      this.legendElement.style.right = '12px';
    } else {
      this.legendElement.style.left = '12px';
    }
  }

  getLegendEntries() {
    return resolveLegendEntriesFromOptions(this.legendOptions, this.layers);
  }

  updateLegend() {
    if (!this.legendElement) {
      return;
    }

    const entries = this.getLegendEntries();
    if (!this.legendOptions?.enabled || !entries.length) {
      this.legendElement.style.display = 'none';
      this.legendElement.innerHTML = '';
      this.legendRenderKey = null;
      return;
    }

    const renderState = {
      position: this.legendOptions.position,
      size: this.legendOptions.size,
      type: this.legendOptions.type,
      interaction: this.legendOptions.interaction,
      entries: entries.map((entry) => ({
        id: entry.id,
        label: entry.label,
        color: entry.color,
        visible: entry.visible,
        interactive: entry.interactive,
        layerId: entry.layerId
      }))
    };
    const renderKey = JSON.stringify(renderState);
    if (this.legendRenderKey === renderKey) {
      this.legendElement.style.display = 'block';
      return;
    }

    const sizeStyle = this.getLegendSizeStyle(this.legendOptions.size);
    this.applyLegendPosition(this.legendOptions.position);
    this.legendElement.innerHTML = '';

    const card = document.createElement('div');
    Object.assign(card.style, {
      display: 'grid',
      gap: sizeStyle.rowGap,
      padding: sizeStyle.panelPadding,
      background: 'rgba(255, 255, 255, 0.94)',
      border: '1px solid rgba(15, 23, 42, 0.10)',
      borderRadius: sizeStyle.borderRadius,
      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
      backdropFilter: 'blur(8px)',
      minWidth: '140px'
    });

    entries.forEach((entry) => {
      const row = entry.interactive ? document.createElement('button') : document.createElement('div');
      if (entry.interactive) {
        row.type = 'button';
        row.dataset.legendLayerId = entry.layerId ?? '';
      }
      Object.assign(row.style, {
        display: 'grid',
        gridTemplateColumns: `${sizeStyle.swatchSize} minmax(0, 1fr)`,
        alignItems: 'center',
        gap: sizeStyle.panelGap,
        border: '0',
        padding: '0',
        margin: '0',
        background: 'transparent',
        color: '#18344b',
        textAlign: 'left',
        cursor: entry.interactive ? 'pointer' : 'default',
        fontSize: sizeStyle.fontSize,
        fontFamily: 'inherit'
      });

      const swatch = document.createElement('span');
      Object.assign(swatch.style, {
        width: sizeStyle.swatchSize,
        height: sizeStyle.swatchSize,
        borderRadius: '999px',
        background: entry.color,
        border: '1px solid rgba(15, 23, 42, 0.16)',
        boxSizing: 'border-box',
        opacity: entry.visible === false ? '0.35' : '1'
      });

      const label = document.createElement('span');
      label.textContent = entry.label;
      Object.assign(label.style, {
        minWidth: '0',
        overflowWrap: 'anywhere',
        opacity: entry.visible === false ? '0.6' : '1',
        textDecoration: entry.visible === false ? 'line-through' : 'none'
      });

      row.appendChild(swatch);
      row.appendChild(label);
      card.appendChild(row);
    });

    this.legendElement.appendChild(card);
    this.legendElement.style.display = 'block';
    this.legendRenderKey = renderKey;
  }

  onLegendClick(event) {
    const button = event.target?.closest?.('[data-legend-layer-id]');
    if (!button || this.legendOptions?.type !== 'layers' || this.legendOptions?.interaction !== 'toggle-layer-visibility') {
      return;
    }

    const layerId = button.dataset.legendLayerId;
    if (!layerId) {
      return;
    }

    event.preventDefault?.();
    const layer = this.layers.find((candidate) => candidate.id === layerId);
    if (!layer) {
      return;
    }
    this.setLayerVisibility(layerId, !layer.visible);
  }

  ensureTooltipElement() {
    const host = this.getOverlayHostElement();
    if (!host) {
      this.tooltipElement = null;
      this.tooltipContentElement = null;
      this.tooltipPointerElement = null;
      return;
    }

    const computedPosition = typeof window !== 'undefined' ? window.getComputedStyle(host).position : '';
    if (!computedPosition || computedPosition === 'static') {
      host.style.position = 'relative';
    }

    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'geocanvas-tooltip';
    Object.assign(this.tooltipElement.style, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      display: 'none',
      zIndex: '30',
      minWidth: '120px',
      maxWidth: '280px',
      pointerEvents: 'none'
    });

    this.tooltipContentElement = document.createElement('div');
    this.tooltipPointerElement = document.createElement('div');
    this.tooltipPointerElement.className = 'geocanvas-tooltip-pointer';

    Object.assign(this.tooltipContentElement.style, {
      position: 'relative',
      zIndex: '1',
      padding: '10px 12px',
      borderRadius: '10px',
      background: 'rgba(24, 34, 48, 0.96)',
      color: '#ffffff',
      boxShadow: '0 18px 40px rgba(16, 31, 52, 0.22)',
      fontFamily: 'inherit',
      fontSize: '12px',
      lineHeight: '1.45'
    });

    Object.assign(this.tooltipPointerElement.style, {
      position: 'absolute',
      width: '12px',
      height: '12px',
      background: 'rgba(24, 34, 48, 0.96)',
      transform: 'rotate(45deg)',
      display: 'none',
      zIndex: '0'
    });

    this.tooltipElement.appendChild(this.tooltipContentElement);
    this.tooltipElement.appendChild(this.tooltipPointerElement);
    host.appendChild(this.tooltipElement);
    this.applyTooltipClassName();
    this.applyTooltipPointerBehavior();
    this.applyTooltipInlineStyle();
  }

  applyTooltipClassName(tooltipOptions = this.tooltipOptions) {
    if (!this.tooltipElement) {
      return;
    }
    const extra = tooltipOptions.className ? ` ${tooltipOptions.className}` : '';
    this.tooltipElement.className = `geocanvas-tooltip${extra}`;
  }

  applyTooltipPointerBehavior() {
    if (!this.tooltipElement) {
      return;
    }
    this.tooltipElement.style.pointerEvents = this.tooltipOptions.interactive ? 'auto' : 'none';
  }

  applyTooltipInlineStyle(tooltipOptions = this.tooltipOptions) {
    if (!this.tooltipContentElement) {
      return;
    }

    const style = tooltipOptions.style ?? {};
    Object.assign(this.tooltipContentElement.style, {
      background: style.background ?? 'rgba(24, 34, 48, 0.96)',
      color: style.color ?? '#ffffff',
      borderRadius: style.borderRadius ?? '10px',
      padding: style.padding ?? '10px 12px',
      border: style.border ?? 'none',
      boxShadow: style.boxShadow ?? '0 18px 40px rgba(16, 31, 52, 0.22)',
      fontFamily: style.fontFamily ?? 'inherit',
      fontSize: style.fontSize ?? '12px',
      lineHeight: style.lineHeight ?? '1.45',
      minWidth: style.minWidth ?? '',
      maxWidth: style.maxWidth ?? ''
    });

    if (this.tooltipPointerElement) {
      this.tooltipPointerElement.style.background = style.background ?? 'rgba(24, 34, 48, 0.96)';
      this.tooltipPointerElement.style.display = tooltipOptions.showPointer ? 'block' : 'none';
    }
  }

  ensureControlsElement() {
    const host = this.getOverlayHostElement();
    if (!host) {
      this.controlsElement = null;
      return;
    }

    this.controlsElement = document.createElement('div');
    this.controlsElement.className = 'geocanvas-controls';
    Object.assign(this.controlsElement.style, {
      position: 'absolute',
      display: 'none',
      zIndex: '25',
      gap: '8px',
      flexDirection: 'column'
    });

    const createButton = (label, title) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.title = title;
      button.setAttribute('aria-label', title);
      Object.assign(button.style, {
        width: '42px',
        height: '42px',
        border: '1px solid rgba(16, 37, 62, 0.14)',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.92)',
        color: '#18344b',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 12px 24px rgba(22, 48, 82, 0.12)'
      });
      return button;
    };

    this.zoomInButton = createButton('+', 'Zoom in');
    this.zoomOutButton = createButton('-', 'Zoom out');
    this.homeButton = createButton('H', 'Reset view');

    this.controlsElement.appendChild(this.zoomInButton);
    this.controlsElement.appendChild(this.zoomOutButton);
    this.controlsElement.appendChild(this.homeButton);
    this.updateHomeButtonIcon();
    host.appendChild(this.controlsElement);
    this.updateControlsVisibility();
  }

  updateHomeButtonIcon() {
    if (!this.homeButton) {
      return;
    }

    const iconUrl = createInlineSvgDataUrl(this.options.homeIconSvg, this.homeButton.style.color || '#18344b');
    if (iconUrl) {
      this.homeButton.textContent = '';
      this.homeButton.style.backgroundImage = `url("${iconUrl}")`;
      this.homeButton.style.backgroundPosition = 'center';
      this.homeButton.style.backgroundRepeat = 'no-repeat';
      this.homeButton.style.backgroundSize = '18px 18px';
      return;
    }

    this.homeButton.textContent = 'H';
    this.homeButton.style.backgroundImage = '';
    this.homeButton.style.backgroundPosition = '';
    this.homeButton.style.backgroundRepeat = '';
    this.homeButton.style.backgroundSize = '';
  }

  updateControlsVisibility() {
    if (!this.controlsElement) {
      return;
    }

    this.controlsElement.style.display = this.options.showControls ? 'flex' : 'none';
    this.controlsElement.style.top = '';
    this.controlsElement.style.right = '';
    this.controlsElement.style.bottom = '';
    this.controlsElement.style.left = '';
    this.controlsElement.style.transform = '';

    const position = normalizeControlsPosition(this.options.controlsPosition);
    const isCenteredRow = position === 'top-center' || position === 'bottom-center';
    this.controlsElement.style.flexDirection = isCenteredRow ? 'row' : 'column';
    if (position.includes('top')) {
      this.controlsElement.style.top = '12px';
    } else {
      this.controlsElement.style.bottom = '12px';
    }
    if (position.includes('center')) {
      this.controlsElement.style.left = '50%';
      this.controlsElement.style.transform = 'translateX(-50%)';
    } else if (position.includes('right')) {
      this.controlsElement.style.right = '12px';
    } else {
      this.controlsElement.style.left = '12px';
    }
  }

  applyPanBehavior() {
    this.canvas.style.touchAction = (this.options.panEnabled || this.options.pinchZoomEnabled) ? 'none' : 'auto';
    if (!this.hoverTarget) {
      this.canvas.style.cursor = this.options.panEnabled ? 'grab' : '';
    }
  }

  showTooltip(payload, point, reason = 'move') {
    if (!this.tooltipElement || !this.tooltipOptions.enabled || this.dragState?.active) {
      return;
    }

    const effectiveTooltipOptions = mergeTooltipPresentationOptions(this.tooltipOptions, payload?.layerTooltip);

    if (!shouldShowTooltipForPayload(effectiveTooltipOptions, payload)) {
      this.hideTooltip();
      return;
    }

    if (this.tooltipHideFrame) {
      cancelAnimationFrame(this.tooltipHideFrame);
      this.tooltipHideFrame = null;
    }

    const anchorPoint = this.tooltipOptions.followPointer
      ? point
      : reason === 'enter' || reason === 'click' || !this.tooltipState.anchorPoint
        ? point
        : this.tooltipState.anchorPoint;
    const html = createTooltipHtml(effectiveTooltipOptions, payload);
    if (!html) {
      this.hideTooltip();
      return;
    }

    this.tooltipState.visible = true;
    this.tooltipState.payload = payload;
    this.tooltipState.anchorPoint = anchorPoint;
    this.applyTooltipClassName(effectiveTooltipOptions);
    this.applyTooltipInlineStyle(effectiveTooltipOptions);
    if (this.tooltipContentElement) {
      this.tooltipContentElement.innerHTML = html;
    } else {
      this.tooltipElement.innerHTML = html;
    }
    this.tooltipElement.style.display = 'block';
    this.positionTooltip(anchorPoint);
  }

  positionTooltip(point) {
    if (!this.tooltipElement || !this.tooltipState.visible) {
      return;
    }

    const host = this.getOverlayHostElement();
    const hostRect = host.getBoundingClientRect();
    const tooltipWidth = this.tooltipElement.offsetWidth;
    const tooltipHeight = this.tooltipElement.offsetHeight;
    const placement = this.resolveTooltipPlacement(point, tooltipWidth, tooltipHeight, hostRect);
    const coords = this.computeTooltipCoordinates(point, tooltipWidth, tooltipHeight, hostRect, placement);

    this.tooltipState.anchorPosition = placement;
    this.tooltipElement.style.left = `${coords.x}px`;
    this.tooltipElement.style.top = `${coords.y}px`;
    this.positionTooltipPointer(placement, tooltipWidth, tooltipHeight);
  }

  resolveTooltipPlacement(point, tooltipWidth, tooltipHeight, hostRect) {
    if (this.tooltipOptions.position !== 'auto') {
      return this.tooltipOptions.position;
    }

    const spaceTop = point.y;
    const spaceBottom = hostRect.height - point.y;
    const spaceLeft = point.x;
    const spaceRight = hostRect.width - point.x;
    const verticalFirst = Math.max(spaceTop, spaceBottom) >= Math.max(spaceLeft, spaceRight);

    if (verticalFirst) {
      return spaceBottom >= tooltipHeight + 20 ? 'bottom' : 'top';
    }

    return spaceRight >= tooltipWidth + 20 ? 'right' : 'left';
  }

  computeTooltipCoordinates(point, tooltipWidth, tooltipHeight, hostRect, placement) {
    const gutter = 8;
    const pointerOffset = this.tooltipOptions.showPointer ? 8 : 0;
    let x = point.x + this.tooltipOptions.offsetX;
    let y = point.y + this.tooltipOptions.offsetY;

    if (placement === 'top') {
      x = point.x - tooltipWidth / 2;
      y = point.y - tooltipHeight - this.tooltipOptions.offsetY - pointerOffset;
    } else if (placement === 'bottom') {
      x = point.x - tooltipWidth / 2;
      y = point.y + this.tooltipOptions.offsetY + pointerOffset;
    } else if (placement === 'left') {
      x = point.x - tooltipWidth - this.tooltipOptions.offsetX - pointerOffset;
      y = point.y - tooltipHeight / 2;
    } else if (placement === 'right') {
      x = point.x + this.tooltipOptions.offsetX + pointerOffset;
      y = point.y - tooltipHeight / 2;
    }

    return {
      x: Math.min(Math.max(gutter, x), Math.max(gutter, hostRect.width - tooltipWidth - gutter)),
      y: Math.min(Math.max(gutter, y), Math.max(gutter, hostRect.height - tooltipHeight - gutter))
    };
  }

  positionTooltipPointer(placement, tooltipWidth, tooltipHeight) {
    if (!this.tooltipPointerElement) {
      return;
    }

    this.tooltipPointerElement.style.display = this.tooltipOptions.showPointer ? 'block' : 'none';
    if (!this.tooltipOptions.showPointer) {
      return;
    }

    this.tooltipPointerElement.style.left = '';
    this.tooltipPointerElement.style.right = '';
    this.tooltipPointerElement.style.top = '';
    this.tooltipPointerElement.style.bottom = '';

    if (placement === 'top') {
      this.tooltipPointerElement.style.left = `${tooltipWidth / 2 - 6}px`;
      this.tooltipPointerElement.style.bottom = '-6px';
    } else if (placement === 'bottom') {
      this.tooltipPointerElement.style.left = `${tooltipWidth / 2 - 6}px`;
      this.tooltipPointerElement.style.top = '-6px';
    } else if (placement === 'left') {
      this.tooltipPointerElement.style.right = '-6px';
      this.tooltipPointerElement.style.top = `${tooltipHeight / 2 - 6}px`;
    } else {
      this.tooltipPointerElement.style.left = '-6px';
      this.tooltipPointerElement.style.top = `${tooltipHeight / 2 - 6}px`;
    }
  }

  destroy() {
    this.stopAnimation(false);
    this.hideBuiltInActionUi({ immediate: true });
    this.cancelAllActionUiAnimations();
    this.clearClusterExpansionTransitions();
    if (this.hoverTransitionFrame) {
      cancelAnimationFrame(this.hoverTransitionFrame);
      this.hoverTransitionFrame = null;
    }
    if (this.layerFadeFrame) {
      cancelAnimationFrame(this.layerFadeFrame);
      this.layerFadeFrame = null;
    }
    this.layerFadeTransitions.clear();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.canvas.removeEventListener('click', this.onClick);
    this.canvas.removeEventListener('dblclick', this.onDoubleClick);
    this.canvas.removeEventListener('wheel', this.onWheel);

    if (this.tooltipElement) {
      this.tooltipElement.removeEventListener('pointerenter', this.onTooltipEnter);
      this.tooltipElement.removeEventListener('pointerleave', this.onTooltipLeave);
      this.tooltipElement.removeEventListener('focusin', this.onTooltipFocusIn);
      this.tooltipElement.removeEventListener('focusout', this.onTooltipFocusOut);
      this.tooltipElement.remove();
    }
    if (this.legendElement) {
      this.legendElement.removeEventListener('click', this.onLegendClick);
      this.legendElement.remove();
    }

    if (this.zoomInButton) {
      this.zoomInButton.removeEventListener('click', this.onZoomInClick);
    }
    if (this.zoomOutButton) {
      this.zoomOutButton.removeEventListener('click', this.onZoomOutClick);
    }
    if (this.homeButton) {
      this.homeButton.removeEventListener('click', this.onHomeClick);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.onDocumentKeyDown);
    }
    if (this.lightboxBackdropElement) {
      this.lightboxBackdropElement.removeEventListener('click', this.onLightboxBackdropClick);
    }
    if (this.lightboxCloseButton) {
      this.lightboxCloseButton.removeEventListener('click', this.onLightboxCloseClick);
    }
    if (this.layoutPanelCloseButton) {
      this.layoutPanelCloseButton.removeEventListener('click', this.onLayoutPanelCloseClick);
    }
    if (this.overlayPanelCloseButton) {
      this.overlayPanelCloseButton.removeEventListener('click', this.onOverlayPanelCloseClick);
    }
    if (this.controlsElement) {
      this.controlsElement.remove();
    }
    if (this.layoutPanelElement) {
      this.layoutPanelElement.remove();
    }
    if (this.overlayPanelElement) {
      this.overlayPanelElement.remove();
    }
    if (this.lightboxElement) {
      this.lightboxElement.remove();
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.cancelMarkerAnimationFrame();

    this.handlers.clear();
    this.hitMap.clear();
    this.markerImageCache.clear();
    this.activeTouchPointers.clear();
    this.pinchState = null;
    this.lastTap = null;
  }
}

export const __internals = {
  normalizeGeoJSON,
  createLayerEntries,
  attachLayerMetadata,
  normalizeGeoJSONInput,
  normalizeLayerDefinition,
  normalizeSourceDefinition,
  normalizeAntimeridianMode,
  normalizeAntimeridianReferenceLongitude,
  normalizeFeatureEntriesForAntimeridian,
  normalizeLabelOptions,
  normalizePartialLabelOptions,
  normalizeRegionTransform,
  normalizeRegionTransformMap,
  normalizeFeatureGeocanvasMetadata,
  normalizeMarkerLabelPosition,
  normalizeMarkerLabelOptions,
  normalizePartialMarkerLabelOptions,
  normalizeMarkerClusterOptions,
  normalizePartialMarkerClusterOptions,
  normalizeMarkerType,
  normalizeMarkerImageOptions,
  normalizeMarkerAnimation,
  createMarkerImageSource,
  getMarkerImageCacheKey,
  resolveImageMarkerLayout,
  resolveMarkerAnimationPhase,
  resolveMarkerAnimationVisualState,
  scaleFontPixels,
  resolveMarkerLabelScale,
  resolveMarkerLabelRenderOptions,
  computeMarkerLabelText,
  computeMarkerLabelAnchor,
  createClusterMarker,
  clusterMarkersForDisplay,
  createMarkerRecord,
  normalizeEntityDefaults,
  resolveEntityDefaults,
  normalizeRegionStyleOptions,
  normalizePartialRegionStyleOptions,
  normalizeInteractionOptions,
  normalizePartialInteractionOptions,
  normalizeClickActionOptions,
  normalizePartialClickActionOptions,
  resolveInteractionConfig,
  normalizeLayerFilterInput,
  normalizeRegionCollection,
  resolveContextValue,
  resolveBindingValue,
  resolveTooltipBinding,
  resolveClickActionRequest,
  resolveBoundFeatureStyle,
  resolveRegionPresentationStyle,
  isFeatureInteractive,
  computeProjectedCoordinateBounds,
  collectProjectedBounds,
  computeLabelText,
  computeLabelAnchor,
  resolveRegionTransformDelta,
  computeBounds,
  computeCenterFromBounds,
  createFitTransform,
  encodeHitColor,
  decodeHitColor,
  interpolateColorValue,
  interpolateStyle,
  isPointOnSegment,
  isPointInRing,
  isPointOnRingBoundary,
  isPointInPolygonRings,
  getHoverIdentity,
  resolveGroupedTarget,
  deriveHoverTransition,
  mergeStyle,
  normalizeZoom,
  normalizeCenter,
  normalizeIdList,
  resolveLayerTargetIds,
  filterFeatureEntries,
  applyCameraTransform,
  invertCameraTransform,
  clampCameraAxis,
  clampCameraAnchor,
  normalizeTooltipOptions,
  normalizeLegendOptions,
  resolveLegendEntriesFromOptions,
  shouldShowTooltipForPayload,
  renderTooltipTemplate,
  createTooltipHtml,
  shouldPersistTooltip,
  escapeJavaScriptString,
  normalizeProjectionName,
  createProjection,
  invertProjection,
  normalizeCoordinatesForAntimeridian,
  projectFeatureEntries,
  easeInOutCubic,
  easeOutCubic,
  interpolateView,
  interpolateAnchor,
  getCameraTranslation,
  interpolateCameraTransform,
  interpolateAnimatedView,
  measureViewportSize,
  FEATURE_EVENT_NAMES,
  MARKER_EVENT_NAMES,
  VIEW_EVENT_NAMES,
  cloneViewState,
  didZoomChange,
  wrapLongitude,
  orthographicVisibility,
  orthographicForward,
  orthographicInverse,
  projectGlobeLineCoordinates,
  projectGlobePolygonRing,
  isGlobeProjection,
  hasProjectedGeometry
};
