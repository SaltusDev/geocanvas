import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GeoCanvas, __internals } from '../src/geocanvas.js';

const {
  normalizeGeoJSON,
  normalizeGeoJSONInput,
  createLayerEntries,
  attachLayerMetadata,
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
  getHoverIdentity,
  resolveGroupedTarget,
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
  normalizeProjectionName,
  createProjection,
  invertProjection,
  normalizeCoordinatesForAntimeridian,
  projectFeatureEntries,
  resolveInteractionConfig,
  easeInOutCubic,
  easeOutCubic,
  interpolateView,
  getCameraTranslation,
  interpolateCameraTransform,
  interpolateAnimatedView,
  measureViewportSize,
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
} = __internals;

function flattenProjectedPointsForTest(value, out = []) {
  if (!Array.isArray(value)) {
    return out;
  }
  if (value.length >= 2 && typeof value[0] === 'number') {
    out.push({ x: value[0], y: value[1] });
    return out;
  }
  value.forEach((entry) => flattenProjectedPointsForTest(entry, out));
  return out;
}

function computeFittedScreenBounds(entries, projectionName, width = 1200, height = 700, padding = 16) {
  const projection = createProjection(projectionName);
  projection.fitEntries?.(entries);
  const projectedEntries = projectFeatureEntries(entries, projection);
  const bounds = computeBounds(projectedEntries, 'projectedCoordinates');
  const transform = createFitTransform(bounds, width, height, padding);
  const projectedCenter = computeCenterFromBounds(bounds);
  const center = invertProjection(projection, projectedCenter.lon, projectedCenter.lat, { lon: 0, lat: 0 });
  const centerPoint = projection.forward(center.lon, center.lat);
  const anchor = transform.project(centerPoint.x, centerPoint.y);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  projectedEntries.forEach((entry) => {
    flattenProjectedPointsForTest(entry.projectedCoordinates).forEach((point) => {
      const basePoint = transform.project(point.x, point.y);
      const screenPoint = {
        x: (basePoint.x - anchor.x) + width / 2,
        y: (basePoint.y - anchor.y) + height / 2
      };
      minX = Math.min(minX, screenPoint.x);
      minY = Math.min(minY, screenPoint.y);
      maxX = Math.max(maxX, screenPoint.x);
      maxY = Math.max(maxY, screenPoint.y);
    });
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

test('normalizeGeoJSON flattens polygon, multipolygon, multiline, and point geometries', () => {
  const input = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'poly-1',
        properties: { name: 'A' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-10, -10], [10, -10], [10, 10], [-10, 10], [-10, -10]]]
        }
      },
      {
        type: 'Feature',
        properties: { id: 'multi-poly' },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [[[-50, 0], [-40, 0], [-40, 10], [-50, 10], [-50, 0]]],
            [[[40, 0], [50, 0], [50, 10], [40, 10], [40, 0]]]
          ]
        }
      },
      {
        type: 'Feature',
        id: 'lines',
        geometry: {
          type: 'MultiLineString',
          coordinates: [
            [[0, 0], [5, 5]],
            [[10, 10], [12, 8]]
          ]
        }
      },
      {
        type: 'Feature',
        id: 'points',
        geometry: {
          type: 'MultiPoint',
          coordinates: [[1, 1], [2, 2], [3, 3]]
        }
      }
    ]
  };

  const entries = normalizeGeoJSON(input);
  assert.equal(entries.length, 8);
  assert.equal(entries.filter((entry) => entry.kind === 'polygon').length, 3);
  assert.equal(entries.filter((entry) => entry.kind === 'line').length, 2);
  assert.equal(entries.filter((entry) => entry.kind === 'point').length, 3);
  assert.equal(entries[1].filterId, 'multi-poly');
  assert.match(entries[0].entityKey, /^feature:poly-1:polygon:/);
  assert.equal(entries[0].hoverKey, 'feature:poly-1:polygon:Polygon');

  const multiPolygonEntries = entries.filter((entry) => entry.filterId === 'multi-poly');
  assert.equal(multiPolygonEntries.length, 2);
  assert.equal(multiPolygonEntries[0].hoverKey, multiPolygonEntries[1].hoverKey);
});

test('layer helpers annotate entries and normalize defaults', () => {
  const layer = normalizeLayerDefinition(
    {
      id: 'world',
      name: 'World',
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'region-1',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-10, -10], [10, -10], [10, 10], [-10, 10], [-10, -10]]]
            }
          }
        ]
      }
    },
    0
  );

  const entries = createLayerEntries(layer.id, layer.name, layer.geojson, layer.order);
  assert.equal(layer.visible, true);
  assert.deepEqual(layer.includePolygonIds, []);
  assert.deepEqual(layer.excludePolygonIds, []);
  assert.equal(layer.sourceId, null);
  assert.deepEqual(layer.markers, []);
  assert.deepEqual(layer.lines, []);
  assert.equal(layer.bindings, undefined);
  assert.equal(layer.labels, undefined);
  assert.equal(layer.markerLabels, undefined);
  assert.equal(layer.markerClusters, undefined);
  assert.equal(layer.interaction, undefined);
  assert.equal(layer.antimeridianMode, 'auto');
  assert.equal(layer.antimeridianReferenceLon, null);
  assert.equal(layer.regionJoinField, 'id');
  assert.equal(layer.tooltip, undefined);
  assert.deepEqual(layer.defaults.markers, {
    labels: undefined,
    clusters: undefined,
    interaction: undefined,
    bindings: undefined
  });
  assert.deepEqual(layer.defaults.regions, {
    labels: undefined,
    interaction: undefined,
    bindings: undefined
  });
  assert.deepEqual(layer.defaults.lines, {
    bindings: undefined
  });
  assert.equal(layer.contributeToBounds, true);
  assert.equal(entries[0].layerId, 'world');
  assert.equal(entries[0].layerName, 'World');
  assert.match(entries[0].entityKey, /^layer:world:/);
  assert.match(entries[0].hoverKey, /^layer:world:/);

  const pacificLayer = normalizeLayerDefinition({
    id: 'pacific',
    antimeridianMode: 'unwrap',
    antimeridianReferenceLon: '180'
  }, 1);
  assert.equal(pacificLayer.antimeridianMode, 'unwrap');
  assert.equal(pacificLayer.antimeridianReferenceLon, 180);
});

test('source and region helpers normalize reusable source and layer data', () => {
  const source = normalizeSourceDefinition({ id: 'world', geojson: { type: 'FeatureCollection', features: [] } });
  assert.equal(source.id, 'world');
  assert.equal(source.name, 'world');

  const regions = normalizeRegionCollection([
    { regionCode: 'PT', title: 'Portugal', color: '#2a9d8f' },
    { regionCode: 'ES', title: 'Spain', color: '#e76f51' }
  ], 'regionCode');
  assert.equal(regions.get('PT').title, 'Portugal');

  const attached = attachLayerMetadata(
    normalizeGeoJSON({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'PT',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-10, 35], [-5, 35], [-5, 42], [-10, 42], [-10, 35]]]
          }
        }
      ]
    }),
    'countries',
    'Countries',
    0
  );
  assert.equal(attached[0].layerId, 'countries');
  assert.equal(attached[0].layerName, 'Countries');

  const attachedByProperty = attachLayerMetadata(
    normalizeGeoJSON({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { iso_a2: 'PT' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[-10, 35], [-5, 35], [-5, 42], [-10, 42], [-10, 35]]]
          }
        }
      ]
    }),
    'countries',
    'Countries',
    0,
    'iso_a2'
  );
  assert.equal(attachedByProperty[0].filterId, 'PT');
});

test('antimeridian helpers normalize accepted modes and references', () => {
  assert.equal(normalizeAntimeridianMode(), 'auto');
  assert.equal(normalizeAntimeridianMode('UNWRAP'), 'unwrap');
  assert.equal(normalizeAntimeridianMode('nope'), 'auto');
  assert.equal(normalizeAntimeridianReferenceLongitude('190'), -170);
  assert.equal(normalizeAntimeridianReferenceLongitude(''), null);
});

test('antimeridian normalization unwraps dateline-crossing geometry and can bias it to a reference longitude', () => {
  const polygon = [[
    [170, 50],
    [-170, 50],
    [-170, 60],
    [170, 60],
    [170, 50]
  ]];

  assert.deepEqual(
    normalizeCoordinatesForAntimeridian('polygon', polygon, { antimeridianMode: 'off' }),
    polygon
  );

  assert.deepEqual(
    normalizeCoordinatesForAntimeridian('polygon', polygon, { antimeridianMode: 'auto' }),
    [[
      [170, 50],
      [190, 50],
      [190, 60],
      [170, 60],
      [170, 50]
    ]]
  );

  assert.deepEqual(
    normalizeCoordinatesForAntimeridian('line', [[179, 10], [-179, 10]], {
      antimeridianMode: 'auto',
      antimeridianReferenceLon: -120
    }),
    [[-181, 10], [-179, 10]]
  );
});

test('feature-level antimeridian normalization keeps split multipolygon parts on the same side', () => {
  const entries = normalizeFeatureEntriesForAntimeridian([
    {
      sourceId: 'AK',
      kind: 'polygon',
      coordinates: [[
        [172, 52],
        [178, 52],
        [178, 58],
        [172, 58],
        [172, 52]
      ]]
    },
    {
      sourceId: 'AK',
      kind: 'polygon',
      coordinates: [[
        [-179, 52],
        [-173, 52],
        [-173, 58],
        [-179, 58],
        [-179, 52]
      ]]
    }
  ], {
    antimeridianMode: 'auto'
  });

  const firstBounds = computeBounds([{ kind: 'polygon', coordinates: entries[0].coordinates }], 'coordinates');
  const secondBounds = computeBounds([{ kind: 'polygon', coordinates: entries[1].coordinates }], 'coordinates');

  assert.deepEqual(entries[0].coordinates, [[
    [172, 52],
    [178, 52],
    [178, 58],
    [172, 58],
    [172, 52]
  ]]);
  assert.deepEqual(entries[1].coordinates, [[
    [181, 52],
    [187, 52],
    [187, 58],
    [181, 58],
    [181, 52]
  ]]);
  assert.ok(secondBounds.minX > firstBounds.maxX);
  assert.ok(secondBounds.minX - firstBounds.maxX < 10);
});

test('projectFeatureEntries reduces flat-map bounds for dateline-crossing polygons', () => {
  const entries = [
    {
      kind: 'polygon',
      coordinates: [[
        [170, 50],
        [-170, 50],
        [-170, 60],
        [170, 60],
        [170, 50]
      ]]
    }
  ];

  const wrappedBounds = computeBounds(
    projectFeatureEntries(entries, createProjection('fit'), { antimeridianMode: 'off' }),
    'projectedCoordinates'
  );
  const unwrappedBounds = computeBounds(
    projectFeatureEntries(entries, createProjection('fit'), { antimeridianMode: 'auto' }),
    'projectedCoordinates'
  );

  assert.equal(wrappedBounds.maxX - wrappedBounds.minX, 340);
  assert.equal(unwrappedBounds.maxX - unwrappedBounds.minX, 20);
});

test('source and layer normalizers accept JSON string geojson input', () => {
  const geojsonText = JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'PT',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-10, 35], [-5, 35], [-5, 42], [-10, 42], [-10, 35]]]
        }
      }
    ]
  });

  assert.equal(normalizeGeoJSONInput(geojsonText)?.type, 'FeatureCollection');
  assert.equal(normalizeGeoJSONInput('{not valid json'), null);

  const source = normalizeSourceDefinition({ id: 'inline', geojson: geojsonText });
  assert.equal(source.geojson?.type, 'FeatureCollection');

  const layer = normalizeLayerDefinition({ id: 'inline-layer', geojson: geojsonText }, 0);
  assert.equal(layer.geojson?.type, 'FeatureCollection');
  assert.equal(createLayerEntries(layer.id, layer.name, layer.geojson, layer.order).length, 1);
});

test('partial normalizers preserve inherit semantics for unset values', () => {
  assert.equal(normalizePartialLabelOptions(undefined), undefined);
  assert.equal(normalizePartialMarkerLabelOptions(null), undefined);
  assert.equal(normalizePartialMarkerClusterOptions(undefined), undefined);
  assert.equal(normalizePartialInteractionOptions(undefined), undefined);
  assert.equal(normalizePartialLabelOptions(false), false);
  assert.equal(normalizePartialMarkerLabelOptions(false), false);
  assert.equal(normalizePartialMarkerClusterOptions(false), false);
  assert.equal(normalizePartialInteractionOptions(false), false);
  assert.deepEqual(normalizePartialLabelOptions({
    positions: {
      RI: { lon: '-71.4', lat: '41.8' },
      invalid: { lon: 'west', lat: 10 }
    }
  }), {
    positions: {
      RI: { lon: -71.4, lat: 41.8 }
    }
  });
  assert.deepEqual(normalizePartialRegionStyleOptions({
    defaultFill: '#2a9d8f',
    emptyInteractive: false
  }), {
    defaultFill: '#2a9d8f',
    emptyInteractive: false
  });
});

test('entity defaults resolve global inheritance, layer overrides, and explicit disable', () => {
  const globalDefaults = normalizeEntityDefaults({
    markers: {
      animation: { kind: 'pulse', duration: 1600 },
      labels: { enabled: true, color: '#18344b' },
      clusters: { enabled: true, radius: 50 },
      bindings: { fill: 'markerColor' }
    },
    regions: {
      labels: { enabled: true, color: '#264653' },
      joinedStyle: { fill: '#8ecae6' }
    }
  });
  const layerDefaults = normalizeEntityDefaults({
    markers: {
      animation: false,
      labels: { color: '#e76f51' },
      clusters: false
    },
    regions: {
      labels: false,
      emptyStyle: { fill: '#f1faee' }
    }
  });

  const resolved = resolveEntityDefaults(globalDefaults, layerDefaults);
  assert.equal(resolved.markers.labels.enabled, true);
  assert.equal(resolved.markers.labels.color, '#e76f51');
  assert.equal(resolved.markers.animation, false);
  assert.equal(resolved.markers.clusters.enabled, false);
  assert.equal(resolved.markers.bindings.fill, 'markerColor');
  assert.equal(resolved.regions.labels.enabled, false);
  assert.equal(resolved.regions.joinedStyle.fill, '#8ecae6');
  assert.equal(resolved.regions.emptyStyle.fill, '#f1faee');
});

test('region label position maps merge shallowly across global and layer defaults', () => {
  const resolved = resolveEntityDefaults(
    normalizeEntityDefaults({
      regions: {
        labels: {
          enabled: true,
          positions: {
            CA: { lon: -121.2, lat: 38.6 }
          }
        }
      }
    }),
    normalizeEntityDefaults({
      regions: {
        labels: {
          positions: {
            RI: { lon: -71.4, lat: 41.8 },
            CA: { lon: -120.5, lat: 38.9 }
          }
        }
      }
    })
  );

  assert.deepEqual(resolved.regions.labels.positions, {
    CA: { lon: -120.5, lat: 38.9 },
    RI: { lon: -71.4, lat: 41.8 }
  });
});

test('region transform helpers normalize maps and merge across defaults', () => {
  assert.deepEqual(normalizeRegionTransform({ lon: -101, lat: 30 }), {
    anchor: { lon: -101, lat: 30 }
  });
  assert.deepEqual(normalizeRegionTransform({ offset: { lon: 35, lat: 7 } }), {
    translate: { lon: 35, lat: 7 }
  });
  assert.deepEqual(normalizeRegionTransformMap({
    AK: { anchor: { lon: -101, lat: 30 } },
    HI: { translate: { lon: 35, lat: 7 } }
  }), {
    AK: { anchor: { lon: -101, lat: 30 } },
    HI: { translate: { lon: 35, lat: 7 } }
  });

  const resolved = resolveEntityDefaults(
    normalizeEntityDefaults({
      regions: {
        transforms: {
          AK: { translate: { lon: 10, lat: -5 } }
        }
      }
    }),
    normalizeEntityDefaults({
      regions: {
        transforms: {
          HI: { anchor: { lon: -101, lat: 29 } },
          AK: { translate: { lon: 12, lat: -6 } }
        }
      }
    })
  );

  assert.deepEqual(resolved.regions.transforms, {
    AK: { translate: { lon: 12, lat: -6 } },
    HI: { anchor: { lon: -101, lat: 29 } }
  });
});

