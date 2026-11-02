import { useState, useCallback } from 'react';

export const useGeoJSONImport = () => {
  const [importedLayers, setImportedLayers] = useState([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  // GeoJSON file validation 
  const validateGeoJSON = (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Format de fichier invalide');
    }

    if (data.type !== 'FeatureCollection' && data.type !== 'Feature') {
      throw new Error('Le fichier doit être un GeoJSON valide (FeatureCollection ou Feature)');
    }

    return true;
  };

  // Generate layer ID 
  const generateLayerId = () => {
    return `imported_layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Identify GeoJSON feature geometry type
  const detectGeometryType = (data) => {
    if (data.type === 'Feature') {
      return data.geometry?.type || 'Unknown';
    }
    
    if (data.type === 'FeatureCollection' && data.features && data.features.length > 0) {
      // check all geometry types in features
      const geometryTypes = new Set();
      data.features.forEach(feature => {
        if (feature.geometry && feature.geometry.type) {
          geometryTypes.add(feature.geometry.type);
        }
      });
      
      // if only one type
      if (geometryTypes.size === 1) {
        return Array.from(geometryTypes)[0];
      }

      // if multiple types (GeometryCollection)
      if (geometryTypes.size > 1) {
        return 'Mixed'; // Types mixtes
      }
    }
    
    return 'Unknown';
  };

  // generate layer style
  const getStyleByGeometryType = (geometryType) => {
    const styles = {
      Point: {
        color: '#ff7800',
        weight: 2,
        opacity: 1,
        fillColor: '#ff7800',
        fillOpacity: 0.8
      },
      MultiPoint: {
        color: '#ff7800',
        weight: 2,
        opacity: 1,
        fillColor: '#ff7800',
        fillOpacity: 0.8
      },
      LineString: {
        color: '#3388ff',
        weight: 3,
        opacity: 0.8,
        fillColor: 'transparent',
        fillOpacity: 0
      },
      MultiLineString: {
        color: '#3388ff',
        weight: 3,
        opacity: 0.8,
        fillColor: 'transparent',
        fillOpacity: 0
      },
      Polygon: {
        color: '#9b59b6',
        weight: 2,
        opacity: 0.8,
        fillColor: '#9b59b6',
        fillOpacity: 0.3
      },
      MultiPolygon: {
        color: '#9b59b6',
        weight: 2,
        opacity: 0.8,
        fillColor: '#9b59b6',
        fillOpacity: 0.3
      },
      Mixed: {
        color: '#34495e',
        weight: 2,
        opacity: 0.7,
        fillColor: '#34495e',
        fillOpacity: 0.3
      },
      Unknown: {
        color: '#95a5a6',
        weight: 2,
        opacity: 0.5,
        fillColor: '#95a5a6',
        fillOpacity: 0.2
      }
    };
    
    return styles[geometryType] || styles.Unknown;
  };

  // Import GeoJSON file
  const importGeoJSON = useCallback(async (file) => {
    setImporting(true);
    setError(null);

    try {
      // Verify file type
      if (!file.name.endsWith('.geojson') && !file.name.endsWith('.json')) {
        throw new Error('Le fichier doit être au format .geojson ou .json');
      }

      // read file content
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate GeoJSON
      validateGeoJSON(data);

      // Detect geometry type
      const geometryType = detectGeometryType(data);

      // Create a new layer
      const layerId = generateLayerId();
      const layerName = file.name.replace(/\.(geojson|json)$/i, '');

      const newLayer = {
        id: layerId,
        layerKey: layerId,
        name: layerName,
        category: 'imported',
        active: false,
        selected: true,
        data: data,
        fileName: file.name,
        importDate: new Date().toISOString(),
        featureCount: data.type === 'FeatureCollection' 
          ? data.features.length 
          : 1,
        geometryType: geometryType, // Detected geometry type
        style: getStyleByGeometryType(geometryType) // Style adapted to type
      };

      setImportedLayers(prev => [...prev, newLayer]);
      
      return {
        success: true,
        layer: newLayer
      };

    } catch (err) {
      const errorMessage = err.message || 'Error importing file';
      setError(errorMessage);
      console.error('Error importing GeoJSON:', err);

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setImporting(false);
    }
  }, []);

  // Import multiple GeoJSON file
  const importMultipleGeoJSON = useCallback(async (files) => {
    const results = [];
    
    for (const file of files) {
      const result = await importGeoJSON(file);
      results.push(result);
    }
    
    return results;
  }, [importGeoJSON]);

  // delete imported layer
  const removeImportedLayer = useCallback((layerId) => {
    setImportedLayers(prev => prev.filter(layer => layer.id !== layerId));
  }, []);

  // delete all imported layer
  const clearImportedLayers = useCallback(() => {
    setImportedLayers([]);
    setError(null);
  }, []);

  // update layer status
  const updateLayerStatus = useCallback((layerId, status) => {
    setImportedLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, ...status }
          : layer
      )
    );
  }, []);

  // get import stats
  const getImportStats = useCallback(() => {
    return {
      total: importedLayers.length,
      active: importedLayers.filter(l => l.active).length,
      selected: importedLayers.filter(l => l.selected).length,
      totalFeatures: importedLayers.reduce((sum, l) => sum + l.featureCount, 0)
    };
  }, [importedLayers]);

  // style sys
  const getLayerStyle = (layerType) => {
    const styles = {
      default: {
        color: '#3388ff',
        weight: 1,
        opacity: 0.7,
        fillColor: '#3388ff',
        fillOpacity: 0.2
      },
      MultiPolygon: {
        color: '#ff4444',
        weight: 2,
        opacity: 0.7,
        fillColor: '#ff4444',
        fillOpacity: 0.2
      },
      line: {
        color: '#00aa00',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0
      }
    };
    
    return styles[layerType] || styles.default;
  };

  return {
    importedLayers,
    importing,
    error,
    importGeoJSON,
    importMultipleGeoJSON,
    removeImportedLayer,
    clearImportedLayers,
    updateLayerStatus,
    getImportStats,
    getLayerStyle
  };
};