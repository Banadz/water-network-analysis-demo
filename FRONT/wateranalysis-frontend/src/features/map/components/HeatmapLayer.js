import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import centerOfMass from '@turf/center-of-mass';
import PropTypes from 'prop-types';

const HEATMAP_CONFIG = {
  DEFAULT_INTENSITY: 0.6,
  DEFAULT_RADIUS: 25,
  DEFAULT_BLUR: 15,
  MIN_OPACITY: 0.4,
  MAX_ZOOM: 18,
  GRADIENT: {
    0.0: '#000080', 0.1: '#0000FF', 0.2: '#0080FF', 0.3: '#00FFFF',
    0.4: '#00FF80', 0.5: '#00FF00', 0.6: '#80FF00', 0.7: '#FFFF00',
    0.8: '#FF8000', 0.9: '#FF4000', 1.0: '#FF0000'
  }
};

const HeatmapLayer = ({ 
  data, 
  intensity = HEATMAP_CONFIG.DEFAULT_INTENSITY, 
  radius = HEATMAP_CONFIG.DEFAULT_RADIUS, 
  blur = HEATMAP_CONFIG.DEFAULT_BLUR, 
  max = 4000
}) => {
  const map = useMap();
  const heatmapLayerRef = useRef(null);
  const heatPoints = useMemo(() => {
    if (!data || data.length === 0) return [];

    const points = [];
    
    for (const zone of data) {
      try {
        const geometry = typeof zone.geometry === 'string' 
          ? JSON.parse(zone.geometry) 
          : zone.geometry;

        if (!geometry?.coordinates) continue;

        const center = centerOfMass({
          type: 'Feature',
          properties: {},
          geometry
        });

        const [lng, lat] = center.geometry.coordinates;

        // check coordonates
        if (typeof lat !== 'number' || typeof lng !== 'number' ||
            lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          continue;
        }

        // optimize intensity
        const nbHabitant = zone.nombreHabitant || 0;
        const consumption = zone.totalConsumption || 0;
        const consumptionPerHabitant = nbHabitant > 0 ? consumption / nbHabitant : 0;
        
        const normalizedIntensity = Math.max(0.1, 
          Math.min(1.0, Math.pow((consumptionPerHabitant / max), 0.5) * intensity)
        );

        points.push([lat, lng, normalizedIntensity]);
      } catch (error) {
        console.warn('Erreur traitement zone:', zone.zoneId, error);
      }
    }

    return points;
  }, [data, max, intensity]);

  useEffect(() => {
    if (!heatPoints.length) return;

    // Nettoyage propre
    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
    }

    try {
      heatmapLayerRef.current = L.heatLayer(heatPoints, {
        radius: radius,
        blur: blur,
        maxZoom: HEATMAP_CONFIG.MAX_ZOOM,
        minOpacity: HEATMAP_CONFIG.MIN_OPACITY,
        gradient: HEATMAP_CONFIG.GRADIENT
      }).addTo(map);
    } catch (error) {
      console.error('Erreur création heatmap:', error);
    }

    return () => {
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
    };
  }, [heatPoints, radius, blur, map]);

  return null;
};

HeatmapLayer.propTypes = {
  data: PropTypes.array.isRequired,
  intensity: PropTypes.number,
  radius: PropTypes.number,
  blur: PropTypes.number,
  max: PropTypes.number,
};

export default HeatmapLayer;