test('feature geocanvas metadata normalizes region label positions and transforms', () => {
  assert.deepEqual(normalizeFeatureGeocanvasMetadata({
    regionLabel: { position: { lon: -70.9, lat: 41.7 } },
    regionTransform: { offset: { lon: 30, lat: -10 } }
  }), {
    regionLabel: { position: { lon: -70.9, lat: 41.7 } },
    regionTransform: { translate: { lon: 30, lat: -10 } }
  });

  const entries = normalizeGeoJSON({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'AK',
        geocanvas: {
          regionLabel: { position: { lon: -120, lat: 30 } },
          regionTransform: { anchor: { lon: -110, lat: 32 } }
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-170, 50], [-130, 50], [-130, 70], [-170, 70], [-170, 50]]]
        }
      }
    ]
  });

  assert.deepEqual(entries[0].geocanvas, {
    regionLabel: { position: { lon: -120, lat: 30 } },
    regionTransform: { anchor: { lon: -110, lat: 32 } }
  });
});

test('region transform delta can derive an anchor-based translation from source geometry', () => {
  const delta = resolveRegionTransformDelta([
    {
      kind: 'polygon',
      coordinates: [[[-170, 50], [-130, 50], [-130, 70], [-170, 70], [-170, 50]]]
    }
  ], {
    anchor: { lon: -100, lat: 30 }
  });

  assert.deepEqual(delta, {
    lon: 50,
    lat: -30
  });
});

test('marker records can inherit default type and image settings', () => {
  const marker = createMarkerRecord(
    { lon: -9.1393, lat: 38.7223 },
    {
      markerDefaults: {
        type: 'image',
        image: {
          src: 'pin.png',
          width: 28,
          height: 32
        }
      }
    }
  );

  assert.equal(marker.type, 'image');
  assert.equal(marker.image.src, 'pin.png');
  assert.equal(marker.image.width, 28);
  assert.equal(marker.image.height, 32);
});

test('marker helpers normalize circle and image marker definitions', () => {
  assert.equal(normalizeMarkerType({ lon: 0, lat: 0 }), 'circle');
  assert.equal(normalizeMarkerType({ lon: 0, lat: 0, type: 'image', image: { src: '/pin.svg' } }), 'image');
  assert.equal(normalizeMarkerType({ lon: 0, lat: 0, image: { svg: '<svg></svg>' } }), 'image');

  assert.deepEqual(
    normalizeMarkerImageOptions({ svg: '<svg></svg>', width: 32 }, {}),
    {
      src: null,
      svg: '<svg></svg>',
      width: 32,
      height: 32,
      anchorX: 16,
      anchorY: 16
    }
  );

  assert.deepEqual(
    normalizeMarkerImageOptions({ svg: '<svg></svg>', width: 20, height: 40, anchor: 'bottom' }, {}),
    {
      src: null,
      svg: '<svg></svg>',
      width: 20,
      height: 40,
      anchorX: 10,
      anchorY: 40
    }
  );

  const marker = createMarkerRecord(
    {
      lon: -9.14,
      lat: 38.72,
      type: 'image',
      image: {
        svg: '<svg viewBox="0 0 24 24"></svg>',
        width: 30,
        height: 40,
        anchorX: 15,
        anchorY: 40
      },
      style: { opacity: 0.8 }
    },
    {
      fallbackId: 'capital',
      order: 3,
      entityKeyPrefix: 'marker'
    }
  );

  assert.equal(marker.id, 'capital');
  assert.equal(marker.type, 'image');
  assert.equal(marker.image.width, 30);
  assert.equal(marker.image.height, 40);
  assert.equal(marker.image.anchorX, 15);
  assert.equal(marker.image.anchorY, 40);
  assert.equal(marker.entityKey, 'marker:capital:3');

  assert.equal(getMarkerImageCacheKey({ src: '/pin.svg' }), 'src:/pin.svg');
  assert.match(createMarkerImageSource({ svg: '<svg></svg>' }), /^data:image\/svg\+xml;charset=UTF-8,/);
  assert.match(
    createMarkerImageSource({ svg: '<svg fill="currentColor"></svg>' }, { fill: '#ff0000' }),
    /%23ff0000/
  );
  assert.notEqual(
    getMarkerImageCacheKey({ svg: '<svg fill="currentColor"></svg>' }, { fill: '#ff0000' }),
    getMarkerImageCacheKey({ svg: '<svg fill="currentColor"></svg>' }, { fill: '#00ff00' })
  );
});

test('marker animation helpers normalize configs and resolve visual states', () => {
  assert.deepEqual(
    normalizeMarkerAnimation({
      kind: 'pulse',
      duration: 1800,
      scaleTo: 2.6,
      opacityFrom: 0.5
    }),
    {
      kind: 'pulse',
      duration: 1800,
      delay: 0,
      repeat: true,
      phase: 0,
      easing: 'ease-in-out',
      scaleFrom: 1,
      scaleTo: 2.6,
      opacityFrom: 0.5,
      opacityTo: 0,
      degrees: undefined,
      strokeWidth: undefined
    }
  );

  const breatheMarker = createMarkerRecord(
    {
      id: 'breathing',
      lon: 0,
      lat: 0,
      animation: {
        kind: 'breathe',
        duration: 2000,
        phase: 0.5,
        scaleFrom: 1,
        scaleTo: 1.5
      }
    },
    {
      fallbackId: 'breathing',
      order: 0,
      entityKeyPrefix: 'marker'
    }
  );
  breatheMarker.animationStartTime = 0;
  const breathePhase = resolveMarkerAnimationPhase({
    ...breatheMarker.animation,
    startTime: breatheMarker.animationStartTime
  }, 0);
  assert.equal(breathePhase.active, true);
  assert.ok(breathePhase.pingPongProgress > 0.99);

  const breatheVisual = resolveMarkerAnimationVisualState(breatheMarker, { radius: 5 }, 0);
  assert.ok(breatheVisual.scale > 1.49);
  assert.equal(breatheVisual.rotation, 0);

  const spinVisual = resolveMarkerAnimationVisualState({
    animation: normalizeMarkerAnimation({
      kind: 'spin',
      duration: 4000,
      easing: 'linear',
      degrees: 360
    }),
    animationStartTime: 0
  }, {}, 1000);
  assert.ok(Math.abs(spinVisual.rotation - (Math.PI / 2)) < 1e-6);
});

test('marker records preserve authored animation through normalization and serialization', () => {
  const marker = createMarkerRecord(
    {
      id: 'pulse-city',
      lon: -9.13,
      lat: 38.72,
      animation: {
        kind: 'pulse',
        duration: 1600,
        scaleTo: 2.4
      }
    },
    {
      fallbackId: 'pulse-city',
      order: 0,
      entityKeyPrefix: 'marker'
    }
  );

  const serialized = GeoCanvas.prototype.serializeMarkerRecord.call({}, marker);

  assert.equal(marker.animation.kind, 'pulse');
  assert.equal(serialized.animation.kind, 'pulse');
  assert.equal(serialized.animation.scaleTo, 2.4);
});

test('marker defaults can provide animation and explicit marker animation can disable inheritance', () => {
  const inherited = createMarkerRecord(
    { id: 'default-animated', lon: 1, lat: 2 },
    {
      fallbackId: 'default-animated',
      order: 0,
      entityKeyPrefix: 'marker',
      markerDefaults: {
        animation: {
          kind: 'pulse',
          duration: 1500
        }
      }
    }
  );
  const inheritedSerialized = GeoCanvas.prototype.serializeMarkerRecord.call({}, inherited);

  assert.equal(inherited.animation.kind, 'pulse');
  assert.equal(Object.prototype.hasOwnProperty.call(inherited, 'itemAnimation'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(inheritedSerialized, 'animation'), false);

  const disabled = createMarkerRecord(
    { id: 'static', lon: 1, lat: 2, animation: false },
    {
      fallbackId: 'static',
      order: 1,
      entityKeyPrefix: 'marker',
      markerDefaults: {
        animation: {
          kind: 'pulse'
        }
      }
    }
  );
  const disabledSerialized = GeoCanvas.prototype.serializeMarkerRecord.call({}, disabled);

  assert.equal(disabled.animation, null);
  assert.equal(disabled.itemAnimation, false);
  assert.equal(disabledSerialized.animation, false);
});

test('line records preserve authored marker refs through normalization and serialization', () => {
  const instance = {
    defaults: normalizeEntityDefaults(),
    lines: [],
    lineOrderCursor: 0,
    hoverTarget: null,
    hideTooltip() {},
    render() {}
  };

  GeoCanvas.prototype.setLines.call(instance, [
    {
      id: 'route',
      pathMode: 'geodesic',
      markerRefs: [
        { layerId: 'cities', markerId: 'lisbon' },
        { markerId: 'global-porto' },
        { markerId: '' }
      ]
    }
  ]);

  assert.deepEqual(instance.lines[0].markerRefs, [
    { layerId: 'cities', markerId: 'lisbon' },
    { markerId: 'global-porto' }
  ]);
  assert.equal(instance.lines[0].pathMode, 'geodesic');
  assert.deepEqual(GeoCanvas.prototype.serializeLineRecord.call(instance, instance.lines[0]).markerRefs, [
    { layerId: 'cities', markerId: 'lisbon' },
    { markerId: 'global-porto' }
  ]);
  assert.equal(GeoCanvas.prototype.serializeLineRecord.call(instance, instance.lines[0]).pathMode, 'geodesic');
});

test('resolveLineMarkerCoordinates uses linked global and layer marker positions', () => {
  const globalMarker = createMarkerRecord({ id: 'global-porto', lon: -8.61, lat: 41.15 }, {
    fallbackId: 'global-porto',
    order: 0,
    entityKeyPrefix: 'marker'
  });
  const layerMarker = {
    ...createMarkerRecord({ id: 'lisbon', lon: -9.13, lat: 38.72 }, {
      fallbackId: 'lisbon',
      order: 0,
      entityKeyPrefix: 'layer:cities:marker'
    }),
    displayLon: -9.10,
    displayLat: 38.70
  };
  const instance = {
    markers: [globalMarker],
    layers: [
      {
        id: 'cities',
        markers: [layerMarker]
      }
    ],
    buildMarkerReferenceIndex: GeoCanvas.prototype.buildMarkerReferenceIndex
  };

  const coordinates = GeoCanvas.prototype.resolveLineMarkerCoordinates.call(instance, {
    markerRefs: [
      { layerId: 'cities', markerId: 'lisbon' },
      { markerId: 'global-porto' }
    ]
  });

  assert.deepEqual(coordinates, [
    [-9.10, 38.70],
    [-8.61, 41.15]
  ]);
});

test('layer filter input normalizes arrays, strings, and missing values', () => {
  assert.deepEqual(
    normalizeLayerFilterInput({
      includePolygonIds: 'AU, NZ',
      excludePolygonIds: ['tas', 'nsw']
    }),
    {
      includePolygonIds: ['AU', 'NZ'],
      excludePolygonIds: ['tas', 'nsw']
    }
  );

  assert.deepEqual(normalizeLayerFilterInput({}), {
    includePolygonIds: undefined,
    excludePolygonIds: undefined
  });
});

test('computeBounds and fit transform work with mixed coordinates', () => {
  const entries = [
    { kind: 'point', coordinates: [-100, -20] },
    { kind: 'line', coordinates: [[50, 40], [80, -30]] },
    { kind: 'polygon', coordinates: [[[[-40, -10], [-10, -10], [-10, 10], [-40, 10], [-40, -10]]]][0] }
  ];

  const bounds = computeBounds(entries);
  assert.deepEqual(bounds, { minX: -100, minY: -30, maxX: 80, maxY: 40 });

  const transform = createFitTransform(bounds, 1000, 500, 20);
  const topLeft = transform.project(bounds.minX, bounds.maxY);
  const bottomRight = transform.project(bounds.maxX, bounds.minY);
  const restored = transform.unproject(topLeft.x, topLeft.y);

  assert.ok(topLeft.x >= 19 && topLeft.y >= 19);
  assert.ok(bottomRight.x <= 981 && bottomRight.y <= 481);
  assert.ok(Math.abs(restored.lon - bounds.minX) < 1e-9);
  assert.ok(Math.abs(restored.lat - bounds.maxY) < 1e-9);
});

test('computeCenterFromBounds returns midpoint', () => {
  assert.deepEqual(
    computeCenterFromBounds({ minX: -20, minY: -10, maxX: 40, maxY: 30 }),
    { lon: 10, lat: 10 }
  );
});

test('hit color encoding and decoding round trips ids', () => {
  [1, 5, 255, 256, 9999, 65535, 1300000].forEach((id) => {
    const encoded = encodeHitColor(id);
    assert.equal(decodeHitColor(encoded.r, encoded.g, encoded.b), id);
  });
});

test('hover style interpolation blends numeric and color values', () => {
  const parseColor = (value) => ({
    '#000000': { r: 0, g: 0, b: 0, a: 1 },
    '#ffffff': { r: 255, g: 255, b: 255, a: 1 },
    '#ff0000': { r: 255, g: 0, b: 0, a: 1 }
  }[value] ?? null);

  assert.equal(interpolateColorValue('#000000', '#ffffff', 0.5, parseColor), 'rgb(128, 128, 128)');

  const style = interpolateStyle(
    { fill: '#000000', stroke: '#000000', strokeWidth: 1, opacity: 0.4, lineDash: [], radius: 4, width: 16, height: 20, cursor: 'default' },
    { fill: '#ffffff', stroke: '#ff0000', strokeWidth: 3, opacity: 1, lineDash: [6, 2], radius: 10, width: 24, height: 30, cursor: 'pointer' },
    0.5,
    parseColor
  );

  assert.equal(style.fill, 'rgb(128, 128, 128)');
  assert.equal(style.stroke, 'rgb(128, 0, 0)');
  assert.equal(style.strokeWidth, 2);
  assert.equal(style.opacity, 0.7);
  assert.equal(style.radius, 7);
  assert.equal(style.width, 20);
  assert.equal(style.height, 25);
  assert.equal(style.cursor, 'pointer');
  assert.deepEqual(style.lineDash, [6, 2]);
});

test('image marker layout preserves aspect ratio and anchor when style overrides size', () => {
  const marker = {
    image: {
      width: 20,
      height: 40,
      anchorX: 10,
      anchorY: 40
    }
  };

  assert.deepEqual(resolveImageMarkerLayout(marker, { width: 30 }), {
    width: 30,
    height: 60,
    anchorX: 15,
    anchorY: 60
  });

  assert.deepEqual(resolveImageMarkerLayout(marker, { height: 20 }), {
    width: 10,
    height: 20,
    anchorX: 5,
    anchorY: 20
  });
});

test('polygon containment helpers treat borders as inside and holes as excluded', () => {
  const outerRing = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
    { x: 0, y: 0 }
  ];
  const holeRing = [
    { x: 3, y: 3 },
    { x: 7, y: 3 },
    { x: 7, y: 7 },
    { x: 3, y: 7 },
    { x: 3, y: 3 }
  ];

  assert.equal(isPointOnSegment({ x: 5, y: 0 }, outerRing[0], outerRing[1]), true);
  assert.equal(isPointInRing({ x: 2, y: 2 }, outerRing), true);
  assert.equal(isPointOnRingBoundary({ x: 10, y: 5 }, outerRing), true);
  assert.equal(isPointInPolygonRings({ x: 2, y: 2 }, [outerRing, holeRing]), true);
  assert.equal(isPointInPolygonRings({ x: 5, y: 5 }, [outerRing, holeRing]), false);
  assert.equal(isPointInPolygonRings({ x: 10, y: 5 }, [outerRing]), true);
});

