import { useState, useCallback, useRef, useEffect } from 'react';
import { heatmapService } from '../../services/api/heatmapService';

export const useHeatmapData = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const lastRequestRef = useRef(null);
  const heatmapDataRef = useRef(heatmapData);

  useEffect(() => {
    heatmapDataRef.current = heatmapData;
  }, [heatmapData]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getDefaultDateRange = useCallback(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }, []);

  const fetchHeatmapData = useCallback(async (dateParams = {}) => {
    if (!isMountedRef.current) return null;

    // use inserted period or last 5 year (default period)
    const finalDateRange = Object.keys(dateParams).length > 0 
      ? dateParams 
      : getDefaultDateRange();
    
    const requestKey = JSON.stringify(finalDateRange);
    
    if (lastRequestRef.current === requestKey && heatmapDataRef.current.length > 0) {
      return heatmapDataRef.current;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await heatmapService.getConsumptionHeatmapData(finalDateRange);
      if (isMountedRef.current) {
        setHeatmapData(data);
        lastRequestRef.current = requestKey;
      }
      return data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load heatmap data');
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [getDefaultDateRange]);

  const clearHeatmapData = useCallback(() => {
    setHeatmapData([]);
    setError(null);
    lastRequestRef.current = null;
    heatmapService.clearCache(); // Nettoyer le cache quand on efface les données
  }, []);

  return {
    heatmapData,
    loading,
    error,
    fetchHeatmapData,
    clearHeatmapData,
    getDefaultDateRange
  };
};