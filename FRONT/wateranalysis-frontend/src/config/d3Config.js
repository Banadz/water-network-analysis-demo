import { MAP_CENTER, MAP_ZOOM } from './mapConfig';

export const d3Config = {
  // map config
  mapOptions: {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    maxZoom: 18,
    minZoom: 3,
  },
  tileLayer: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },

  // GeoJSON layer style
  styles: {
    regions: {
      fillColor: '#3388ff',
      fillOpacity: 0.2,
      color: '#3388ff',
      weight: 2
    },
    cities: {
      fillColor: '#ff7800',
      fillOpacity: 0.7,
      color: '#ff7800',
      weight: 1,
      radius: 5
    },
  },

  // default Projection
  projection: {
    scale: 1,
    translation: [0, 0]
  }
};