test('pick validates polygon candidates against polygon geometry before accepting hover', () => {
  const polygonA = { hitId: 1, type: 'polygon', id: 'A' };
  const polygonB = { hitId: 2, type: 'polygon', id: 'B' };
  const marker = { hitId: 3, type: 'marker', id: 'marker-1' };
  const polygonLabel = { hitId: 4, type: 'polygon', hitRole: 'label', id: 'A', interactive: true };

  const polygonPick = GeoCanvas.prototype.pick.call({
    width: 100,
    height: 100,
    readHitTarget() {
      return polygonA;
    },
    sampleHitTargets() {
      return [polygonA, polygonB];
    },
    polygonTargetContainsPoint(target) {
      return target.id === 'B';
    }
  }, 20, 20);

  assert.equal(polygonPick, polygonB);

  const markerPick = GeoCanvas.prototype.pick.call({
    width: 100,
    height: 100,
    readHitTarget() {
      return marker;
    }
  }, 20, 20);

  assert.equal(markerPick, marker);

  const labelPick = GeoCanvas.prototype.pick.call({
    readHitTarget() {
      return polygonLabel;
    }
  }, 20, 20);

  assert.equal(labelPick, polygonLabel);
});

test('drawMarker dispatches image markers to the image renderer', () => {
  let imageMarker = null;
  let paintedCircle = false;

  GeoCanvas.prototype.drawMarker.call({
    resolveMarkerStyle() {
      return { radius: 5, opacity: 1 };
    },
    resolveMarkerImageRenderStyles() {
      return null;
    },
    projectPoint() {
      return { x: 100, y: 50 };
    },
    allocateHitTarget(target) {
      return target.category === 'marker' ? 11 : null;
    },
    drawImageMarker(marker, point, style, hitId) {
      imageMarker = { marker, point, style, hitId };
    },
    paintCircle() {
      paintedCircle = true;
    }
  }, {
    id: 'logo',
    lon: 0,
    lat: 0,
    type: 'image',
    properties: {},
    style: {},
    data: null,
    entityKey: 'marker:logo:0',
    order: 0
  });

  assert.equal(paintedCircle, false);
  assert.equal(imageMarker.hitId, 11);
  assert.equal(imageMarker.marker.type, 'image');
  assert.deepEqual(imageMarker.point, { x: 100, y: 50 });
});

test('drawImageMarker reuses a loaded fallback image while the preferred variant loads', () => {
  let paintedCircle = false;
  let drawnImage = null;
  const requestedFills = [];
  const hitOps = [];
  const maskOps = [];
  const maskCanvas = { id: 'mask' };

  GeoCanvas.prototype.drawImageMarker.call({
    ctx: {
      save() {},
      restore() {},
      drawImage(image, x, y, width, height) {
        drawnImage = { image, x, y, width, height };
      },
      set globalAlpha(value) {
        this._globalAlpha = value;
      }
    },
    hitCtx: {
      save() {
        hitOps.push('save');
      },
      restore() {
        hitOps.push('restore');
      },
      fillRect(x, y, width, height) {
        hitOps.push(['fillRect', x, y, width, height]);
      },
      drawImage(image, x, y, width, height) {
        hitOps.push(['drawImage', image, x, y, width, height]);
      },
      set fillStyle(value) {
        this._fillStyle = value;
        hitOps.push(['fillStyle', value]);
      },
      set globalCompositeOperation(value) {
        this._globalCompositeOperation = value;
        hitOps.push(['composite', value]);
      }
    },
    getMarkerHitMaskSurface() {
      return {
        canvas: maskCanvas,
        ctx: {
          fillRect(x, y, width, height) {
            maskOps.push(['fillRect', x, y, width, height]);
          },
          drawImage(image, x, y, width, height) {
            maskOps.push(['drawImage', image, x, y, width, height]);
          },
          set fillStyle(value) {
            this._fillStyle = value;
            maskOps.push(['fillStyle', value]);
          },
          set globalCompositeOperation(value) {
            this._globalCompositeOperation = value;
            maskOps.push(['composite', value]);
          }
        }
      };
    },
    getMarkerImageEntry(marker, style) {
      requestedFills.push(style.fill);
      if (style.fill === '#ffd166') {
        return { status: 'loading', image: { id: 'hover' } };
      }
      if (style.fill === '#e74c3c') {
        return { status: 'loaded', image: { id: 'base' } };
      }
      return null;
    },
    paintCircle() {
      paintedCircle = true;
    }
  }, {
    image: {
      width: 24,
      height: 24,
      anchorX: 12,
      anchorY: 24
    }
  }, {
    x: 100,
    y: 120
  }, {
    fill: '#ffd166',
    opacity: 1
  }, 7, {
    primaryStyle: { fill: '#ffd166' },
    fallbackStyle: { fill: '#e74c3c' }
  });

  assert.equal(paintedCircle, false);
  assert.deepEqual(requestedFills, ['#ffd166', '#e74c3c']);
  assert.deepEqual(drawnImage, {
    image: { id: 'base' },
    x: 88,
    y: 96,
    width: 24,
    height: 24
  });
  assert.deepEqual(hitOps, [
    'save',
    ['drawImage', maskCanvas, 88, 96, 24, 24],
    'restore'
  ]);
  assert.deepEqual(maskOps, [
    ['fillStyle', 'rgba(7, 0, 0, 1)'],
    ['fillRect', 0, 0, 24, 24],
    ['composite', 'destination-in'],
    ['drawImage', { id: 'base' }, 0, 0, 24, 24],
    ['composite', 'source-over']
  ]);
});

test('drawImageMarker keeps hit-testing anchored to the base image bounds while visuals scale', () => {
  let drawnImage = null;
  const hitOps = [];

  GeoCanvas.prototype.drawImageMarker.call({
    ctx: {
      save() {},
      restore() {},
      drawImage(image, x, y, width, height) {
        drawnImage = { image, x, y, width, height };
      },
      set globalAlpha(value) {
        this._globalAlpha = value;
      }
    },
    hitCtx: {
      save() {
        hitOps.push('save');
      },
      restore() {
        hitOps.push('restore');
      },
      fillRect(x, y, width, height) {
        hitOps.push(['fillRect', x, y, width, height]);
      },
      set fillStyle(value) {
        hitOps.push(['fillStyle', value]);
      }
    },
    getMarkerImageEntry() {
      return { status: 'loaded', image: { id: 'pin' } };
    },
    getMarkerHitMaskSurface() {
      return null;
    }
  }, {
    image: {
      width: 20,
      height: 40,
      anchorX: 10,
      anchorY: 40
    }
  }, {
    x: 100,
    y: 120
  }, {
    fill: '#e74c3c',
    opacity: 1
  }, 9, null, {
    scale: 1.5,
    rotation: 0,
    pulse: null
  });

  assert.deepEqual(drawnImage, {
    image: { id: 'pin' },
    x: 85,
    y: 60,
    width: 30,
    height: 60
  });
  assert.deepEqual(hitOps, [
    'save',
    ['fillStyle', 'rgba(9, 0, 0, 1)'],
    ['fillRect', 90, 80, 20, 40],
    'restore'
  ]);
});

test('deriveHoverTransition compares entity keys', () => {
  const a = { entityKey: 'feature:a' };
  const b = { entityKey: 'marker:b' };

  assert.equal(deriveHoverTransition(null, a).enter, a);
  assert.equal(deriveHoverTransition(a, { entityKey: 'feature:a' }).same, true);
  assert.equal(deriveHoverTransition(a, b).leave, a);
  assert.equal(deriveHoverTransition(b, null).leave, b);
});

test('deriveHoverTransition treats shared hover keys as the same target', () => {
  const a = { entityKey: 'feature:a:polygon:0', hoverKey: 'feature:a:polygon:MultiPolygon' };
  const b = { entityKey: 'feature:a:polygon:1', hoverKey: 'feature:a:polygon:MultiPolygon' };

  const transition = deriveHoverTransition(a, b);
  assert.equal(transition.same, true);
  assert.equal(transition.leave, null);
  assert.equal(transition.enter, null);
});

test('resolveGroupedTarget keeps the existing grouped target metadata', () => {
  const firstPart = {
    entityKey: 'feature:archipelago:polygon:0',
    hoverKey: 'feature:archipelago:polygon:MultiPolygon',
    id: 'archipelago',
    geometryType: 'MultiPolygon'
  };
  const secondPart = {
    entityKey: 'feature:archipelago:polygon:1',
    hoverKey: 'feature:archipelago:polygon:MultiPolygon',
    id: 'archipelago',
    geometryType: 'MultiPolygon'
  };

  assert.equal(getHoverIdentity(firstPart), getHoverIdentity(secondPart));
  assert.equal(resolveGroupedTarget(firstPart, secondPart), firstPart);
  assert.equal(resolveGroupedTarget(null, secondPart), secondPart);
});

test('startHoverTransition keeps prior hover fades when hoverTrail is enabled', () => {
  let scheduled = 0;
  const instance = {
    options: {
      hoverTransitionDuration: 140,
      hoverTrail: true
    },
    hoverTransitions: new Map([
      ['feature:older', { from: 1, to: 0, duration: 140, startTime: 10 }]
    ]),
    getHoverStyleMix(target) {
      return target.mix;
    },
    scheduleHoverTransitionFrame() {
      scheduled += 1;
    }
  };

  GeoCanvas.prototype.startHoverTransition.call(instance, {
    entityKey: 'feature:a',
    mix: 0.6
  }, {
    entityKey: 'feature:b',
    mix: 0.1
  });

  assert.equal(scheduled, 1);
  assert.equal(instance.hoverTransitions.has('feature:older'), true);
  assert.equal(instance.hoverTransitions.get('feature:a').from, 0.6);
  assert.equal(instance.hoverTransitions.get('feature:a').to, 0);
  assert.equal(instance.hoverTransitions.get('feature:b').from, 0.1);
  assert.equal(instance.hoverTransitions.get('feature:b').to, 1);
});

test('startHoverTransition clears trailing hover fades when hoverTrail is disabled', () => {
  let scheduled = 0;
  const instance = {
    options: {
      hoverTransitionDuration: 140,
      hoverTrail: false
    },
    hoverTransitions: new Map([
      ['feature:older', { from: 1, to: 0, duration: 140, startTime: 10 }]
    ]),
    getHoverStyleMix(target) {
      return target.mix;
    },
    scheduleHoverTransitionFrame() {
      scheduled += 1;
    }
  };

  GeoCanvas.prototype.startHoverTransition.call(instance, {
    entityKey: 'feature:a',
    mix: 0.6
  }, {
    entityKey: 'feature:b',
    mix: 0.1
  });

  assert.equal(scheduled, 1);
  assert.equal(instance.hoverTransitions.has('feature:older'), false);
  assert.equal(instance.hoverTransitions.has('feature:a'), false);
  assert.equal(instance.hoverTransitions.get('feature:b').from, 0.1);
  assert.equal(instance.hoverTransitions.get('feature:b').to, 1);
});

test('startHoverTransition still animates hover-out to empty space when hoverTrail is disabled', () => {
  let scheduled = 0;
  const instance = {
    options: {
      hoverTransitionDuration: 140,
      hoverTrail: false
    },
    hoverTransitions: new Map(),
    getHoverStyleMix(target) {
      return target.mix;
    },
    scheduleHoverTransitionFrame() {
      scheduled += 1;
    }
  };

  GeoCanvas.prototype.startHoverTransition.call(instance, {
    entityKey: 'feature:a',
    mix: 0.4
  }, null);

  assert.equal(scheduled, 1);
  assert.equal(instance.hoverTransitions.get('feature:a').from, 0.4);
  assert.equal(instance.hoverTransitions.get('feature:a').to, 0);
});

test('mergeStyle applies hover overrides last', () => {
  const style = mergeStyle(
    { fill: '#111111', stroke: '#222222', strokeWidth: 1, opacity: 0.7, lineDash: [], radius: 4 },
    { fill: '#333333', strokeWidth: 2 },
    { fill: '#ffcc00', radius: 8, opacity: 1 }
  );

  assert.equal(style.fill, '#ffcc00');
  assert.equal(style.stroke, '#222222');
  assert.equal(style.strokeWidth, 2);
  assert.equal(style.radius, 8);
  assert.equal(style.opacity, 1);
});

test('normalize zoom, center and id lists sanitize input', () => {
  assert.equal(normalizeZoom(0.1, 0.5, 8), 0.5);
  assert.equal(normalizeZoom(20, 0.5, 8), 8);
  assert.equal(normalizeZoom('bad', 0.5, 8), 1);
  assert.deepEqual(normalizeCenter({ lon: '1.5', lat: 'bad' }, { lon: 0, lat: 0 }), { lon: 1.5, lat: 0 });
  assert.deepEqual(normalizeIdList(' europe,africa , ,oceania '), ['europe', 'africa', 'oceania']);
});

test('filterFeatureEntries includes and excludes polygons only', () => {
  const entries = [
    { kind: 'polygon', filterId: 'europe', sourceId: 'europe' },
    { kind: 'polygon', filterId: 'africa', sourceId: 'africa' },
    { kind: 'polygon', filterId: 'oceania', sourceId: 'oceania' },
    { kind: 'line', filterId: null, sourceId: 'line-1' }
  ];

  const filtered = filterFeatureEntries(entries, ['europe', 'africa'], ['africa']);
  assert.deepEqual(filtered.map((entry) => entry.sourceId), ['europe', 'line-1']);
});

test('camera transform and inverse round-trip points', () => {
  const point = { x: 100, y: 120 };
  const anchor = { x: 40, y: 60 };
  const viewportCenter = { x: 300, y: 200 };
  const zoom = 2;
  const transformed = applyCameraTransform(point, anchor, viewportCenter, zoom);
  assert.deepEqual(invertCameraTransform(transformed, anchor, viewportCenter, zoom), point);
});

test('camera clamps keep the dataset inside the viewport while allowing panning when zoomed in', () => {
  assert.equal(clampCameraAxis(0, 0, 100, 100, 1), 50);
  assert.equal(clampCameraAxis(0, 0, 100, 100, 2), 25);
  assert.equal(clampCameraAxis(100, 0, 100, 100, 2), 75);

  assert.deepEqual(
    clampCameraAnchor({ x: 0, y: 100 }, { minX: 0, maxX: 100, minY: 0, maxY: 100 }, { width: 100, height: 100 }, 2),
    { x: 25, y: 75 }
  );
});

test('setInteractionOptions updates runtime gesture toggles and reapplies touch behavior', () => {
  let applied = 0;
  const instance = {
    options: {
      panEnabled: true,
      pinchZoomEnabled: true,
      doubleTapZoomEnabled: true,
      scrollWheelZoomEnabled: false
    },
    setViewOptions: GeoCanvas.prototype.setViewOptions,
    updateControlsVisibility() {},
    applyPanBehavior() {
      applied += 1;
    },
    refreshProjectedFeatures() {},
    hideTooltip() {},
    render() {},
    updateHomeView() {},
    clampView(view) {
      return view;
    }
  };

  const result = GeoCanvas.prototype.setInteractionOptions.call(instance, {
    panEnabled: false,
    pinchZoomEnabled: false,
    doubleTapZoomEnabled: false,
    scrollWheelZoomEnabled: true
  });

  assert.equal(result, instance);
  assert.equal(instance.options.panEnabled, false);
  assert.equal(instance.options.pinchZoomEnabled, false);
  assert.equal(instance.options.doubleTapZoomEnabled, false);
  assert.equal(instance.options.scrollWheelZoomEnabled, true);
  assert.equal(applied, 1);
});

test('setMarkers refreshes linked layer lines without resetting the base transform', () => {
  let refreshArgs = null;
  const instance = {
    defaults: normalizeEntityDefaults(),
    markers: [],
    markerOrderCursor: 0,
    hoverTarget: null,
    refreshProjectedFeatures(args) {
      refreshArgs = args;
    },
    hideTooltip() {},
    render() {}
  };

  GeoCanvas.prototype.setMarkers.call(instance, [
    { id: 'lisbon', lon: -9.13, lat: 38.72 }
  ]);

  assert.deepEqual(refreshArgs, {
    resetView: false,
    preserveBaseTransform: true
  });
});

