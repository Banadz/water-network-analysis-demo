import { useCallback, useMemo } from 'react';
import { LAYER_TYPES } from '../config/mapConfig';

export const useMapStyles = () => {
  const getColor = useCallback((name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return '#' + (hash & 0x00ffffff).toString(16).padStart(6, '0');
  }, []);

  const layerStyles = useMemo(() => ({
    baseStyle: {
      color: 'black',
      weight: 0.5
    },
    [LAYER_TYPES.REGION]: (feature) => ({
      fillColor: getColor(feature.properties.NAME_1),
      fillOpacity: 0.3
    }),
    [LAYER_TYPES.DISTRICT]: (feature) => ({
        fillColor: getColor(feature.properties.NAME_2),
        fillOpacity: 0.4,
        weight: 0.8
      }),
    [LAYER_TYPES.COMMUNE]: (feature) => ({
      fillColor: getColor(feature.properties.NAME_3),
      fillOpacity: 0.5,
      weight: 0.6
    }),
    [LAYER_TYPES.QUARTIER]: (feature) => ({
      fillColor: getColor(feature.properties.NAME_4),
      fillOpacity: 0.5,
      weight: 0.5
    }),
    [LAYER_TYPES.QUARTIER_ORCHA]: (feature) => ({
      fillColor: getColor(feature.properties.ADM4_EN),
      fillOpacity: 0.5,
      weight: 0.5
    }),
    [LAYER_TYPES.ZONE_COMMERCIALE]: (feature) => ({
      fillColor: getColor(feature.properties.id + " " + feature.properties.id),
      fillOpacity: 0.6,
      weight: 0.5
    }),
    [LAYER_TYPES.FOKOTANY]: (feature) => ({
      fillColor: getColor(feature.properties.LIB_FKT),
      fillOpacity: 0.5,
      weight: 0.5
    }),
    [LAYER_TYPES.RESEAU]: {
      color: 'blue',
      weight: 0.8,
    },
    [LAYER_TYPES.STATION_TRAITEMENT]: {
      color: 'black',
      weight: 1,
      fillColor: getColor('Station de traitement'),
      fillOpacity: 0.8
    },
    [LAYER_TYPES.RESERVOIR]: {
      color: 'black',
      weight: 1,
      fillColor: getColor('Réservoir'),
      fillOpacity: 0.8
    },
    [LAYER_TYPES.BORNE_FONTAINE]: {
      color: 'red',
      weight: 1
    },
    [LAYER_TYPES.NOEUD]: {
      color: 'Orange',
      weight: 1
    },
    [LAYER_TYPES.VANNE]: {
      color: 'green',
      weight: 1
    },
    [LAYER_TYPES.POMPE]: {
      color: 'gray',
      weight: 1
    },
    [LAYER_TYPES.CONDUITE_AMENEE]: {
      color: 'red',
      weight: 1,
    },
    [LAYER_TYPES.SOURCE]: (feature) => ({
      fillColor: '#6c29d8ff',
      fillOpacity: 0.9,
      weight: 0.5
    }),
    [LAYER_TYPES.CAPTAGE]: (feature) => ({
      fillColor: '#999999ff',
      color: '#000000ff',
      fillOpacity: 0.9,
      weight: 0.9
    }),
    [LAYER_TYPES.SECTEUR_DIST]: (feature) => ({
      fillColor: getColor(`SN` + feature.properties.id * feature.properties.id),
      fillOpacity: 0.5,
      weight: 1.2
    }),
  }), [getColor]);

  const onEachFeature = useCallback((layerType) => {
    const popupTemplates = {
      [LAYER_TYPES.REGION]: (feature) => `Région : ${feature.properties.NAME_1}`,
      [LAYER_TYPES.DISTRICT]: (feature) => `District : ${feature.properties.NAME_2}`,
      [LAYER_TYPES.COMMUNE]: (feature) => `Commune : ${feature.properties.NAME_3}`,
      [LAYER_TYPES.QUARTIER]: (feature) => `Quartier : ${feature.properties.NAME_4}`,
      [LAYER_TYPES.QUARTIER_ORCHA]: (feature) => `Fokotany : ${feature.properties.ADM4_EN}`,
      [LAYER_TYPES.ZONE_COMMERCIALE]: (feature) => `Zone commerciale : ${feature.properties.id}`,
      [LAYER_TYPES.FOKOTANY]: (feature) => `Fokotany : ${feature.properties.LIB_FKT}`,
      [LAYER_TYPES.RESEAU]: (feature) => {
        if (feature.properties && feature.properties.ID) {
          return `Réseau: ${feature.properties.ID}`;
        }
        return null;
      },
      [LAYER_TYPES.STATION_TRAITEMENT]: (feature) => `Station de traitement : ${feature.properties.ID}`,
      [LAYER_TYPES.RESERVOIR]: (feature) => `Réservoir : ${feature.properties.ID}`,
      [LAYER_TYPES.BORNE_FONTAINE]: (feature) => `Borne fontaine : ${feature.properties.Text}`,
      [LAYER_TYPES.NOEUD]: (feature) => `Noeud : ${feature.properties.ID_Noeud}`,
      [LAYER_TYPES.VANNE]: (feature) => `Vanne : ${feature.properties.ID}`,
      [LAYER_TYPES.POMPE]: (feature) => `Pompe : ${feature.properties.ID}`,
      [LAYER_TYPES.CONDUITE_AMENEE]: (feature) => {
        if (feature.properties && feature.properties.ID_1) {
          return `Conduite amenée: ${feature.properties.ID_1}`;
        }
        return null;
      },
      [LAYER_TYPES.SOURCE]: (feature) => `Source : ${feature.properties.ID}`,
      [LAYER_TYPES.CAPTAGE]: (feature) => `Captage : ${feature.properties.ID}`,
      [LAYER_TYPES.SECTEUR_DIST]: (feature) => `Secteur de distribution N°: ${feature.properties.id}`,
    };

    return (feature, layer) => {
      const content = popupTemplates[layerType](feature);
      if (content) layer.bindPopup(content);
    };
  }, []);

  return { layerStyles, onEachFeature, getColor };
};