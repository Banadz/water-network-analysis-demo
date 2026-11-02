import { forwardRef, useMemo, useCallback, useRef, useImperativeHandle, useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useMapLayers } from '../../hooks/useMapLayers';
import { useMapStyles } from '../../hooks/useMapStyles';
import { 
  MAP_CENTER, 
  MAP_ZOOM, 
  ICON_CONFIG, 
  LAYER_TYPES 
} from '../../config/mapConfig';
import D3FlowOverlay from './components/D3FlowOverlay';
import DrawControl from './components/utils/DrawControl';
import HeatmapLayer from './components/HeatmapLayer';
import { useHeatmapData } from '../../hooks/layer/useHeatmapData';
import { useGeoJSONImport } from '../../hooks/layer/useGeoJSONImport';
import ExportControl from './components/ExportControl';
import PropTypes from 'prop-types';

import DateControl from '../../components/heatmap/DateControl';

const MapView = forwardRef(({ activeLayers, onFeatureClick, onZoneClick, onZoneDelete }, ref) => {  
  const drawControlRef = useRef();
  const mapWrapperRef = useRef(null);
  const { layers } = useMapLayers();
  const { layerStyles } = useMapStyles();
  const { getLayerStyle } = useGeoJSONImport();

  const { 
    heatmapData, 
    loading, 
    error, 
    fetchHeatmapData, 
    clearHeatmapData,
    getDefaultDateRange 
  } = useHeatmapData();

  const [heatmapDateRange, setHeatmapDateRange] = useState(null);

  // 5 last year initialization (heatmap period)
  useEffect(() => {
    const defaultRange = getDefaultDateRange();
    setHeatmapDateRange(defaultRange);
  }, [getDefaultDateRange]);

  const isHeatmapActive = activeLayers.some(layer => layer.layerKey === LAYER_TYPES.HEATMAP);
  // Load data when layer is enabled or time period changes (heatmap)
  useEffect(() => {
    if (isHeatmapActive && !loading && heatmapDateRange) {
      fetchHeatmapData(heatmapDateRange);
    }
    
    if (!isHeatmapActive && heatmapData.length > 0) {
      clearHeatmapData();
    }
  }, [isHeatmapActive, heatmapData.length, loading, fetchHeatmapData, clearHeatmapData, heatmapDateRange]);
  
  const averageConsumption = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return 5000;
    
    let totalConsumption = 0;
    let count = 0;
    
    for (const zone of heatmapData) {
      if (zone.nombreHabitant && zone.nombreHabitant > 0) {
        const consumptionPerHabitant = zone.totalConsumption / zone.nombreHabitant;
        totalConsumption += consumptionPerHabitant;
        count++;
      }
    }
    
    return count > 0 ? totalConsumption / count : 5000;
  }, [heatmapData]);

  const maxConsumption = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return 10000;
    
    let max = 0;
    for (const zone of heatmapData) {
      if (zone.nombreHabitant && zone.nombreHabitant > 0) {
        const consumptionPerHabitant = zone.totalConsumption / zone.nombreHabitant;
        if (consumptionPerHabitant > max) {
          max = consumptionPerHabitant;
        }
      }
    }
    return max > 0 ? max * 1.1 : 10000;
  }, [heatmapData]);

  // update heamap period function
  const handleDateRangeChange = useCallback((newDateRange) => {
    setHeatmapDateRange(newDateRange);
  }, []);

  // Function to reload with current period
  const refreshWithCurrentDateRange = useCallback(() => {
    if (heatmapDateRange) {
      fetchHeatmapData(heatmapDateRange);
    }
  }, [heatmapDateRange, fetchHeatmapData]);

  const handlePolygonCreated = useCallback((polygonData) => {
    onZoneClick?.(polygonData);
  }, [onZoneClick]);

  const handlePolygonDeleted = useCallback((zoneId) => {
    onZoneDelete?.(zoneId);
  }, [onZoneDelete]);

  const icons = useMemo(() => ({
    treatment: new L.Icon({
      iconUrl: ICON_CONFIG.treatment.url,
      iconSize: ICON_CONFIG.treatment.size
    }),
    reservoir: new L.Icon({
      iconUrl: ICON_CONFIG.reservoir.url,
      iconSize: ICON_CONFIG.reservoir.size
    }),
    borne_fontaine: new L.Icon({
      iconUrl: ICON_CONFIG.borne_fontaine.url,
      iconSize: ICON_CONFIG.borne_fontaine.size
    }),
    noeud: new L.Icon({
      iconUrl: ICON_CONFIG.noeud.url,
      iconSize: ICON_CONFIG.noeud.size
    }),
    vanne: new L.Icon({
      iconUrl: ICON_CONFIG.vanne.url,
      iconSize: ICON_CONFIG.vanne.size
    }),
    pompe: new L.Icon({
      iconUrl: ICON_CONFIG.pompe.url,
      iconSize: ICON_CONFIG.pompe.size
    })
  }), []);

  useImperativeHandle(ref, () => ({
    removeZone: (zoneId) => {
      if (drawControlRef.current) {
        drawControlRef.current.removeZone(zoneId);
      }
    },
    clearAllZones: () => {
      if (drawControlRef.current) {
        drawControlRef.current.clearAllZones();
      }
    },
    getHeatmapData: () => ({
      data: heatmapData,
      loading,
      error,
      maxConsumption,
      averageConsumption,
      dateRange: heatmapDateRange
    }),
    refreshHeatmap: refreshWithCurrentDateRange,
    clearHeatmap: () => {
      clearHeatmapData();
    },
    setHeatmapDateRange: handleDateRangeChange,
    getCurrentDateRange: () => heatmapDateRange,
    getDefaultDateRange: () => getDefaultDateRange()
  }));

  const getMarkerRenderer = (type, icons) => {
    switch (type) {
      case LAYER_TYPES.STATION_TRAITEMENT:
        return (f, latlng) => L.marker(latlng, { icon: icons.treatment });
      case LAYER_TYPES.RESERVOIR:
        return (f, latlng) => L.marker(latlng, { icon: icons.reservoir });
      case LAYER_TYPES.BORNE_FONTAINE:
        return (f, latlng) => L.marker(latlng, { icon: icons.borne_fontaine });
      case LAYER_TYPES.NOEUD:
        return (f, latlng) => L.marker(latlng, { icon: icons.noeud });
      case LAYER_TYPES.VANNE:
        return (f, latlng) => L.marker(latlng, { icon: icons.vanne });
      case LAYER_TYPES.POMPE:
        return (f, latlng) => L.marker(latlng, { icon: icons.pompe });
      default:
        return undefined;
    }
  };

  return (
    <div ref={mapWrapperRef} className="relative h-full w-full">
      <MapContainer 
        center={MAP_CENTER} 
        zoom={MAP_ZOOM} 
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DrawControl
          ref={drawControlRef}
          onPolygonCreated={handlePolygonCreated}
          onPolygonDeleted={handlePolygonDeleted}
        />

      {(Array.isArray(activeLayers) ? activeLayers : []).map((layer) => {
        if (layer.category === 'imported') {
          return (
            <GeoJSON
              key={layer.id || layer.layerKey}
              data={layer.data}
              style={getLayerStyle(layer.styleType || 'default')}
              onEachFeature={(feature, layerInstance) => {
                layerInstance.on("click", () => {
                  const zoneId = feature.properties?.id || 
                                feature.properties?.ID ||
                                feature.properties?.NAME_1 ||
                                feature.properties?.NAME_2 ||
                                feature.properties?.NAME_3 ||
                                feature.properties?.NAME_4 ||
                                feature.properties?.C_FKT ||
                                feature.properties?.Id_FKT ||
                                feature.properties?.name || 
                                `${feature.id || Math.random()}`;
                  
                  const coordinates = feature.geometry.coordinates;
                  const newElement = {
                    zoneId,
                    coordinates
                  };
                  onZoneClick?.(newElement);
                });
                
                layerInstance.on("mouseover", function (e) {
                  this.setStyle({
                    weight: 4,
                    color: '#ff4444',
                    fillColor: '#ff4444',
                    fillOpacity: 0.4
                  });
                  this._path.style.cursor = 'pointer';
                });
                
                layerInstance.on("mouseout", function (e) {
                  this.setStyle(getLayerStyle(layer.styleType || 'default'));
                  this.closePopup();
                  this._path.style.cursor = '';
                });
              }}
              pointToLayer={(feature, latlng) => {
                return L.circleMarker(latlng, {
                  radius: 3,
                  fillColor: "#3388ff",
                  color: "#000",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
                });
              }}
            />
          );
        }

        return (
          <GeoJSON
            key={layer.layerKey}
            data={layers[layer.layerKey]}
            style={layerStyles[layer.layerKey]}
            onEachFeature={(feature, layerInstance) => {
              if (
                [
                  LAYER_TYPES.REGION,
                  LAYER_TYPES.DISTRICT,
                  LAYER_TYPES.COMMUNE,
                  LAYER_TYPES.QUARTIER,
                  LAYER_TYPES.ZONE_COMMERCIALE,
                  LAYER_TYPES.SECTEUR_DIST,
                  LAYER_TYPES.FOKOTANY,
                ].includes(layer.layerKey)
              ) {
                layerInstance.on("click", () => {
                  const zoneId =
                    feature.properties.id ||
                    feature.properties.ID ||
                    feature.properties.NAME_1 ||
                    feature.properties.NAME_2 ||
                    feature.properties.NAME_3 ||
                    feature.properties.NAME_4 ||
                    feature.properties.C_FKT ||
                    feature.properties.Id_FKT;
                  const coordinates = feature.geometry.coordinates;
                  const newElement = {zoneId, coordinates};
                  onZoneClick?.(newElement);
                });
              }
            }}
            pointToLayer={getMarkerRenderer(layer.layerKey, icons)}
          />
        );
      })}

      {activeLayers.some(layer => layer.layerKey === LAYER_TYPES.RESEAU_D3) && (
        layers[LAYER_TYPES.RESEAU] &&
        layers[LAYER_TYPES.NOEUD] && (
          <D3FlowOverlay 
            geoJsonData={layers[LAYER_TYPES.RESEAU]} 
            nodesData={layers[LAYER_TYPES.NOEUD]}
            equipementData={layers} 
            onFeatureClick={onFeatureClick}
          />
        )
      )}

      {loading && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.9)',
          padding: '8px 16px',
          borderRadius: 4,
          border: '1px solid #ddd'
        }}>
          📊 Loading heatmap data...
          {heatmapDateRange && (
            <div style={{fontSize: '10px', marginTop: '4px'}}>
              {new Date(heatmapDateRange.startDate).toLocaleDateString()} - {new Date(heatmapDateRange.endDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: '#fff2f0',
          padding: '8px 16px',
          borderRadius: 4,
          border: '1px solid #ffccc7',
          color: '#ff4d4f'
        }}>
          Error: {error}
        </div>
      )}

      {activeLayers.some(layer => layer.layerKey === LAYER_TYPES.HEATMAP) && heatmapData.length > 0 && (
        <>
          <HeatmapLayer
            data={heatmapData}
            radius={30}
            blur={15}
            max={maxConsumption}
            intensity={0.8}
          />
        </>
      )}

      {isHeatmapActive && heatmapDateRange && (
        <DateControl 
          onDateRangeChange={handleDateRangeChange}
          defaultRange={getDefaultDateRange()}
        />
      )}
    </MapContainer>

    <ExportControl
      mapContainerRef={mapWrapperRef}
      activeLayers={activeLayers}
      layers={layers}
    />
    </div>
  );
});

MapView.propTypes = {
  activeLayers: PropTypes.arrayOf(PropTypes.object).isRequired,
  onFeatureClick: PropTypes.func,
  onZoneClick: PropTypes.func,
  onZoneDelete: PropTypes.func,
};

export default MapView;