test('getViewOptions returns the canonical grouped view config', () => {
  const viewOptions = GeoCanvas.prototype.getViewOptions.call({
    options: {
      projection: 'mercator',
      initialZoom: 2,
      initialCenter: { lon: 1, lat: -2 },
      minZoom: 0.5,
      maxZoom: 9,
      showControls: true,
      controlsPosition: 'bottom-left',
      panEnabled: true,
      pinchZoomEnabled: false,
      doubleTapZoomEnabled: true,
      scrollWheelZoomEnabled: true,
      animationDuration: 640,
      hoverTransitionDuration: 180,
      hoverTrail: false,
      hoverRegionToFront: true,
      zoomStep: 1.3,
      restoreLayerVisibilityOnHome: true
    }
  });

  assert.deepEqual(viewOptions, {
    projection: 'mercator',
    initialZoom: 2,
    initialCenter: { lon: 1, lat: -2 },
    minZoom: 0.5,
    maxZoom: 9,
    controls: {
      enabled: true,
      position: 'bottom-left',
      homeIconSvg: null
    },
    gestures: {
      panEnabled: true,
      pinchZoomEnabled: false,
      doubleTapZoomEnabled: true,
      scrollWheelZoomEnabled: true
    },
    animationDuration: 640,
    hoverTransitionDuration: 180,
    hoverTrail: false,
    hoverRegionToFront: true,
    zoomStep: 1.3,
    restoreLayerVisibilityOnHome: true
  });
});

test('setViewOptions updates canonical view config and refreshes when projection changes', () => {
  let refreshed = null;
  let updatedControls = 0;
  let appliedPan = 0;
  let rendered = 0;
  let hidTooltip = 0;

  const instance = {
    options: {
      projection: 'fit',
      initialZoom: undefined,
      initialCenter: null,
      minZoom: 0.5,
      maxZoom: 8,
      showControls: false,
      controlsPosition: 'top-right',
      panEnabled: true,
      pinchZoomEnabled: true,
      doubleTapZoomEnabled: true,
      scrollWheelZoomEnabled: false,
      animationDuration: 500,
      hoverTransitionDuration: 140,
      hoverTrail: true,
      hoverRegionToFront: false,
      zoomStep: 1.2,
      restoreLayerVisibilityOnHome: false
    },
    currentProjection: null,
    hoverTarget: { id: 'hovered' },
    view: { zoom: 1, center: { lon: 0, lat: 0 } },
    updateControlsVisibility() {
      updatedControls += 1;
    },
    updateHomeButtonIcon() {},
    applyPanBehavior() {
      appliedPan += 1;
    },
    refreshProjectedFeatures(args) {
      refreshed = args;
    },
    hideTooltip() {
      hidTooltip += 1;
    },
    render() {
      rendered += 1;
    },
    updateHomeView() {},
    clampView(view) {
      return view;
    }
  };

  const result = GeoCanvas.prototype.setViewOptions.call(instance, {
    projection: 'mercator',
    controls: { enabled: true, position: 'bottom-left', homeIconSvg: '<svg viewBox="0 0 24 24"></svg>' },
    gestures: { scrollWheelZoomEnabled: true },
    animationDuration: 700,
    hoverTrail: false,
    hoverRegionToFront: true
  }, { resetView: false });

  assert.equal(result, instance);
  assert.equal(instance.options.projection, 'mercator');
  assert.equal(instance.options.showControls, true);
  assert.equal(instance.options.controlsPosition, 'bottom-left');
  assert.equal(instance.options.homeIconSvg, '<svg viewBox="0 0 24 24"></svg>');
  assert.equal(instance.options.scrollWheelZoomEnabled, true);
  assert.equal(instance.options.animationDuration, 700);
  assert.equal(instance.options.hoverTrail, false);
  assert.equal(instance.options.hoverRegionToFront, true);
  assert.equal(updatedControls, 1);
  assert.equal(appliedPan, 1);
  assert.deepEqual(refreshed, { resetView: false });
  assert.equal(instance.hoverTarget, null);
  assert.equal(hidTooltip, 1);
  assert.equal(rendered, 1);
});

test('getOrderedProjectedPolygons keeps source order unless hoverRegionToFront is enabled', () => {
  const polygons = [
    { id: 'a', hoverKey: 'feature:a:polygon:Polygon' },
    { id: 'b', hoverKey: 'feature:b:polygon:Polygon' },
    { id: 'c', hoverKey: 'feature:c:polygon:Polygon' }
  ];

  const unchanged = GeoCanvas.prototype.getOrderedProjectedPolygons.call({
    options: { hoverRegionToFront: false },
    hoverTarget: polygons[1]
  }, polygons);

  assert.deepEqual(unchanged.map((entry) => entry.id), ['a', 'b', 'c']);
});

test('getOrderedProjectedPolygons draws the hovered region last when hoverRegionToFront is enabled', () => {
  const polygons = [
    { id: 'a', hoverKey: 'feature:a:polygon:Polygon' },
    { id: 'b-1', hoverKey: 'feature:b:polygon:Polygon' },
    { id: 'c', hoverKey: 'feature:c:polygon:Polygon' },
    { id: 'b-2', hoverKey: 'feature:b:polygon:Polygon' }
  ];

  const ordered = GeoCanvas.prototype.getOrderedProjectedPolygons.call({
    options: { hoverRegionToFront: true },
    hoverTarget: { hoverKey: 'feature:b:polygon:Polygon' }
  }, polygons);

  assert.deepEqual(ordered.map((entry) => entry.id), ['a', 'c', 'b-1', 'b-2']);
});

test('resetView closes built-in click UI before restoring home state and animating', () => {
  const calls = [];
  const instance = {
    options: {
      restoreLayerVisibilityOnHome: true
    },
    homeView: {
      zoom: 2,
      center: { lon: 5, lat: 10 }
    },
    closeBuiltInActionUi() {
      calls.push('close-ui');
    },
    restoreHomeLayerVisibility() {
      calls.push('restore-layers');
    },
    animateToView(view, options) {
      calls.push('animate');
      this.animatedView = view;
      this.animatedOptions = options;
      return this;
    }
  };

  const result = GeoCanvas.prototype.resetView.call(instance, {});

  assert.equal(result, instance);
  assert.deepEqual(calls, ['close-ui', 'restore-layers', 'animate']);
  assert.deepEqual(instance.animatedView, {
    zoom: 2,
    center: { lon: 5, lat: 10 }
  });
  assert.equal(instance.animatedOptions.zoomEventTrigger, 'resetView');
});

test('runClickInteraction preserves event-first ordering and executes terminal built-in actions last', () => {
  const calls = [];
  let deferredHide = null;
  const instance = {
    layers: [
      { id: 'world-countries', name: 'world', visible: true },
      { id: 'australia-detail', name: 'Australia detail', visible: false },
      { id: 'markers', name: 'markers', visible: true }
    ],
    setLayerVisibility(layerId, visible) {
      calls.push(`set:${layerId}:${visible}`);
    },
    toggleLayerVisibility(layerId) {
      calls.push(`toggle:${layerId}`);
    },
    zoomToFeature(target, options) {
      calls.push(`zoom-feature:${target.id}:${options.padding}`);
      deferredHide = options.onComplete;
    },
    zoomToMarker(target, options) {
      calls.push(`zoom-marker:${target.id}:${options.zoomScale}`);
    },
    startLayerHideFade(layerIds) {
      calls.push(`fade:${layerIds.join(',')}`);
    },
    executeBuiltInClickAction(action, payload) {
      calls.push(`action:${action.type}:${payload.id}`);
    }
  };

  GeoCanvas.prototype.runClickInteraction.call(instance, {
    id: 'pt',
    category: 'feature',
    interaction: {
      click: {
        zoomTo: 'feature',
        zoomPadding: 40,
        zoomMax: null,
        zoomScale: null,
        showLayers: ['australia-detail'],
        hideLayers: ['world'],
        toggleLayers: ['markers'],
        emptyRegions: true,
        action: { type: 'panel' },
        handler(payload) {
          calls.push(`handler:${payload.id}`);
        }
      }
    }
  }, {
    id: 'pt'
  });

  assert.deepEqual(calls, [
    'set:australia-detail:true',
    'zoom-feature:pt:40',
    'handler:pt',
    'action:panel:pt'
  ]);
  assert.equal(typeof deferredHide, 'function');

  deferredHide();

  assert.deepEqual(calls, [
    'set:australia-detail:true',
    'zoom-feature:pt:40',
    'handler:pt',
    'action:panel:pt',
    'fade:world-countries,markers'
  ]);
});

test('runClickInteraction can skip click behavior for empty regions', () => {
  const calls = [];
  const instance = {
    setLayerVisibility(layerId, visible) {
      calls.push(`set:${layerId}:${visible}`);
    },
    toggleLayerVisibility(layerId) {
      calls.push(`toggle:${layerId}`);
    },
    zoomToFeature(target, options) {
      calls.push(`zoom-feature:${target.id}:${options.padding}`);
    },
    executeBuiltInClickAction(action, payload) {
      calls.push(`action:${action.type}:${payload.id}`);
    }
  };

  GeoCanvas.prototype.runClickInteraction.call(instance, {
    id: 'empty-dz',
    category: 'feature',
    interaction: {
      click: {
        zoomTo: 'feature',
        zoomPadding: 40,
        zoomMax: null,
        zoomScale: null,
        showLayers: ['detail'],
        hideLayers: [],
        toggleLayers: [],
        emptyRegions: false,
        action: { type: 'panel' },
        handler() {
          calls.push('handler');
        }
      }
    }
  }, {
    id: 'empty-dz',
    region: null
  });

  assert.deepEqual(calls, []);
});

test('onClick can close an open panel on empty map background clicks', () => {
  let closed = 0;
  let tooltipHidden = 0;
  const instance = {
    suppressNextClick: false,
    activeClickActionUi: 'panel',
    panelState: { closeOnMapClick: true },
    tooltipOptions: { enabled: true, trigger: 'click' },
    getRelativePosition() {
      return { x: 20, y: 10 };
    },
    pick() {
      return null;
    },
    closeBuiltInActionUi() {
      closed += 1;
    },
    hideTooltip() {
      tooltipHidden += 1;
    }
  };

  GeoCanvas.prototype.onClick.call(instance, {});

  assert.equal(closed, 1);
  assert.equal(tooltipHidden, 1);
});

test('onClick can close an open panel on empty region clicks while empty-region interaction stays disabled', () => {
  const calls = [];
  const target = {
    id: 'empty-region',
    category: 'feature',
    interactive: true,
    interaction: {
      click: {
        emptyRegions: false
      }
    }
  };
  const instance = {
    suppressNextClick: false,
    activeClickActionUi: 'panel',
    panelState: { closeOnEmptyRegionClick: true },
    tooltipOptions: { enabled: false, trigger: 'click' },
    getRelativePosition() {
      return { x: 12, y: 8 };
    },
    pick() {
      return target;
    },
    buildPayload() {
      return { region: null };
    },
    emit(name) {
      calls.push(`emit:${name}`);
    },
    closeBuiltInActionUi() {
      calls.push('close');
    },
    runClickInteraction: GeoCanvas.prototype.runClickInteraction,
    layers: [],
    setLayerVisibility() {
      calls.push('set');
    },
    toggleLayerVisibility() {
      calls.push('toggle');
    },
    zoomToFeature() {
      calls.push('zoom-feature');
    },
    zoomToMarker() {
      calls.push('zoom-marker');
    },
    executeBuiltInClickAction() {
      calls.push('action');
    }
  };

  GeoCanvas.prototype.onClick.call(instance, {});

  assert.deepEqual(calls, [
    'emit:featureclick',
    'close'
  ]);
});

test('pick ignores noninteractive polygons unless click inspection requests them', () => {
  const nonInteractivePolygon = {
    type: 'polygon',
    hitId: 7,
    interactive: false
  };
  const instance = {
    width: 100,
    height: 100,
    readHitTarget() {
      return nonInteractivePolygon;
    },
    sampleHitTargets() {
      return [nonInteractivePolygon];
    },
    polygonTargetContainsPoint() {
      return true;
    }
  };

  assert.equal(GeoCanvas.prototype.pick.call(instance, 10, 12), null);
  assert.equal(
    GeoCanvas.prototype.pick.call(instance, 10, 12, { includeNonInteractivePolygons: true }),
    nonInteractivePolygon
  );
});

test('pick ignores noninteractive polygon labels unless click inspection requests them', () => {
  const nonInteractiveLabel = {
    type: 'polygon',
    hitId: 8,
    hitRole: 'label',
    interactive: false
  };
  const instance = {
    width: 100,
    height: 100,
    readHitTarget() {
      return nonInteractiveLabel;
    },
    sampleHitTargets() {
      return [];
    },
    polygonTargetContainsPoint() {
      return false;
    }
  };

  assert.equal(GeoCanvas.prototype.pick.call(instance, 10, 12), null);
  assert.equal(
    GeoCanvas.prototype.pick.call(instance, 10, 12, { includeNonInteractivePolygons: true }),
    nonInteractiveLabel
  );
});

test('onClick emits featureclick for noninteractive empty polygons without running click behavior', () => {
  const pickCalls = [];
  const emitted = [];
  let tooltipCalls = 0;
  let interactionCalls = 0;
  const target = {
    type: 'polygon',
    category: 'feature',
    id: 'empty-pt',
    interactive: false,
    region: null,
    properties: { name: 'Portugal' }
  };
  const payload = {
    type: 'polygon',
    id: 'empty-pt',
    region: null,
    properties: { name: 'Portugal' }
  };
  const instance = {
    suppressNextClick: false,
    tooltipOptions: {
      enabled: true,
      trigger: 'click'
    },
    getRelativePosition() {
      return { x: 40, y: 50 };
    },
    pick(x, y, options) {
      pickCalls.push(options ?? null);
      return options?.includeNonInteractivePolygons ? target : null;
    },
    buildPayload() {
      return payload;
    },
    emit(name, nextPayload) {
      emitted.push({ name, payload: nextPayload });
    },
    showTooltip() {
      tooltipCalls += 1;
    },
    runClickInteraction() {
      interactionCalls += 1;
    },
    hideTooltip() {}
  };

  GeoCanvas.prototype.onClick.call(instance, { clientX: 40, clientY: 50 });

  assert.deepEqual(pickCalls, [null, { includeNonInteractivePolygons: true }]);
  assert.deepEqual(emitted, [{ name: 'featureclick', payload }]);
  assert.equal(tooltipCalls, 0);
  assert.equal(interactionCalls, 0);
});

test('setDefaults merges canonical defaults and rehydrates collections', () => {
  let globalRehydrated = 0;
  const rehydratedLayers = [];
  let refreshed = null;
  let rendered = 0;
  let hidTooltip = 0;

  const instance = {
    defaults: normalizeEntityDefaults({
      markers: {
        labels: { enabled: true, color: '#18344b' }
      }
    }),
    markers: [],
    lines: [],
    layers: [
      {
        id: 'cities',
        defaults: normalizeEntityDefaults({
          markers: {
            clusters: false
          }
        }),
        regions: new Map(),
        markers: [],
        lines: []
      }
    ],
    hoverTarget: { id: 'hovered' },
    rehydrateGlobalCollections() {
      globalRehydrated += 1;
    },
    rehydrateLayerCollections(layer) {
      rehydratedLayers.push(layer.id);
    },
    refreshProjectedFeatures(args) {
      refreshed = args;
    },
    hideTooltip() {
      hidTooltip += 1;
    },
    render() {
      rendered += 1;
    }
  };

  const result = GeoCanvas.prototype.setDefaults.call(instance, {
    markers: {
      labels: { color: '#e76f51' }
    },
    regions: {
      labels: false
    }
  });

  assert.equal(result, instance);
  assert.equal(instance.defaults.markers.labels.enabled, true);
  assert.equal(instance.defaults.markers.labels.color, '#e76f51');
  assert.equal(instance.defaults.regions.labels, false);
  assert.equal(globalRehydrated, 1);
  assert.deepEqual(rehydratedLayers, ['cities']);
  assert.deepEqual(refreshed, { resetView: false });
  assert.equal(instance.hoverTarget, null);
  assert.equal(hidTooltip, 1);
  assert.equal(rendered, 1);
});

