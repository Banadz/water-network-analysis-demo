import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';

// normalize ID
export function normalizeNodeId(id) {
  if (id == null) return null;
  return String(id).trim().replace(/'+/g, ''); // "EF36'" -> "EF36"
}

// Returns node IDs within a Polygon/MultiPolygon area
export function getNodeIdsInZone(nodesGeoJSON, zoneFeature) {
  if (!nodesGeoJSON?.features?.length || !zoneFeature?.geometry) return [];

  // 1) bbox filter
  const zoneBbox = bbox(zoneFeature);
  const zoneBboxPoly = bboxPolygon(zoneBbox);

  const candidates = nodesGeoJSON.features.filter((pt) =>
    booleanPointInPolygon(pt, zoneBboxPoly)
  );

  // 2) point in polygon test
  const inside = candidates.filter((pt) =>
    booleanPointInPolygon(pt, zoneFeature)
  );

  // 3) IDs Extraction
  return inside
    .map((pt) => normalizeNodeId(pt.properties?.ID_Noeud))
    .filter(Boolean);
}

export function getZoneLabel(feature) {
  const p = feature?.properties || {};
  return (
    p.id ||
    p.ID ||
    p.NAME_4 ||
    p.NAME_3 ||
    p.NAME_2 ||
    p.NAME_1 ||
    p.LIB_FKT ||
    p.ADM4_EN ||
    'Zone'
  );
}
