import { useMemo } from 'react';
import { LAYER_TYPES } from '../../config/mapConfig';

// Layer label
const LAYER_LABELS = {
  [LAYER_TYPES.REGION]: "Regions",
  [LAYER_TYPES.DISTRICT]: "Districts",
  [LAYER_TYPES.COMMUNE]: "Municipalities",
  [LAYER_TYPES.QUARTIER]: "ADM Neighborhoods",
  [LAYER_TYPES.QUARTIER_ORCHA]: "ORCHA Neighborhoods",
  [LAYER_TYPES.ZONE_COMMERCIALE]: "Commercial areas",
  [LAYER_TYPES.FOKOTANY]: "Fokontany (local areas)",
  [LAYER_TYPES.RESEAU]: "Water networks",
  [LAYER_TYPES.STATION_TRAITEMENT]: "Treatment plants",
  [LAYER_TYPES.RESERVOIR]: "Reservoirs",
  [LAYER_TYPES.BORNE_FONTAINE]: "Public water taps",
  [LAYER_TYPES.NOEUD]: "Nodes",
  [LAYER_TYPES.VANNE]: "Valves",
  [LAYER_TYPES.POMPE]: "Pumps",
  [LAYER_TYPES.CONDUITE_AMENEE]: "Supply pipes",
  [LAYER_TYPES.SOURCE]: "Sources",
  [LAYER_TYPES.CAPTAGE]: "Water intakes",
  [LAYER_TYPES.SECTEUR_DIST]: "Distribution sectors",
  [LAYER_TYPES.RESEAU_D3]: "Water networks (D3 flow direction)",
  [LAYER_TYPES.HEATMAP]: "Consumption heatmap",
};

// layer groups
const LAYER_GROUPS = {
  "Networks & Pipes": [
    LAYER_TYPES.RESEAU_D3,
    LAYER_TYPES.CONDUITE_AMENEE,
    LAYER_TYPES.RESEAU,
  ],
  "Equipment": [
    LAYER_TYPES.STATION_TRAITEMENT,
    LAYER_TYPES.RESERVOIR,
    LAYER_TYPES.BORNE_FONTAINE,
    LAYER_TYPES.NOEUD,
    LAYER_TYPES.VANNE,
    LAYER_TYPES.POMPE,
  ],
  "Territories / Administration": [
    LAYER_TYPES.REGION,
    LAYER_TYPES.DISTRICT,
    LAYER_TYPES.COMMUNE,
    LAYER_TYPES.QUARTIER,
    LAYER_TYPES.QUARTIER_ORCHA, 
    LAYER_TYPES.FOKOTANY,
    LAYER_TYPES.ZONE_COMMERCIALE,
    LAYER_TYPES.SECTEUR_DIST,
  ],
  "Sources": [
    LAYER_TYPES.SOURCE,
    LAYER_TYPES.CAPTAGE,
  ],
  "Analytics": [
    LAYER_TYPES.HEATMAP,
  ]
};

const LayerControl = ({ activeLayers = [], onToggle, filterQuery = '' }) => {
  // normalize query
  const q = (filterQuery || '').toLowerCase().trim();

  // layer toggle
  const toggleLayer = (layerKey) => {
    const exists = activeLayers.includes(layerKey);
    let newLayers;
    if (exists) {
      newLayers = activeLayers.filter(k => k !== layerKey);
    } else {
      newLayers = [...activeLayers, layerKey];
    }
    if (typeof onToggle === 'function') onToggle(newLayers);
  };

  // layer group toggle
  const toggleGroup = (groupKeys) => {
    const allActive = groupKeys.every(k => activeLayers.includes(k));
    let newLayers;
    if (allActive) {
      newLayers = activeLayers.filter(k => !groupKeys.includes(k));
    } else {
      newLayers = Array.from(new Set([...activeLayers, ...groupKeys]));
    }
    if (typeof onToggle === 'function') onToggle(newLayers);
  };

  // layer groups filter
  const groupsToRender = useMemo(() => {
    const result = [];
    const lowerLabels = Object.fromEntries(Object.entries(LAYER_LABELS).map(([k, v]) => [k, v.toLowerCase()]));
    for (const [groupName, keys] of Object.entries(LAYER_GROUPS)) {
      const visibleKeys = keys.filter(k => {
        const label = lowerLabels[k] || '';
        return q === '' ? true : label.includes(q);
      }).filter(Boolean);
      if (visibleKeys.length) result.push({ groupName, keys: visibleKeys });
    }

    // others groups
    const groupedKeys = new Set(Object.values(LAYER_GROUPS).flat());
    const ungrouped = Object.keys(LAYER_LABELS)
      .filter(k => !groupedKeys.has(k))
      .filter(k => {
        const label = LAYER_LABELS[k].toLowerCase();
        return q === '' ? true : label.includes(q);
      });

    if (ungrouped.length) result.push({ groupName: 'Other', keys: ungrouped });

    return result;
  }, [q]);

  return (
    <div className="space-y-3">
      {groupsToRender.map(({ groupName, keys }) => {
        const allActive = keys.every(k => activeLayers.includes(k));
        return (
          <details key={groupName} className="bg-white border rounded">
            <summary className="px-3 py-2 flex items-center justify-between cursor-pointer">
              <span className="font-medium text-gray-700">{groupName}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => { e.preventDefault(); toggleGroup(keys); }}
                  className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  {allActive ? 'Disable all' : 'Enable all'}
                </button>
                <span className="text-xs text-gray-400">{keys.length}</span>
              </div>
            </summary>

            <div className="px-3 py-2 space-y-2">
              {keys.map(layerKey => (
                <label key={layerKey} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4"
                    checked={activeLayers.includes(layerKey)}
                    onChange={() => toggleLayer(layerKey)}
                  />
                  <span className="text-sm text-gray-700">{LAYER_LABELS[layerKey] || layerKey}</span>
                </label>
              ))}
            </div>
          </details>
        );
      })}

      {groupsToRender.length === 0 && (
        <div className="text-sm text-gray-400 italic p-3">No layers found</div>
      )}
    </div>
  );
};

export default LayerControl;