test('setLayerDefaults merges canonical defaults for one layer and refreshes the map', () => {
  let rehydratedLayerId = null;
  let refreshed = null;
  let rendered = 0;
  let hidTooltip = 0;

  const layer = {
    id: 'regions',
    defaults: normalizeEntityDefaults({
      regions: {
        joinedStyle: { fill: '#8ecae6' }
      }
    }),
    regions: new Map(),
    markers: [],
    lines: []
  };

  const instance = {
    defaults: normalizeEntityDefaults({}),
    layers: [layer],
    hoverTarget: { id: 'hovered' },
    rehydrateLayerCollections(candidate) {
      rehydratedLayerId = candidate.id;
    },
    refreshProjectedFeatures(args) {
      refreshed = args;
    },
    hideTooltip() {
      hidTooltip += 1;
    },
    render() {
      rendered += 1;
    }
  };

  const result = GeoCanvas.prototype.setLayerDefaults.call(instance, 'regions', {
    regions: {
      emptyStyle: { fill: '#f1faee' },
      labels: false
    }
  });

  assert.equal(result, instance);
  assert.equal(layer.defaults.regions.joinedStyle.fill, '#8ecae6');
  assert.equal(layer.defaults.regions.emptyStyle.fill, '#f1faee');
  assert.equal(layer.defaults.regions.labels, false);
  assert.equal(rehydratedLayerId, 'regions');
  assert.deepEqual(refreshed, { resetView: false });
  assert.equal(instance.hoverTarget, null);
  assert.equal(hidTooltip, 1);
  assert.equal(rendered, 1);
});

test('setLayerTooltipOptions stores per-layer presentation overrides and can clear them', () => {
  let refreshed = null;
  let rendered = 0;
  let hidTooltip = 0;
  const layer = {
    id: 'regions',
    tooltip: undefined
  };

  const instance = {
    layers: [layer],
    hoverTarget: { id: 'hovered' },
    refreshProjectedFeatures(args) {
      refreshed = args;
    },
    hideTooltip() {
      hidTooltip += 1;
    },
    render() {
      rendered += 1;
    }
  };

  const result = GeoCanvas.prototype.setLayerTooltipOptions.call(instance, 'regions', {
    template: '<strong>{name}</strong>',
    className: 'layer-tooltip',
    style: { background: '#fff' }
  });

  assert.equal(result, instance);
  assert.deepEqual(layer.tooltip, {
    template: '<strong>{name}</strong>',
    className: 'layer-tooltip',
    style: { background: '#fff' }
  });
  assert.equal(GeoCanvas.prototype.getLayerTooltipOptions.call(instance, 'regions').className, 'layer-tooltip');
  assert.deepEqual(refreshed, { resetView: false });
  assert.equal(instance.hoverTarget, null);
  assert.equal(hidTooltip, 1);
  assert.equal(rendered, 1);

  GeoCanvas.prototype.setLayerTooltipOptions.call(instance, 'regions', null);
  assert.equal(layer.tooltip, undefined);
});

test('setLayerVisibility preserves the current base transform while updating visibility', () => {
  let refreshed = null;
  let rendered = 0;
  let hidTooltip = 0;
  const layer = {
    id: 'world',
    visible: true
  };

  const instance = {
    layers: [layer],
    hoverTarget: { id: 'hovered' },
    cancelLayerFade() {},
    refreshProjectedFeatures(args) {
      refreshed = args;
    },
    hideTooltip() {
      hidTooltip += 1;
    },
    render() {
      rendered += 1;
    }
  };

  const result = GeoCanvas.prototype.setLayerVisibility.call(instance, 'world', false);

  assert.equal(result, instance);
  assert.equal(layer.visible, false);
  assert.deepEqual(refreshed, { resetView: false, preserveBaseTransform: true });
  assert.equal(instance.hoverTarget, null);
  assert.equal(hidTooltip, 1);
  assert.equal(rendered, 1);
});

test('view event helpers snapshot views and detect zoom deltas', () => {
  assert.deepEqual(cloneViewState({ zoom: '2', center: { lon: '3', lat: 4 } }), {
    zoom: 2,
    center: { lon: 3, lat: 4 }
  });
  assert.equal(didZoomChange({ zoom: 1 }, { zoom: 1 }), false);
  assert.equal(didZoomChange({ zoom: 1 }, { zoom: 1.5 }), true);
  assert.equal(VIEW_EVENT_NAMES.has('zoomend'), true);
});

test('animateToView emits zoomend for immediate zoom changes but not for center-only moves', () => {
  const events = [];
  const completions = [];
  const instance = {
    options: { minZoom: 0.5, maxZoom: 8, animationDuration: 240 },
    view: { zoom: 1, center: { lon: 0, lat: 0 } },
    stopAnimation() {
      return this;
    },
    clampView(view) {
      return cloneViewState(view);
    },
    render() {},
    emit(name, payload) {
      events.push({ name, payload });
    },
    snapshotView: GeoCanvas.prototype.snapshotView,
    emitZoomEnd: GeoCanvas.prototype.emitZoomEnd
  };

  GeoCanvas.prototype.animateToView.call(instance, {
    zoom: 2,
    center: { lon: 5, lat: 4 }
  }, {
    animate: false,
    zoomEventTrigger: 'setZoom',
    onComplete(view) {
      completions.push(cloneViewState(view));
    }
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'zoomend');
  assert.deepEqual(events[0].payload, {
    zoom: 2,
    previousZoom: 1,
    center: { lon: 5, lat: 4 },
    previousCenter: { lon: 0, lat: 0 },
    trigger: 'setZoom'
  });
  assert.deepEqual(completions, [{
    zoom: 2,
    center: { lon: 5, lat: 4 }
  }]);

  events.length = 0;
  completions.length = 0;
  GeoCanvas.prototype.animateToView.call(instance, {
    zoom: 2,
    center: { lon: 8, lat: 6 }
  }, {
    animate: false,
    zoomEventTrigger: 'setCenter',
    onComplete(view) {
      completions.push(cloneViewState(view));
    }
  });

  assert.equal(events.length, 0);
  assert.deepEqual(completions, [{
    zoom: 2,
    center: { lon: 8, lat: 6 }
  }]);
});

test('animateToView emits zoomend once after animated zooms complete', () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  const events = [];
  const completions = [];
  let scheduledFrame = null;

  globalThis.requestAnimationFrame = (callback) => {
    scheduledFrame = callback;
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {};

  try {
    const instance = {
      options: { minZoom: 0.5, maxZoom: 8, animationDuration: 240 },
      view: { zoom: 1, center: { lon: 0, lat: 0 } },
      animationFrame: null,
      animationState: null,
      stopAnimation() {
        return this;
      },
      clampView(view) {
        return cloneViewState(view);
      },
      render() {},
      emit(name, payload) {
        events.push({ name, payload });
      },
      snapshotView: GeoCanvas.prototype.snapshotView,
      emitZoomEnd: GeoCanvas.prototype.emitZoomEnd,
      commitAnimationFrame: GeoCanvas.prototype.commitAnimationFrame
    };

    GeoCanvas.prototype.animateToView.call(instance, {
      zoom: 3,
      center: { lon: 10, lat: 5 }
    }, {
      animate: true,
      duration: 100,
      zoomEventTrigger: 'zoomIn',
      onComplete(view) {
        completions.push(cloneViewState(view));
      }
    });

    assert.equal(events.length, 0);
    assert.equal(typeof scheduledFrame, 'function');

    const animationState = instance.animationState;
    scheduledFrame(animationState.startTime + animationState.duration);
    if (events.length === 0 && typeof scheduledFrame === 'function') {
      scheduledFrame(animationState.startTime + animationState.duration + 1);
    }

    assert.equal(events.length, 1);
    assert.deepEqual(events[0], {
      name: 'zoomend',
      payload: {
        zoom: 3,
        previousZoom: 1,
        center: { lon: 10, lat: 5 },
        previousCenter: { lon: 0, lat: 0 },
        trigger: 'zoomIn'
      }
    });
    assert.equal(instance.animationState, null);
    assert.deepEqual(completions, [{
      zoom: 3,
      center: { lon: 10, lat: 5 }
    }]);
  } finally {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  }
});

test('scheduleClusterExpansionFrame skips a separate RAF while the map animation is active', () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  let scheduled = false;

  globalThis.requestAnimationFrame = () => {
    scheduled = true;
    return 1;
  };

  try {
    const instance = {
      animationState: { active: true },
      clusterExpansionFrame: null,
      clusterExpansionTransitions: new Map([['marker:a:0', { startTime: 0, duration: 240 }]]),
      clusterFadeTransitions: new Map()
    };

    GeoCanvas.prototype.scheduleClusterExpansionFrame.call(instance);
    assert.equal(scheduled, false);
  } finally {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  }
});

test('animateToView schedules cluster transition frames after zoom completion when needed', () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  const frameCallbacks = [];
  let scheduledClusterFrame = false;

  globalThis.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  globalThis.cancelAnimationFrame = () => {};

  try {
    const instance = {
      options: { minZoom: 0.5, maxZoom: 8, animationDuration: 240 },
      view: { zoom: 1, center: { lon: 0, lat: 0 } },
      animationFrame: null,
      animationState: null,
      clusterExpansionFrame: null,
      clusterExpansionTransitions: new Map([['marker:a:0', { startTime: 0, duration: 240 }]]),
      clusterFadeTransitions: new Map(),
      stopAnimation() {
        return this;
      },
      clampView(view) {
        return cloneViewState(view);
      },
      render() {},
      emit() {},
      snapshotView: GeoCanvas.prototype.snapshotView,
      emitZoomEnd: GeoCanvas.prototype.emitZoomEnd,
      commitAnimationFrame: GeoCanvas.prototype.commitAnimationFrame,
      clearClusterExpansionTransitions() {},
      scheduleClusterExpansionFrame() {
        scheduledClusterFrame = true;
      }
    };

    GeoCanvas.prototype.animateToView.call(instance, {
      zoom: 3,
      center: { lon: 10, lat: 5 }
    }, {
      animate: true,
      duration: 100
    });

    const animationState = instance.animationState;
    frameCallbacks[0](animationState.startTime + animationState.duration);

    assert.equal(scheduledClusterFrame, true);
  } finally {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  }
});

test('updateMarkerClusterTransitions starts marker expansion and cluster fade when a cluster opens while zooming in', () => {
  const markers = [
    createMarkerRecord({ id: 'a', lon: 0, lat: 0 }, { fallbackId: 'a', order: 0, entityKeyPrefix: 'marker' }),
    createMarkerRecord({ id: 'b', lon: 10, lat: 0 }, { fallbackId: 'b', order: 1, entityKeyPrefix: 'marker' }),
    createMarkerRecord({ id: 'c', lon: 40, lat: 0 }, { fallbackId: 'c', order: 2, entityKeyPrefix: 'marker' })
  ];
  const previousCluster = createClusterMarker([
    { marker: markers[0], point: { x: 5, y: 0 } },
    { marker: markers[1], point: { x: 5, y: 0 } }
  ], {
    clusterIdPrefix: 'cluster:test',
    clusterOptions: { enabled: true, radius: 14 }
  }, (x, y) => ({ lon: x, lat: y }));
  let scheduledFrame = null;
  const instance = {
    view: { zoom: 3, center: { lon: 0, lat: 0 } },
    lastRenderedMarkerZoom: 2,
    previousRenderedClusterMarkers: new Map([[previousCluster.id, previousCluster]]),
    clusterExpansionFrame: null,
    clusterExpansionTransitions: new Map(),
    clusterFadeTransitions: new Map(),
    prefersReducedMotion() {
      return false;
    },
    projectPoint(lon, lat) {
      return { x: lon, y: lat };
    },
    scheduleClusterExpansionFrame: GeoCanvas.prototype.scheduleClusterExpansionFrame
  };

  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  try {
    globalThis.requestAnimationFrame = (callback) => {
      scheduledFrame = callback;
      return 1;
    };

    GeoCanvas.prototype.updateMarkerClusterTransitions.call(instance, [
      {
        rendered: {
          items: markers.slice()
        }
      }
    ], { items: [] }, performance.now());

    assert.equal(instance.clusterExpansionTransitions.size, 2);
    assert.equal(instance.clusterFadeTransitions.size, 1);
    assert.equal(instance.clusterExpansionTransitions.get(markers[0].entityKey).phase, 'enter');
    assert.equal(instance.clusterFadeTransitions.get(previousCluster.id).phase, 'out');
    assert.equal(typeof scheduledFrame, 'function');
  } finally {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  }
});

test('updateMarkerClusterTransitions starts marker collapse and cluster fade-in when markers become a cluster while zooming out', () => {
  const markers = [
    createMarkerRecord({ id: 'a', lon: 0, lat: 0 }, { fallbackId: 'a', order: 0, entityKeyPrefix: 'marker' }),
    createMarkerRecord({ id: 'b', lon: 10, lat: 0 }, { fallbackId: 'b', order: 1, entityKeyPrefix: 'marker' })
  ];
  const currentCluster = createClusterMarker([
    { marker: markers[0], point: { x: 5, y: 0 } },
    { marker: markers[1], point: { x: 5, y: 0 } }
  ], {
    clusterIdPrefix: 'cluster:test',
    clusterOptions: { enabled: true, radius: 14 }
  }, (x, y) => ({ lon: x, lat: y }));
  const instance = {
    view: { zoom: 2, center: { lon: 0, lat: 0 } },
    lastRenderedMarkerZoom: 3,
    previousRenderedClusterMarkers: new Map(),
    previousRenderedVisibleMarkers: new Map(markers.map((marker) => [marker.entityKey, marker])),
    clusterExpansionFrame: null,
    clusterExpansionTransitions: new Map(),
    clusterFadeTransitions: new Map(),
    prefersReducedMotion() {
      return false;
    },
    projectPoint(lon, lat) {
      return { x: lon, y: lat };
    },
    scheduleClusterExpansionFrame() {}
  };

  GeoCanvas.prototype.updateMarkerClusterTransitions.call(instance, [], { items: [currentCluster] }, performance.now());

  assert.equal(instance.clusterExpansionTransitions.size, 2);
  assert.equal(instance.clusterFadeTransitions.size, 1);
  assert.equal(instance.clusterExpansionTransitions.get(markers[0].entityKey).phase, 'exit');
  assert.equal(instance.clusterFadeTransitions.get(currentCluster.id).phase, 'in');
});

test('endPinchGesture emits zoomend after pinch zoom completes', () => {
  const events = [];
  const instance = {
    pinchState: {
      startView: { zoom: 1, center: { lon: 0, lat: 0 } }
    },
    dragState: { active: true },
    canvas: { style: {} },
    options: { panEnabled: true },
    view: { zoom: 1.8, center: { lon: 4, lat: -2 } },
    emit(name, payload) {
      events.push({ name, payload });
    },
    snapshotView: GeoCanvas.prototype.snapshotView,
    emitZoomEnd: GeoCanvas.prototype.emitZoomEnd
  };

  GeoCanvas.prototype.endPinchGesture.call(instance);

  assert.equal(instance.pinchState, null);
  assert.equal(instance.dragState, null);
  assert.equal(instance.canvas.style.cursor, 'grab');
  assert.deepEqual(events, [{
    name: 'zoomend',
    payload: {
      zoom: 1.8,
      previousZoom: 1,
      center: { lon: 4, lat: -2 },
      previousCenter: { lon: 0, lat: 0 },
      trigger: 'pinch'
    }
  }]);
});

test('tooltip templates resolve properties before data', () => {
  const payload = {
    properties: { name: 'Portugal', population: '10.3M' },
    data: { population: 'ignored', score: 'A+' },
    region: { title: 'Portugal', color: '#2a9d8f' },
    layer: { id: 'countries' }
  };
  assert.equal(
    renderTooltipTemplate('<strong>{name}</strong> {population} {score} {title} {id} {missing}', payload),
    '<strong>Portugal</strong> 10.3M A+ Portugal countries '
  );
});

test('binding helpers resolve region-driven values and tooltip templates', () => {
  const context = {
    region: { title: 'Portugal', color: '#2a9d8f', hoverColor: '#1d6f63' },
    properties: { name: 'Portugal' },
    layer: { id: 'countries' }
  };

  assert.equal(resolveContextValue('color', context), '#2a9d8f');
  assert.equal(resolveBindingValue('hoverColor', context), '#1d6f63');
  assert.equal(resolveTooltipBinding('<strong>{title}</strong> ({name})', context), '<strong>Portugal</strong> (Portugal)');

  const hoverStyle = resolveBoundFeatureStyle({
    fill: 'color',
    hoverFill: 'hoverColor'
  }, context, true);
  assert.equal(hoverStyle.fill, '#1d6f63');
});

