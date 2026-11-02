import  axiosClient  from './axiosClient';

let cache = null;
let cacheTimestamp = null;
let cacheKey = null;
const CACHE_DURATION = 5 * 60 * 1000;

export const heatmapService = {
  getConsumptionHeatmapData: async (dateRange = {}) => {
    const now = Date.now();
    const currentCacheKey = JSON.stringify(dateRange); //  cache key
    
    // check cache if same period
    if (cache && 
        cacheTimestamp && 
        cacheKey === currentCacheKey &&
        (now - cacheTimestamp) < CACHE_DURATION) {
      return cache;
    }

    const params = {};
    
    if (dateRange?.startDate) {
      params.startDate = dateRange.startDate;
    }
    if (dateRange?.endDate) {
      params.endDate = dateRange.endDate;
    }

    const response = await axiosClient.get('/eau-distribue/heatmap/by-zone', { params });
    
    // update period key
    cache = response.data;
    cacheTimestamp = now;
    cacheKey = currentCacheKey;
    
    return response.data;
  },
  
  clearCache: () => {
    cache = null;
    cacheTimestamp = null;
    cacheKey = null;
  }
};