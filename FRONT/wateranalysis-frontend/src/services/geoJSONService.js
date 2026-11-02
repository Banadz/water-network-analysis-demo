export const fetchGeoJSONData = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching GeoJSON:', error);
      throw error;
    }
  };