test('tooltip bindings treat non-key strings as literal content', () => {
  const context = {
    properties: { name: 'Portugal' },
    region: { title: 'Portugal' }
  };

  assert.equal(resolveTooltipBinding('title', context), 'Portugal');
  assert.equal(resolveTooltipBinding('region.title', context), 'Portugal');
  assert.equal(resolveTooltipBinding('this is the tooltip', context), 'this is the tooltip');
  assert.equal(resolveTooltipBinding('<strong>Static HTML</strong>', context), '<strong>Static HTML</strong>');
});

test('empty hover stroke width bindings fall back to the normal stroke width', () => {
  const context = {
    region: { strokeWidth: 3 },
    properties: {}
  };

  const hoverStyle = resolveBoundFeatureStyle({
    strokeWidth: 'strokeWidth',
    hoverStrokeWidth: () => ''
  }, context, true);

  assert.deepEqual(hoverStyle, {});
});

test('label and interaction helpers normalize declarative drilldown settings', () => {
  assert.deepEqual(normalizeLabelOptions({ enabled: true, source: 'all-features', field: 'title', background: '#fff' }), {
    enabled: true,
    source: 'all-features',
    field: 'title',
    fallbackFields: ['title', 'name', 'id'],
    positions: {},
    font: '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif',
    color: '#18344b',
    background: '#fff',
    paddingX: 6,
    paddingY: 3,
    borderRadius: 4,
    minZoom: null,
    maxZoom: null
  });
  assert.deepEqual(normalizeMarkerLabelOptions({
    enabled: true,
    field: 'title',
    position: 'bottom-right',
    background: '#fff',
    scaleWithZoom: true
  }), {
    enabled: true,
    field: 'title',
    fallbackFields: ['title', 'name', 'label', 'id'],
    font: '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif',
    color: '#18344b',
    background: '#fff',
    paddingX: 6,
    paddingY: 3,
    borderRadius: 4,
    position: 'bottom-right',
    offsetX: 0,
    offsetY: 0,
    distance: 8,
    minZoom: null,
    maxZoom: null,
    scaleWithZoom: true,
    minScale: 1,
    maxScale: 2
  });
  assert.equal(normalizeMarkerLabelPosition('bad-position'), 'top');
  assert.deepEqual(normalizeMarkerClusterOptions({
    enabled: true,
    radius: 32,
    minPoints: 3,
    maxZoom: 5,
    clickToZoom: false,
    zoomScale: 6,
    style: { radius: 16 },
    labelColor: '#111111'
  }), {
    enabled: true,
    radius: 32,
    minPoints: 3,
    maxZoom: 5,
    clickToZoom: false,
    zoomScale: 6,
    style: { radius: 16 },
    labelFont: '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif',
    labelColor: '#111111'
  });

  assert.deepEqual(normalizeInteractionOptions({
    click: {
      zoomTo: 'feature',
      zoomPadding: 32,
      showLayers: ['us-detail'],
      hideLayers: 'world'
    }
  }), {
    click: {
      zoomTo: 'feature',
      zoomPadding: 32,
      zoomMax: null,
      zoomScale: null,
      showLayers: ['us-detail'],
      hideLayers: ['world'],
      toggleLayers: [],
      emptyRegions: true,
      action: null,
      handler: null
    }
  });

  assert.deepEqual(resolveLayerTargetIds([
    { id: 'world-countries', name: 'world' },
    { id: 'australia', name: 'australia' },
    { id: 'world-countries-2', name: 'world' }
  ], ['australia', 'world', 'world-countries']), [
    'australia',
    'world',
    'world-countries'
  ]);
});

test('click action helpers normalize and merge declarative built-in actions', () => {
  assert.deepEqual(normalizeClickActionOptions({
    type: 'panel',
    url: '{properties.url}',
    content: '<strong>{properties.name}</strong>',
    title: '{properties.name}',
    placement: 'right',
    mode: 'overlay',
    iframe: { loading: 'eager' },
    panel: {
      size: '420px',
      borderRadius: '20px',
      closeable: false,
      closeOnEmptyRegionClick: true,
      closeOnMapClick: true
    }
  }), {
    type: 'panel',
    url: '{properties.url}',
    content: '<strong>{properties.name}</strong>',
    title: '{properties.name}',
    render: 'auto',
    target: 'self',
    placement: 'right',
    mode: 'overlay',
    className: '',
    iframe: {
      sandbox: '',
      allow: '',
      loading: 'eager',
      referrerPolicy: ''
    },
    lightbox: {
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
    },
    panel: {
      size: '420px',
      padding: '16px',
      background: '#ffffff',
      color: '#18344b',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      borderRadius: '20px',
      gap: '16px',
      closeable: false,
      closeOnEmptyRegionClick: true,
      closeOnMapClick: true
    }
  });

  assert.deepEqual(normalizePartialClickActionOptions(false), false);
  assert.deepEqual(normalizePartialClickActionOptions({
    type: 'lightbox',
    lightbox: { closeOnEscape: false }
  }), {
    type: 'lightbox',
    lightbox: { closeOnEscape: false }
  });

  assert.deepEqual(resolveInteractionConfig(
    {
      click: {
        action: {
          type: 'panel',
          placement: 'right',
          panel: { size: '320px', background: '#ffffff' }
        }
      }
    },
    {
      click: {
        action: {
          panel: { size: '480px' }
        }
      }
    }
  ), {
    click: {
      zoomTo: false,
      zoomPadding: 24,
      zoomMax: null,
      zoomScale: null,
      showLayers: [],
      hideLayers: [],
      toggleLayers: [],
      emptyRegions: true,
      action: {
        type: 'panel',
        url: null,
        content: null,
        title: null,
        render: 'auto',
        target: 'self',
        placement: 'right',
        mode: 'layout',
        className: '',
        iframe: {
          sandbox: '',
          allow: '',
          loading: 'lazy',
          referrerPolicy: ''
        },
        lightbox: {
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
        },
        panel: {
          size: '480px',
          padding: '16px',
          background: '#ffffff',
          color: '#18344b',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: '',
          gap: '16px',
          closeable: true,
          closeOnEmptyRegionClick: false,
          closeOnMapClick: false
        }
      },
      handler: null
    }
  });

  assert.deepEqual(resolveInteractionConfig(
    {
      click: {
        zoomTo: 'feature',
        emptyRegions: true,
        action: {
          type: 'panel'
        }
      }
    },
    {
      click: {
        emptyRegions: false
      }
    }
  ), {
    click: {
      zoomTo: 'feature',
      zoomPadding: 24,
      zoomMax: null,
      zoomScale: null,
      emptyRegions: false,
      showLayers: [],
      hideLayers: [],
      toggleLayers: [],
      action: {
        type: 'panel',
        url: null,
        content: null,
        title: null,
        render: 'auto',
        target: 'self',
        placement: 'below',
        mode: 'layout',
        className: '',
        iframe: {
          sandbox: '',
          allow: '',
          loading: 'lazy',
          referrerPolicy: ''
        },
        lightbox: {
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
        },
        panel: {
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
        }
      },
      handler: null
    }
  });
});

test('click action request resolution uses templates, literal strings, and resolver functions', () => {
  const request = resolveClickActionRequest({
    type: 'lightbox',
    url: ({ id }) => `https://example.com/${id}`,
    title: '{properties.name}'
  }, {
    id: 'pt',
    properties: { name: 'Portugal' }
  }, {});

  assert.deepEqual(request, {
    type: 'lightbox',
    renderMode: 'iframe',
    title: 'Portugal',
    url: 'https://example.com/pt'
  });

  assert.deepEqual(resolveClickActionRequest({
    type: 'panel',
    render: 'text',
    content: ({ properties }) => properties.name
  }, {
    properties: { name: 'Portugal' }
  }, {}), {
    type: 'panel',
    renderMode: 'text',
    title: null,
    content: 'Portugal'
  });
});

test('tooltip and region-style helpers normalize richer presentation options', () => {
  assert.deepEqual(normalizeTooltipOptions({
    enabled: true,
    trigger: 'click',
    position: 'left',
    showPointer: true,
    regions: { visibility: 'joined-only' },
    style: { background: '#111827', color: '#f9fafb' }
  }), {
    enabled: true,
    template: '{name}',
    mode: 'follow',
    trigger: 'click',
    position: 'left',
    followPointer: true,
    interactive: false,
    showPointer: true,
    offsetX: 12,
    offsetY: 12,
    className: '',
    regions: { visibility: 'joined-only' },
    style: { background: '#111827', color: '#f9fafb' },
    render: null
  });

  assert.deepEqual(normalizeRegionStyleOptions({
    defaultFill: '#dbe7f2',
    defaultStroke: '#ffffff',
    emptyFill: '#eef3f8',
    emptyInteractive: false
  }), {
    defaultFill: '#dbe7f2',
    defaultStroke: '#ffffff',
    defaultStrokeWidth: null,
    defaultOpacity: null,
    emptyFill: '#eef3f8',
    emptyStroke: null,
    emptyStrokeWidth: null,
    emptyOpacity: null,
    interactive: true,
    emptyInteractive: false
  });
});

test('legend options normalize types, positions, sizes, and custom entries', () => {
  const legend = normalizeLegendOptions({
    type: 'custom',
    position: 'top-left',
    size: 'lg',
    entries: [
      { label: 'Joined regions', color: '#88b4d6' },
      { label: 'Markers', color: '#e74c3c' }
    ]
  });

  assert.deepEqual(legend, {
    enabled: true,
    type: 'custom',
    interaction: 'none',
    position: 'top-left',
    size: 'lg',
    entries: [
      { id: 'legend-entry-1', label: 'Joined regions', color: '#88b4d6' },
      { id: 'legend-entry-2', label: 'Markers', color: '#e74c3c' }
    ]
  });
});

test('layer legends derive entry labels, colors, and visibility from current layers', () => {
  const legend = normalizeLegendOptions({
    enabled: true,
    type: 'layers',
    interaction: 'toggle-layer-visibility'
  });
  const entries = resolveLegendEntriesFromOptions(legend, [
    {
      id: 'world',
      name: 'World',
      visible: true,
      resolvedDefaults: {
        regions: {
          joinedStyle: { fill: '#88b4d6' }
        }
      }
    },
    {
      id: 'cities',
      name: 'Cities',
      visible: false,
      resolvedDefaults: {
        regions: {
          joinedStyle: { fill: '#e76f51' }
        }
      }
    }
  ]);

  assert.deepEqual(entries, [
    {
      id: 'world',
      label: 'World',
      color: '#88b4d6',
      visible: true,
      interactive: true,
      layerId: 'world'
    },
    {
      id: 'cities',
      label: 'Cities',
      color: '#e76f51',
      visible: false,
      interactive: true,
      layerId: 'cities'
    }
  ]);
});

test('legend clicks can toggle layer visibility for layer legends', () => {
  const calls = [];
  const instance = {
    legendOptions: normalizeLegendOptions({
      enabled: true,
      type: 'layers',
      interaction: 'toggle-layer-visibility'
    }),
    layers: [
      { id: 'world', visible: true }
    ],
    setLayerVisibility(layerId, visible) {
      calls.push({ layerId, visible });
    }
  };

  GeoCanvas.prototype.onLegendClick.call(instance, {
    target: {
      closest(selector) {
        return selector === '[data-legend-layer-id]'
          ? { dataset: { legendLayerId: 'world' } }
          : null;
      }
    },
    preventDefault() {}
  });

  assert.deepEqual(calls, [{ layerId: 'world', visible: false }]);
});

test('tooltip visibility can exclude unjoined region payloads', () => {
  const tooltip = normalizeTooltipOptions({
    enabled: true,
    regions: { visibility: 'joined-only' }
  });

  assert.equal(shouldShowTooltipForPayload(tooltip, {
    geometryType: 'Polygon',
    region: null
  }), false);

  assert.equal(shouldShowTooltipForPayload(tooltip, {
    geometryType: 'Polygon',
    region: { title: 'Portugal' }
  }), true);

  assert.equal(shouldShowTooltipForPayload(tooltip, {
    geometryType: 'Point',
    region: null
  }), true);
});

test('showTooltip applies layer tooltip template and style while preserving global behavior', () => {
  const instance = {
    tooltipElement: { style: {}, className: '' },
    tooltipContentElement: { style: {}, innerHTML: '' },
    tooltipPointerElement: { style: {} },
    tooltipOptions: normalizeTooltipOptions({
      enabled: true,
      template: '{name}',
      className: 'global-tooltip',
      style: {
        background: '#182230',
        color: '#ffffff'
      }
    }),
    dragState: null,
    tooltipHideFrame: null,
    tooltipState: {
      visible: false,
      payload: null,
      anchorPoint: null,
      anchorPosition: null
    },
    hideTooltip() {
      this.hidden = true;
      this.tooltipState.visible = false;
    },
    positionTooltip(point) {
      this.positionedPoint = point;
    },
    applyTooltipClassName: GeoCanvas.prototype.applyTooltipClassName,
    applyTooltipInlineStyle: GeoCanvas.prototype.applyTooltipInlineStyle
  };

  GeoCanvas.prototype.showTooltip.call(instance, {
    properties: { name: 'Portugal' },
    layerTooltip: {
      template: '<strong>{name}</strong>',
      className: 'layer-tooltip',
      style: { background: '#f8fafc' }
    }
  }, { x: 20, y: 24 }, 'move');

  assert.equal(instance.tooltipState.visible, true);
  assert.equal(instance.tooltipContentElement.innerHTML, '<strong>Portugal</strong>');
  assert.equal(instance.tooltipElement.className, 'geocanvas-tooltip layer-tooltip');
  assert.equal(instance.tooltipContentElement.style.background, '#f8fafc');
  assert.equal(instance.tooltipContentElement.style.color, '#ffffff');
  assert.deepEqual(instance.positionedPoint, { x: 20, y: 24 });
});

test('showTooltip can wrap resolved item tooltip content with the active template', () => {
  const instance = {
    tooltipElement: { style: {}, className: '' },
    tooltipContentElement: { style: {}, innerHTML: '' },
    tooltipPointerElement: { style: {} },
    tooltipOptions: normalizeTooltipOptions({
      enabled: true,
      template: 'XXX {tooltipContent} XXX'
    }),
    dragState: null,
    tooltipHideFrame: null,
    tooltipState: {
      visible: false,
      payload: null,
      anchorPoint: null,
      anchorPosition: null
    },
    hideTooltip() {
      this.tooltipState.visible = false;
    },
    positionTooltip(point) {
      this.positionedPoint = point;
    },
    applyTooltipClassName: GeoCanvas.prototype.applyTooltipClassName,
    applyTooltipInlineStyle: GeoCanvas.prototype.applyTooltipInlineStyle
  };

  GeoCanvas.prototype.showTooltip.call(instance, {
    properties: { name: 'Portugal' },
    tooltipContent: 'Hello world'
  }, { x: 20, y: 24 }, 'move');

  assert.equal(instance.tooltipState.visible, true);
  assert.equal(instance.tooltipContentElement.innerHTML, 'XXX Hello world XXX');
  assert.deepEqual(instance.positionedPoint, { x: 20, y: 24 });
});

test('label helpers resolve text and grouped anchors for region features', () => {
  const feature = {
    region: { title: 'United States' },
    properties: { name: 'USA', id: 'US' },
    bindingContext: {
      region: { title: 'United States' },
      properties: { name: 'USA', id: 'US' }
    }
  };

  assert.equal(
    computeLabelText(feature, { enabled: true, source: 'layer-regions', field: 'title', fallbackFields: ['name'] }),
    'United States'
  );
  assert.equal(
    computeLabelText(feature, { enabled: true, source: 'all-features', field: null, fallbackFields: ['name', 'id'] }),
    'USA'
  );

  const groupedEntries = [
    {
      projectedCoordinates: [[[[-125, 25], [-100, 25], [-100, 35], [-125, 35], [-125, 25]]]][0]
    },
    {
      projectedCoordinates: [[[[-95, 28], [-80, 28], [-80, 40], [-95, 40], [-95, 28]]]][0]
    }
  ];

  assert.deepEqual(computeProjectedCoordinateBounds(groupedEntries[0].projectedCoordinates), {
    minX: -125,
    minY: 25,
    maxX: -100,
    maxY: 35
  });
  assert.deepEqual(collectProjectedBounds(groupedEntries), {
    minX: -125,
    minY: 25,
    maxX: -80,
    maxY: 40
  });
  assert.deepEqual(computeLabelAnchor(groupedEntries), {
    x: -102.5,
    y: 32.5
  });
});

