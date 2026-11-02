import { useState, useEffect, useCallback } from 'react';
import { fetchGeoJSONData } from '../services/geoJSONService';
import { GEOJSON_PATHS } from '../config/mapConfig';
import { featureCollection } from '@turf/helpers';

export const useMapLayers = () => {
  const [layers, setLayers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const loadLayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const layerPromises = Object.entries(GEOJSON_PATHS).map(async ([key, paths]) => {
        const urls = Array.isArray(paths) ? paths : [paths];

        const datas = await Promise.all(
          urls.map(async (path) => {
            try {
              return await fetchGeoJSONData(path);
            } catch (error) {
              console.error(`Failed to load layer ${key} from ${path}:`, error);
              return null;
            }
          })
        );

        // Merge into a single GeoJSON object
        const merged = featureCollection(
          datas.filter(Boolean).flatMap(d => d?.features || [])
        );

        return { key, data: merged };
      });

      const loadedLayers = await Promise.all(layerPromises);
      setLayers(
        loadedLayers.reduce((acc, { key, data }) => {
          acc[key] = data;
          return acc;
        }, {})
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLayers();
  }, [loadLayers]);

  return { layers, isLoading };
};