export const MAP_CENTER = [-21.448585165760434, 47.100690714078723];
export const MAP_ZOOM = 13;

export const ICON_CONFIG = {
  treatment: {
    url: '/icons/water-treatment.png',
    size: [24, 24]
  },
  reservoir: {
    url: '/icons/water-tank.svg',
    size: [24, 24]
  },
  borne_fontaine: {
    url: '/icons/emergency.png',
    size: [15, 15]
  },
  noeud: {
    url: '/icons/junction.png',
    size: [12, 12]
  },
  vanne: {
    url: '/icons/valve.png',
    size: [15, 15]
  },
  pompe: {
    url: '/icons/water-pump.png',
    size: [20, 20]
  }
};

export const LAYER_TYPES = {
  REGION: 'region',
  DISTRICT: 'district',
  COMMUNE: 'commune',
  QUARTIER: 'quartier',
  QUARTIER_ORCHA: 'quartier_orcha',
  FOKOTANY: 'fokotany',
  ZONE_COMMERCIALE: 'zone_commerciale',
  RESEAU: 'reseau',
  RESEAU_D3: 'reseau_d3', // For D3.js flow visualization
  STATION_TRAITEMENT: 'station_traitement',
  RESERVOIR: 'reservoir',
  BORNE_FONTAINE: 'borne_fontaine',
  NOEUD: 'noeud',
  VANNE: 'vanne',
  POMPE: 'pompe',
  CONDUITE_AMENEE: 'conduite_amenee',
  SOURCE: 'source',
  CAPTAGE: 'captage',
  SECTEUR_DIST: 'secteur_distribution',
  HEATMAP: 'heatmap',
};

export const GEOJSON_PATHS = {
  [LAYER_TYPES.REGION]: '/geoJson/adm/gadm41_MDG_1.geojson',
  [LAYER_TYPES.DISTRICT]: '/geoJson/adm/gadm41_MDG_2.geojson',
  [LAYER_TYPES.COMMUNE]: [
    '/geoJson/adm/gadm41_MDG_3.geojson',
    '/geoJson/sahambavy/limite_commune.geojson'
  ],
  [LAYER_TYPES.QUARTIER]: '/geoJson/adm/gadm41_MDG_4.geojson',
  [LAYER_TYPES.QUARTIER_ORCHA]: '/geoJson/adm/fokotany_haute_matsiatra.geojson',
  [LAYER_TYPES.ZONE_COMMERCIALE]: '/geoJson/jirama/zone_commerciale_jirama.geojson',
  [LAYER_TYPES.FOKOTANY]: [
    '/geoJson/sahambavy/limite_fkt.geojson',
    '/geoJson/jirama/fokotany_jirama.geojson'
  ],
  [LAYER_TYPES.RESEAU]: [
    '/geoJson/jirama/reseau_fianarantsoa.geojson',
    // '/geoJson/sahambavy/reseaux.geojson'
    '/geoJson/sahambavy/reseaux_finale.geojson'
  ],
  // [LAYER_TYPES.RESEAU]: '/geoJson/jirama/reseau_fianarantsoa_distribution.geojson',
  [LAYER_TYPES.STATION_TRAITEMENT]: [
    '/geoJson/jirama/reseau_fianarantsoa_VO_st_traitement.geojson',
    '/geoJson/sahambavy/station_traitement.geojson'
  ],
  [LAYER_TYPES.RESERVOIR]: [
    '/geoJson/jirama/reseau_fianarantsoa_VO_reservoir.geojson',
    '/geoJson/sahambavy/reservoir.geojson'
  ],
  [LAYER_TYPES.BORNE_FONTAINE]: [
    '/geoJson/jirama/reseau_fianarantsoa_VO_borne_fontaine.geojson',
    '/geoJson/sahambavy/borne_fontaine.geojson'
  ],
  // [LAYER_TYPES.NOEUD]: '/geoJson/jirama/reseau_fianarantsoa_VO_noeuds.geojson',
  [LAYER_TYPES.NOEUD]: [
    '/geoJson/jirama/reseau_fianarantsoa_VO_noeuds_with_id.geojson',
    '/geoJson/sahambavy/noeuds.geojson'
  ],
  [LAYER_TYPES.VANNE]: [
    '/geoJson/jirama/reseau_fianarantsoa_VO_vannes.geojson',
    '/geoJson/sahambavy/vanne.geojson'
  ],
  [LAYER_TYPES.POMPE]: '/geoJson/jirama/reseau_fianarantsoa_VO_pompes.geojson',
  [LAYER_TYPES.CONDUITE_AMENEE]: '/geoJson/jirama/reseau_fianarantsoa_VO_conduite_amenee.geojson',
  [LAYER_TYPES.SOURCE]: [
    '/geoJson/jirama/reseau_fianarantsoa_VO_sources.geojson',
    '/geoJson/sahambavy/source.geojson'
  ],
  [LAYER_TYPES.CAPTAGE]: [
    '/geoJson/jirama/reseau_fianarantsoa_VO_captages.geojson',
    '/geoJson/sahambavy/captages.geojson'
  ],
  [LAYER_TYPES.SECTEUR_DIST]: '/geoJson/jirama/reseau_fianarantsoa_VO_secteurs.geojson',
  
};