test('resolveRegionLabelAnchor prefers custom positions keyed by layer join id', () => {
  const anchor = GeoCanvas.prototype.resolveRegionLabelAnchor.call({
    projectGeoPoint(lon, lat) {
      return { x: lon * 2, y: lat * 3 };
    }
  }, [
    {
      sourceId: 'feature-rhode-island',
      filterId: 'RI',
      projectedCoordinates: [[[-71.8, 41.1], [-71.1, 41.1], [-71.1, 42.0], [-71.8, 42.0], [-71.8, 41.1]]]
    }
  ], {
    positions: {
      RI: { lon: -70.9, lat: 41.7 },
      'feature-rhode-island': { lon: -99, lat: -99 }
    }
  });

  assert.deepEqual(anchor, {
    x: -141.8,
    y: 125.10000000000001
  });
});

test('transformGeoPointForLayer and line display coordinates follow moved regions', () => {
  const instance = Object.create(GeoCanvas.prototype);
  instance.getLayerRegionTransformRecord = GeoCanvas.prototype.getLayerRegionTransformRecord;
  instance.findContainingLayerRegionTransform = GeoCanvas.prototype.findContainingLayerRegionTransform;
  instance.transformGeoPointForLayer = GeoCanvas.prototype.transformGeoPointForLayer;
  instance.transformCoordinatesForLayer = GeoCanvas.prototype.transformCoordinatesForLayer;

  const alaskaRing = [[-170, 50], [-130, 50], [-130, 70], [-170, 70], [-170, 50]];
  const layer = {
    regionTransformIndex: {
      byJoinId: new Map([
        ['AK', {
          joinId: 'AK',
          delta: { lon: 50, lat: -30 },
          entries: [{ kind: 'polygon', coordinates: [alaskaRing] }]
        }]
      ])
    }
  };

  const markerPoint = GeoCanvas.prototype.transformGeoPointForLayer.call(instance, layer, -150, 60);
  assert.deepEqual(markerPoint, {
    lon: -100,
    lat: 30,
    regionJoinId: 'AK'
  });

  const lineCoordinates = GeoCanvas.prototype.transformCoordinatesForLayer.call(instance, layer, [[-150, 60], [-95, 31]]);
  assert.deepEqual(lineCoordinates, [[-100, 30], [-95, 31]]);
});

test('resolveRegionLabelAnchor falls back to feature geocanvas regionLabel position metadata', () => {
  const anchor = GeoCanvas.prototype.resolveRegionLabelAnchor.call({
    projectGeoPoint(lon, lat) {
      return { x: lon, y: lat };
    }
  }, [
    {
      sourceId: 'feature-rhode-island',
      filterId: 'RI',
      geocanvas: {
        regionLabel: {
          position: { lon: -70.9, lat: 41.7 }
        }
      },
      projectedCoordinates: [[[-71.8, 41.1], [-71.1, 41.1], [-71.1, 42.0], [-71.8, 42.0], [-71.8, 41.1]]]
    }
  ], {
    positions: {}
  });

  assert.deepEqual(anchor, {
    x: -70.9,
    y: 41.7
  });
});

test('drawLayerLabels creates polygon-backed hit targets for region labels', () => {
  const calls = [];
  GeoCanvas.prototype.drawLayerLabels.call({
    isGlobeProjection() {
      return false;
    },
    view: { zoom: 1 },
    layers: [
      {
        id: 'world',
        visible: true,
        resolvedDefaults: {
          regions: {
            labels: normalizeLabelOptions({
              enabled: true,
              source: 'all-features'
            })
          }
        },
        projectedFeatureEntries: [
          {
            kind: 'polygon',
            sourceId: 'PT',
            filterId: 'PT',
            layerId: 'world',
            layerName: 'World',
            geometryType: 'Polygon',
            properties: { name: 'Portugal' },
            data: { code: 'PT' },
            region: null,
            source: { id: 'countries', name: 'Countries' },
            bindings: {},
            layerTooltip: null,
            interaction: {},
            entityKey: 'feature:PT',
            hoverKey: 'feature:PT',
            order: 0,
            layerRegionDefaults: { emptyInteractive: false },
            projectedCoordinates: [[[-10, 0], [0, 0], [0, 10], [-10, 10], [-10, 0]]]
          }
        ]
      }
    ],
    getLayerVisibilityOpacity() {
      return 1;
    },
    projectGeoPoint(lon, lat) {
      return { x: lon, y: lat };
    },
    resolveFeatureStyle() {
      return { cursor: 'pointer' };
    },
    createRegionLabelHitTarget: GeoCanvas.prototype.createRegionLabelHitTarget,
    resolveRegionLabelAnchor: GeoCanvas.prototype.resolveRegionLabelAnchor,
    drawLabel(text, anchor, labels, opacity, options) {
      calls.push({ text, anchor, labels, opacity, options });
    }
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].text, 'Portugal');
  assert.deepEqual(calls[0].anchor, { x: -5, y: 5 });
  assert.equal(calls[0].opacity, 1);
  assert.equal(calls[0].options.hitTarget.type, 'polygon');
  assert.equal(calls[0].options.hitTarget.hitRole, 'label');
  assert.equal(calls[0].options.hitTarget.id, 'PT');
  assert.equal(calls[0].options.hitTarget.regionJoinId, 'PT');
  assert.equal(calls[0].options.hitTarget.interactive, false);
});

test('marker label helpers resolve text, scaling, and screen anchors', () => {
  const marker = createMarkerRecord({
    id: 'lisbon',
    lon: -9.14,
    lat: 38.72,
    title: 'Lisbon',
    type: 'image',
    image: {
      svg: '<svg></svg>',
      width: 20,
      height: 30,
      anchorX: 10,
      anchorY: 30
    }
  }, {
    fallbackId: 'lisbon',
    order: 0,
    entityKeyPrefix: 'marker'
  });
  marker.bindingContext = {
    marker,
    properties: {},
    data: {},
    region: null,
    layer: null,
    source: null
  };

  assert.equal(computeMarkerLabelText(marker, {
    enabled: true,
    field: null,
    fallbackFields: ['title', 'name']
  }), 'Lisbon');
  assert.equal(
    scaleFontPixels('12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif', 1.5),
    '18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif'
  );
  assert.equal(resolveMarkerLabelScale({ scaleWithZoom: true, minScale: 1, maxScale: 2 }, 3), 2);

  assert.deepEqual(resolveMarkerLabelRenderOptions({
    font: '12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif',
    paddingX: 6,
    paddingY: 3,
    borderRadius: 4,
    offsetX: 2,
    offsetY: -1,
    distance: 8,
    scaleWithZoom: true,
    minScale: 1,
    maxScale: 2
  }, 1.5), {
    font: '18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif',
    paddingX: 9,
    paddingY: 4.5,
    borderRadius: 6,
    offsetX: 3,
    offsetY: -1.5,
    distance: 12,
    scaleWithZoom: true,
    minScale: 1,
    maxScale: 2
  });

  assert.deepEqual(computeMarkerLabelAnchor(
    { x: 100, y: 80 },
    marker,
    { width: 20, height: 30, radius: 5 },
    { position: 'top-right', offsetX: 0, offsetY: 0, distance: 8 }
  ), {
    x: 118,
    y: 42
  });
});

test('marker clustering groups nearby markers and creates a cluster payload', () => {
  const markers = [
    createMarkerRecord({ id: 'a', lon: 0, lat: 0 }, { fallbackId: 'a', order: 0, entityKeyPrefix: 'marker' }),
    createMarkerRecord({ id: 'b', lon: 1, lat: 1 }, { fallbackId: 'b', order: 1, entityKeyPrefix: 'marker' }),
    createMarkerRecord({ id: 'c', lon: 100, lat: 100 }, { fallbackId: 'c', order: 2, entityKeyPrefix: 'marker' })
  ];

  const clustered = clusterMarkersForDisplay(markers, {
    clusterIdPrefix: 'cluster:test',
    clusterOptions: {
      enabled: true,
      radius: 20,
      minPoints: 2
    }
  }, (lon, lat) => ({ x: lon, y: lat }), (x, y) => ({ lon: x, lat: y }), 1);

  assert.equal(clustered.items.length, 2);
  const cluster = clustered.items.find((item) => item.cluster);
  assert.ok(cluster);
  assert.equal(cluster.clusterData.count, 2);
  assert.deepEqual(cluster.clusterData.markerIds, ['a', 'b']);
  assert.equal(clustered.clusteredMarkerKeys.has('marker:a:0'), true);
  assert.equal(clustered.clusteredMarkerKeys.has('marker:b:1'), true);
  assert.equal(clustered.clusteredMarkerKeys.has('marker:c:2'), false);

  const createdCluster = createClusterMarker([
    { marker: markers[0], point: { x: 0, y: 0 } },
    { marker: markers[1], point: { x: 2, y: 2 } }
  ], {
    clusterIdPrefix: 'cluster:test',
    clusterOptions: { enabled: true, style: { radius: 14 } }
  }, (x, y) => ({ lon: x, lat: y }));
  assert.equal(createdCluster.clusterData.count, 2);
  assert.equal(createdCluster.style.radius, 14);
});

test('zoomToMarker and buildPayload support cluster targets', () => {
  const clusterMembers = [
    createMarkerRecord({ id: 'a', lon: 0, lat: 0 }, { fallbackId: 'a', order: 0, entityKeyPrefix: 'marker' }),
    createMarkerRecord({ id: 'b', lon: 1, lat: 1 }, { fallbackId: 'b', order: 1, entityKeyPrefix: 'marker' }),
    createMarkerRecord({ id: 'c', lon: 2, lat: 2 }, { fallbackId: 'c', order: 2, entityKeyPrefix: 'marker' })
  ];
  let animated = null;
  let userOnCompleteArgs = null;
  const clusterTarget = {
    lon: 10,
    lat: 20,
    clusterData: {
      count: 4,
      center: { lon: 12, lat: 22 }
    },
    clusterOptions: {
      zoomScale: 5
    }
  };
  const result = GeoCanvas.prototype.zoomToMarker.call({
    options: {
      minZoom: 0.5,
      maxZoom: 8,
      zoomStep: 1.2
    },
    view: { zoom: 2, center: { lon: 0, lat: 0 } },
    animateToView(view, options) {
      animated = { view, options };
      options.onComplete?.(view, this);
      return this;
    }
  }, clusterTarget, {
    onComplete(view, geo) {
      userOnCompleteArgs = { view, geo };
    }
  });

  assert.ok(result);
  assert.deepEqual(animated.view, {
    zoom: 5,
    center: { lon: 12, lat: 22 }
  });
  assert.deepEqual(userOnCompleteArgs.view, animated.view);
  assert.equal(userOnCompleteArgs.geo, result);

  const payload = GeoCanvas.prototype.buildPayload.call({}, {
    type: 'marker',
    id: 'cluster:1',
    layerId: 'cities',
    layerName: 'Cities',
    geometryType: 'Point',
    properties: { count: 3 },
    data: { count: 3 },
    region: null,
    layer: { id: 'cities', name: 'Cities' },
    source: null,
    clusterData: {
      count: 3,
      markerIds: ['a', 'b', 'c'],
      markers: clusterMembers,
      center: { lon: 1, lat: 1 }
    }
  }, { x: 40, y: 50 }, null);

  assert.equal(payload.cluster.count, 3);
  assert.deepEqual(payload.cluster.markerIds, ['a', 'b', 'c']);
});

test('cluster split transitions animate markers from the cluster center and prune fade ghosts when finished', () => {
  const markers = [
    createMarkerRecord({ id: 'a', lon: 0, lat: 0 }, { fallbackId: 'a', order: 0, entityKeyPrefix: 'marker' }),
    createMarkerRecord({ id: 'b', lon: 10, lat: 0 }, { fallbackId: 'b', order: 1, entityKeyPrefix: 'marker' }),
    createMarkerRecord({ id: 'c', lon: 40, lat: 0 }, { fallbackId: 'c', order: 2, entityKeyPrefix: 'marker' })
  ];
  let scheduledFrame = null;
  const instance = {
    clusterExpansionFrame: null,
    clusterExpansionTransitions: new Map(),
    clusterFadeTransitions: new Map(),
    prefersReducedMotion() {
      return false;
    },
    clearClusterExpansionTransitions: GeoCanvas.prototype.clearClusterExpansionTransitions,
    scheduleClusterExpansionFrame: GeoCanvas.prototype.scheduleClusterExpansionFrame,
    pruneClusterExpansionTransitions: GeoCanvas.prototype.pruneClusterExpansionTransitions,
    projectPoint(lon, lat) {
      return { x: lon, y: lat };
    },
    render() {}
  };

  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  try {
    globalThis.requestAnimationFrame = (callback) => {
      scheduledFrame = callback;
      return 1;
    };

    instance.clusterExpansionTransitions.set(markers[0].entityKey, {
      marker: markers[0],
      phase: 'enter',
      center: { lon: 5, lat: 0 },
      startTime: performance.now(),
      duration: 240
    });
    instance.clusterFadeTransitions.set('cluster:test', {
      marker: createClusterMarker([
        { marker: markers[0], point: { x: 5, y: 0 } },
        { marker: markers[1], point: { x: 5, y: 0 } }
      ], {
        clusterIdPrefix: 'cluster:test',
        clusterOptions: { enabled: true, radius: 14 }
      }, (x, y) => ({ lon: x, lat: y })),
      phase: 'out',
      startTime: performance.now(),
      duration: 240
    });

    GeoCanvas.prototype.scheduleClusterExpansionFrame.call(instance);
    assert.equal(typeof scheduledFrame, 'function');

    const midpoint = GeoCanvas.prototype.resolveAnimatedMarkerScreenPoint.call(instance, markers[0], { x: 0, y: 0 }, performance.now() + 120);
    assert.ok(midpoint.x > 0 && midpoint.x < 5);

    GeoCanvas.prototype.pruneClusterExpansionTransitions.call(instance, performance.now() + 400);
    assert.equal(instance.clusterExpansionTransitions.size, 0);
    assert.equal(instance.clusterFadeTransitions.size, 0);
  } finally {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  }
});

test('cluster collapse transitions move markers toward the cluster center while fading them out', () => {
  const marker = createMarkerRecord({ id: 'a', lon: 0, lat: 0 }, { fallbackId: 'a', order: 0, entityKeyPrefix: 'marker' });
  const instance = {
    clusterExpansionTransitions: new Map([
      [marker.entityKey, {
        marker,
        phase: 'exit',
        center: { lon: 5, lat: 0 },
        startTime: performance.now(),
        duration: 240
      }]
    ]),
    clusterFadeTransitions: new Map(),
    projectPoint(lon, lat) {
      return { x: lon, y: lat };
    },
    resolveMarkerStyle() {
      return { fill: '#000', stroke: '#fff', strokeWidth: 1, radius: 4, opacity: 1 };
    },
    drawMarkerVisual(transitionMarker, point, style, hitId) {
      this.lastGhost = { transitionMarker, point, style, hitId };
    }
  };

  GeoCanvas.prototype.drawMarkerClusterTransitionGhosts.call(instance, performance.now() + 120);

  assert.ok(instance.lastGhost.point.x > 0 && instance.lastGhost.point.x < 5);
  assert.ok(instance.lastGhost.style.opacity < 1 && instance.lastGhost.style.opacity > 0);
  assert.equal(instance.lastGhost.hitId, null);
});

test('buildPayload exposes resolved item tooltip content for template composition', () => {
  const payload = GeoCanvas.prototype.buildPayload.call({}, {
    type: 'marker',
    id: 'lisbon',
    layerId: 'cities',
    layerName: 'Cities',
    geometryType: 'Point',
    properties: { name: 'Lisbon' },
    data: {},
    region: null,
    layer: { id: 'cities', name: 'Cities' },
    source: null,
    tooltipBinding: 'Hello world'
  }, { x: 40, y: 50 }, null);

  assert.equal(payload.tooltipContent, 'Hello world');
  assert.equal(payload.tooltipHtml, 'Hello world');
});

