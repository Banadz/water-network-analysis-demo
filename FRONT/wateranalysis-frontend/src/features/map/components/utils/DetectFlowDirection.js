export function detectFlowDirection(coords, props, nodeIndex, sourceSinkSets, nodeDegree) {
  const normalizeId = (id) => id ? String(id).trim().toUpperCase() : null;
  const startId = normalizeId(props["Noeud 1"]);
  const endId   = normalizeId(props["Noeud 2"]);

  const nodeStart = startId ? nodeIndex.byId.get(startId) : null;
  const nodeEnd   = endId   ? nodeIndex.byId.get(endId)   : null;

    // --- 1. Priority equipements ---
    if (nodeStart && sourceSinkSets.sources.has(nodeStart.id)) {
        return coords; // normal direction (outgoing)
    }
    if (nodeEnd && sourceSinkSets.sources.has(nodeEnd.id)) {
        return [...coords].reverse(); // reverse
    }
    if (nodeStart && sourceSinkSets.sinks.has(nodeStart.id)) {
        return [...coords].reverse(); // must end on this sink
    }
    if (nodeEnd && sourceSinkSets.sinks.has(nodeEnd.id)) {
        return coords; // normal order
    }

    // terminus by degree
    if (nodeStart && nodeDegree.get(nodeStart.id) === 1) {
        return [...coords].reverse(); // direction must go toward it
    }
    if (nodeEnd && nodeDegree.get(nodeEnd.id) === 1) {
        return coords; // direction must go toward it → normal order
    }

    // --- 2. If no priority works → compare elevations ---
  
    if (nodeStart?.elev != null && nodeEnd?.elev != null) {
      if (nodeStart.elev < nodeEnd.elev) {
      // start lower → reverse
        return [...coords].reverse();
      }
    }


  // --- 3. Fallback ---
  return coords;
        
}

export function findNearestOuvrage([x, y], nodes, tol = 0.00005) {
  let best = null;
  let bestDist = Infinity;
  for (const n of nodes) {
    const dx = n.x - x;
    const dy = n.y - y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist && dist < tol * tol) {
      bestDist = dist;
      best = n;
    }
  }
  return best;
}

export function normalizeId (id){
    if (!id) return null;
    return String(id)
    .replace(/['"]/g, '') // remove quotes and apostrophes
    .trim()
    .toUpperCase(); // standardize case
};

export function buildNodeIndex(layers) {
  const byId = new Map();
  const byCoord = [];

  const sources = [
    { fc: layers?.noeud,               type: "NOEUD",            idKeys: ["ID_Noeud", "ID", "id", "ogc_fid"] },
    { fc: layers?.station_traitement,  type: "STATION",          idKeys: ["ID", "id", "ogc_fid"] },
    { fc: layers?.reservoir,           type: "RESERVOIR",        idKeys: ["ID", "id", "ogc_fid"] },
    { fc: layers?.borne_fontaine,      type: "BORNE_FONTAINE",   idKeys: ["ID", "id", "EntityHand", "ogc_fid"] },
    { fc: layers?.vanne,               type: "VANNE",            idKeys: ["ID", "id", "ogc_fid"] },
    { fc: layers?.pompe,               type: "POMPE",            idKeys: ["ID", "id", "ogc_fid"] },
  ];

  for (const { fc, type, idKeys } of sources) {
    if (!fc || !fc.features) continue;

    for (const f of fc.features) {
      // Find ID
      let rawId = null;
      for (const k of idKeys) {
        if (f.properties && f.properties[k] != null) {
          rawId = f.properties[k];
          break;
        }
      }
      const id = normalizeId(rawId);
      if (!id) continue;

      const elev = f.properties?.Elevation ?? f.properties?.ELEVATION ?? null;

      // Register in byId (if ID collision, keep the first)
      if (!byId.has(id)) {
        const node = { id, type, elev, feature: f };
        // Coordinates if Point
        if (f.geometry?.type === "Point" && Array.isArray(f.geometry.coordinates)) {
          const [x, y] = f.geometry.coordinates; // x=lon, y=lat
          node.x = x; node.y = y;
          byCoord.push({ id, type, x, y });
        }
        byId.set(id, node);
      }
    }
  }

  return { byId, byCoord };
}

export function classifySourcesSinks(nodeIndex) {
  const sources = new Set();
  const sinks = new Set();

  for (const [, n] of nodeIndex.byId) {
    if (n.type === "STATION" || n.type === "RESERVOIR") {
      sources.add(n.id);
    }
    if (n.type === "BORNE_FONTAINE") {
      sinks.add(n.id);
    }
  }
  return { sources, sinks };
}

export function computeNodeDegree(features) {
  const degree = new Map();

  features.forEach(f => {
    const startId = normalizeId(f.properties["Noeud 1"]);
    const endId   = normalizeId(f.properties["Noeud 2"]);

    if (startId) {
      degree.set(startId, (degree.get(startId) || 0) + 1);
    }
    if (endId) {
      degree.set(endId, (degree.get(endId) || 0) + 1);
    }
  });

  return degree;
}

// Returns the nearest node object by given coordinates,
export function findNearestByMeters([lon, lat], nodesArray = [], map, tolMeters = 10) {
  if (!map || !Array.isArray(nodesArray) || nodesArray.length === 0) return null;

  let best = null;
  let bestDist = Infinity;

  // Map.distance expects (lat, lon)
  const targetLatLng = [lat, lon];

  for (const n of nodesArray) {
    const dist = map.distance(targetLatLng, [n.y, n.x]); // returns meters
    if (dist < bestDist) {
      bestDist = dist;
      best = { ...n, _dist: dist };
    }
  }

  return bestDist <= tolMeters ? best : null;
}