test('buildPayload includes regionJoinId for polygon targets', () => {
  const payload = GeoCanvas.prototype.buildPayload.call({}, {
    type: 'polygon',
    id: 'rhode-island',
    regionJoinId: 'RI',
    layerId: 'states',
    layerName: 'States',
    geometryType: 'Polygon',
    properties: { name: 'Rhode Island' },
    data: {},
    region: null,
    layer: { id: 'states', name: 'States' },
    source: null
  }, { x: 12, y: 24 }, null);

  assert.equal(payload.regionJoinId, 'RI');
});

test('region presentation helpers style empty regions and disable their interactivity', () => {
  const filledFeature = {
    kind: 'polygon',
    region: { title: 'Portugal' },
    layerRegionStyle: normalizeRegionStyleOptions({
      defaultFill: '#2a9d8f',
      defaultStroke: '#ffffff',
      emptyFill: '#e5e7eb',
      emptyInteractive: false
    })
  };
  const emptyFeature = {
    kind: 'polygon',
    region: null,
    layerRegionStyle: filledFeature.layerRegionStyle
  };

  assert.deepEqual(resolveRegionPresentationStyle(filledFeature), {
    fill: '#2a9d8f',
    stroke: '#ffffff'
  });
  assert.deepEqual(resolveRegionPresentationStyle(emptyFeature), {
    fill: '#e5e7eb',
    cursor: 'default'
  });
  assert.equal(isFeatureInteractive(filledFeature), true);
  assert.equal(isFeatureInteractive(emptyFeature), false);
});

test('createTooltipHtml uses render callback when present', () => {
  const tooltip = normalizeTooltipOptions({
    enabled: true,
    template: '{name}',
    render(payload) {
      return `<em>${payload.properties.name}</em>`;
    }
  });
  assert.equal(createTooltipHtml(tooltip, { properties: { name: 'Lisbon' }, data: {} }), '<em>Lisbon</em>');
});

test('createTooltipHtml wraps resolved item tooltip content when the template references tooltipContent', () => {
  const tooltip = normalizeTooltipOptions({
    enabled: true,
    template: 'XXX {tooltipContent} XXX'
  });

  assert.equal(createTooltipHtml(tooltip, {
    properties: { name: 'Lisbon' },
    data: {},
    tooltipContent: 'Hello world',
    tooltipHtml: 'Hello world'
  }), 'XXX Hello world XXX');
});

test('interactive-fixed tooltip persistence depends on hover or focus', () => {
  assert.equal(shouldPersistTooltip('follow', true, false), false);
  assert.equal(shouldPersistTooltip('interactive-fixed', true, false), true);
  assert.equal(shouldPersistTooltip('interactive-fixed', false, true), true);
  assert.equal(shouldPersistTooltip('interactive-fixed', false, false), false);
});

test('projection helpers normalize names and produce finite coordinates', () => {
  const names = ['fit', 'mercator', 'albers', 'albers-usa', 'albers-usa-territories', 'portugal-composite', 'spain-composite', 'france-composite', 'equal-earth', 'miller', 'natural-earth-1', 'globe'];

  names.forEach((name) => {
    const projection = createProjection(name);
    const point = projection.forward(-9.1393, 38.7223);
    assert.equal(normalizeProjectionName(name), name);
    assert.ok(Number.isFinite(point.x));
    assert.ok(Number.isFinite(point.y));
  });

  assert.equal(normalizeProjectionName('AlbersUSA'), 'albers-usa');
  assert.equal(normalizeProjectionName('geo-albers-usa-territories'), 'albers-usa-territories');
  assert.equal(normalizeProjectionName('PortugalComposite'), 'portugal-composite');
  assert.equal(normalizeProjectionName('conic-conformal-spain'), 'spain-composite');
  assert.equal(normalizeProjectionName('FranceComposite'), 'france-composite');
});

test('invertProjection round-trips mercator, albers, and globe points closely', () => {
  const mercator = createProjection('mercator');
  const point = mercator.forward(-9.1393, 38.7223);
  const restored = invertProjection(mercator, point.x, point.y);
  assert.ok(Math.abs(restored.lon + 9.1393) < 1e-6);
  assert.ok(Math.abs(restored.lat - 38.7223) < 1e-6);

  const albers = createProjection('albers');
  const albersPoint = albers.forward(12.5, 41.9);
  const albersRestored = invertProjection(albers, albersPoint.x, albersPoint.y);
  assert.ok(Math.abs(albersRestored.lon - 12.5) < 1e-5);
  assert.ok(Math.abs(albersRestored.lat - 41.9) < 1e-5);

  const albersUsa = createProjection('albers-usa');
  const alaskaPoint = albersUsa.forward(-149.9, 61.2);
  const alaskaRestored = invertProjection(albersUsa, alaskaPoint.x, alaskaPoint.y);
  assert.ok(Math.abs(alaskaRestored.lon + 149.9) < 0.5);
  assert.ok(Math.abs(alaskaRestored.lat - 61.2) < 0.5);

  const albersUsaTerritories = createProjection('albers-usa-territories');
  const guamPoint = albersUsaTerritories.forward(144.8, 13.5);
  const guamRestored = invertProjection(albersUsaTerritories, guamPoint.x, guamPoint.y);
  assert.ok(Math.abs(guamRestored.lon - 144.8) < 0.5);
  assert.ok(Math.abs(guamRestored.lat - 13.5) < 0.5);

  const portugalComposite = createProjection('portugal-composite');
  const azoresPoint = portugalComposite.forward(-28.0, 38.6);
  const azoresRestored = invertProjection(portugalComposite, azoresPoint.x, azoresPoint.y);
  assert.ok(Math.abs(azoresRestored.lon + 28.0) < 0.5);
  assert.ok(Math.abs(azoresRestored.lat - 38.6) < 0.5);

  const spainComposite = createProjection('spain-composite');
  const canaryPoint = spainComposite.forward(-15.5, 28.1);
  const canaryRestored = invertProjection(spainComposite, canaryPoint.x, canaryPoint.y);
  assert.ok(Math.abs(canaryRestored.lon + 15.5) < 0.5);
  assert.ok(Math.abs(canaryRestored.lat - 28.1) < 0.5);

  const franceComposite = createProjection('france-composite');
  const reunionPoint = franceComposite.forward(55.5, -21.1);
  const reunionRestored = invertProjection(franceComposite, reunionPoint.x, reunionPoint.y);
  assert.ok(Math.abs(reunionRestored.lon - 55.5) < 0.75);
  assert.ok(Math.abs(reunionRestored.lat + 21.1) < 0.75);

  const globe = createProjection('globe');
  globe.setCenter({ lon: 0, lat: 20 });
  const globePoint = globe.forward(15, 35);
  const globeRestored = invertProjection(globe, globePoint.x, globePoint.y);
  assert.ok(Math.abs(globeRestored.lon - 15) < 1e-5);
  assert.ok(Math.abs(globeRestored.lat - 35) < 1e-5);
});

test('country composite projections fit sample datasets inside viewport padding', () => {
  const portugalEntries = normalizeGeoJSON(JSON.parse(fs.readFileSync(new URL('./fixtures/portugal-admin2.json', import.meta.url), 'utf8')));
  const spainEntries = normalizeGeoJSON(JSON.parse(fs.readFileSync(new URL('./fixtures/spain-admin0.json', import.meta.url), 'utf8')));
  const franceEntries = normalizeGeoJSON(JSON.parse(fs.readFileSync(new URL('./fixtures/france-admin2.json', import.meta.url), 'utf8')));

  const portugalBounds = computeFittedScreenBounds(portugalEntries, 'portugal-composite');
  const spainBounds = computeFittedScreenBounds(spainEntries, 'spain-composite');
  const franceBounds = computeFittedScreenBounds(franceEntries, 'france-composite');

  [portugalBounds, spainBounds, franceBounds].forEach((bounds) => {
    assert.ok(bounds.minX >= 15.9);
    assert.ok(bounds.minY >= 15.9);
    assert.ok(bounds.maxX <= 1184.1);
    assert.ok(bounds.maxY <= 684.1);
    assert.ok(bounds.height >= 667.5);
  });

  assert.ok(portugalBounds.width >= 900);
  assert.ok(spainBounds.width >= 640);
  assert.ok(franceBounds.width >= 700);
});

test('globe helpers wrap longitude and hide the back hemisphere', () => {
  assert.equal(wrapLongitude(190), -170);
  assert.equal(wrapLongitude(-181), 179);
  assert.equal(isGlobeProjection(createProjection('globe')), true);

  const center = { lon: 0, lat: 0 };
  assert.ok(orthographicVisibility(0, 0, center) > 0.99);
  assert.ok(orthographicVisibility(180, 0, center) < -0.99);

  const front = orthographicForward(20, 10, center);
  const back = orthographicForward(200, 0, center);
  assert.equal(front.visible, true);
  assert.equal(back.visible, false);

  const restored = orthographicInverse(front.x, front.y, center);
  assert.ok(Math.abs(restored.lon - 20) < 1e-5);
  assert.ok(Math.abs(restored.lat - 10) < 1e-5);
  assert.equal(orthographicInverse(2, 0, center), null);
});

test('globe line and polygon clipping keep only the visible hemisphere', () => {
  const center = { lon: 0, lat: 0 };
  const lineSegments = projectGlobeLineCoordinates([[-40, 0], [0, 0], [140, 0]], center);
  assert.equal(lineSegments.length, 1);
  assert.ok(lineSegments[0].length >= 2);
  assert.equal(hasProjectedGeometry(lineSegments), true);

  const ring = projectGlobePolygonRing([[-20, -20], [20, -20], [20, 20], [-20, 20], [-20, -20]], center);
  assert.ok(ring.length >= 4);
  ring.forEach((point) => {
    assert.ok(Math.hypot(point[0], point[1]) <= 1.000001);
  });
});

test('globe geodesic lines are sampled more densely than raw polylines', () => {
  const center = { lon: 45, lat: 20 };
  const polyline = projectGlobeLineCoordinates([[0, 0], [90, 45]], center, { pathMode: 'polyline' });
  const geodesic = projectGlobeLineCoordinates([[0, 0], [90, 45]], center, { pathMode: 'geodesic' });

  assert.equal(polyline.length, 1);
  assert.equal(geodesic.length, 1);
  assert.ok(geodesic[0].length > polyline[0].length);
});

test('globe polygon clipping follows the limb arc instead of closing with a flat chord', () => {
  const center = { lon: 0, lat: 0 };
  const ring = projectGlobePolygonRing([
    [-160, 50],
    [-20, 50],
    [20, 50],
    [160, 50],
    [160, 85],
    [-160, 85],
    [-160, 50]
  ], center);

  assert.ok(ring.length > 5);
  assert.ok(ring.some((point) => point[1] > 0.95));
  ring.forEach((point) => {
    assert.ok(Math.hypot(point[0], point[1]) <= 1.000001);
  });
});

test('projectFeatureEntries caches projected coordinates that differ by projection', () => {
  const entries = normalizeGeoJSON({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'world-box',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-10, 20], [10, 20], [10, 40], [-10, 40], [-10, 20]]]
        }
      }
    ]
  });

  const fitEntries = projectFeatureEntries(entries, createProjection('fit'));
  const mercatorEntries = projectFeatureEntries(entries, createProjection('mercator'));

  assert.notDeepEqual(fitEntries[0].projectedCoordinates, mercatorEntries[0].projectedCoordinates);
});

test('camera easing starts fast and slows near the end', () => {
  const from = { zoom: 1, center: { lon: 0, lat: 0 } };
  const to = { zoom: 3, center: { lon: 20, lat: 10 } };
  const early = easeOutCubic(0.25);
  const late = easeOutCubic(0.75);
  const earlyView = interpolateView(from, to, early);
  const lateView = interpolateView(from, to, late);

  assert.ok(early > 0.25);
  assert.ok(late < 1);
  assert.ok((1 - late) < early);
  assert.ok(earlyView.zoom > 1.5);
  assert.ok(lateView.zoom < 3);
  assert.ok(easeInOutCubic(0.5) > 0 && easeInOutCubic(0.5) < 1);
});

test('camera transform helpers interpolate scale and translation linearly', () => {
  const viewportCenter = { x: 200, y: 100 };
  const fromAnchor = { x: 10, y: 20 };
  const toAnchor = { x: 50, y: 60 };
  const fromTransform = {
    zoom: 1,
    translation: getCameraTranslation(fromAnchor, viewportCenter, 1)
  };
  const toTransform = {
    zoom: 3,
    translation: getCameraTranslation(toAnchor, viewportCenter, 3)
  };
  const mid = interpolateCameraTransform(fromTransform, toTransform, 0.5);

  assert.equal(mid.zoom, 2);
  assert.deepEqual(mid.translation, {
    x: (fromTransform.translation.x + toTransform.translation.x) / 2,
    y: (fromTransform.translation.y + toTransform.translation.y) / 2
  });
});

test('animated camera interpolation follows a straight screen-space path when anchors are available', () => {
  const projection = createProjection('mercator');
  const baseTransform = createFitTransform({ minX: -2, minY: -2, maxX: 2, maxY: 2 }, 400, 200, 0);
  const viewportCenter = { x: 200, y: 100 };
  const from = { zoom: 1, center: { lon: 0, lat: 10 } };
  const to = { zoom: 3, center: { lon: 0, lat: 60 } };
  const fromProjected = projection.forward(from.center.lon, from.center.lat);
  const toProjected = projection.forward(to.center.lon, to.center.lat);
  const state = {
    from,
    to,
    fromAnchor: baseTransform.project(fromProjected.x, fromProjected.y),
    toAnchor: baseTransform.project(toProjected.x, toProjected.y)
  };

  const geographicMidpoint = interpolateView(from, to, 0.5);
  const animatedMidpoint = interpolateAnimatedView(state, 0.5, projection, baseTransform, viewportCenter);
  const focusProjected = projection.forward(0, 30);
  const basePoint = baseTransform.project(focusProjected.x, focusProjected.y);
  const fromScreen = applyCameraTransform(basePoint, state.fromAnchor, viewportCenter, from.zoom);
  const toScreen = applyCameraTransform(basePoint, state.toAnchor, viewportCenter, to.zoom);
  const animatedAnchor = baseTransform.project(
    projection.forward(animatedMidpoint.center.lon, animatedMidpoint.center.lat).x,
    projection.forward(animatedMidpoint.center.lon, animatedMidpoint.center.lat).y
  );
  const animatedScreen = applyCameraTransform(basePoint, animatedAnchor, viewportCenter, animatedMidpoint.zoom);

  assert.equal(animatedMidpoint.zoom, 2);
  assert.equal(animatedMidpoint.center.lon, 0);
  assert.ok(animatedMidpoint.center.lat > geographicMidpoint.center.lat);
  assert.ok(animatedMidpoint.center.lat < to.center.lat);
  assert.ok(Math.abs(animatedScreen.x - (fromScreen.x + toScreen.x) / 2) < 1e-6);
  assert.ok(Math.abs(animatedScreen.y - (fromScreen.y + toScreen.y) / 2) < 1e-6);
});

test('globe animated interpolation follows the shortest spherical rotation path', () => {
  const globe = createProjection('globe');
  const state = {
    from: { zoom: 1.5, center: { lon: 170, lat: 12 } },
    to: { zoom: 4, center: { lon: -170, lat: 12 } }
  };

  const animatedMidpoint = interpolateAnimatedView(state, 0.5, globe, null, null);

  assert.equal(animatedMidpoint.zoom, 2.75);
  assert.ok(Math.abs(animatedMidpoint.center.lon) > 170);
  assert.ok(Math.abs(animatedMidpoint.center.lon) <= 180);
  assert.ok(Math.abs(animatedMidpoint.center.lat - 12.179633) < 1e-3);
});

test('measureViewportSize prefers container dimensions and falls back safely', () => {
  const container = {
    getBoundingClientRect() {
      return { width: 640.4, height: 360.2 };
    }
  };
  const canvas = {
    getBoundingClientRect() {
      return { width: 400, height: 220 };
    }
  };

  assert.deepEqual(measureViewportSize(container, canvas, 800, 480), { width: 640, height: 360 });
  assert.deepEqual(measureViewportSize(null, canvas, 800, 480), { width: 400, height: 220 });
  assert.deepEqual(measureViewportSize(null, null, 800, 480), { width: 800, height: 480 });
});
