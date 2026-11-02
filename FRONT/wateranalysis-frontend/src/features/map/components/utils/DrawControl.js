import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

// deafault style for drawn shapes
const defaultStyle = {
  color: '#3388ff',
  weight: 2,
  opacity: 1,
  fillColor: '#3388ff',
  fillOpacity: 0.2
};

const DrawControl = forwardRef(({ onPolygonCreated, onPolygonDeleted }, ref) => {
  const map = useMap();
  const polygonCounter = useRef(1);
  const drawnItemsRef = useRef(null);
  const drawControlRef = useRef(null);
  const layersMapRef = useRef(new Map()); // Map zoneId -> layer
  const zoneIdsMapRef = useRef(new Map()); // Map layer -> zoneId
  
  // Initialize FeatureGroup only once
  useEffect(() => {
    if (!map) return;
    
    // Create FeatureGroup if it doesn't exist
    if (!drawnItemsRef.current) {
      drawnItemsRef.current = new L.FeatureGroup();
      console.log('FeatureGroup created');
    }
    
    // Add to map if not already added
    map.addLayer(drawnItemsRef.current);
    console.log('FeatureGroup added to map');
    
    return () => {
      // Only remove control on unmount, keep the FeatureGroup
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
    };
  }, [map]);

  // expose method by ref
  useImperativeHandle(ref, () => ({
    removeZone: (zoneId) => {
      const layer = layersMapRef.current.get(zoneId);
      if (layer && drawnItemsRef.current) {
        drawnItemsRef.current.removeLayer(layer);
        layersMapRef.current.delete(zoneId);
        zoneIdsMapRef.current.delete(layer);
      }
    },
    clearAllZones: () => {
      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers();
        layersMapRef.current.clear();
        zoneIdsMapRef.current.clear();
      }
    }
  }));

  // Separate effect for draw control and event handlers
  useEffect(() => {
    if (!map || !drawnItemsRef.current) return;

    // Create draw control if it doesn't exist
    if (!drawControlRef.current) {
      drawControlRef.current = new L.Control.Draw({
      draw: {
        polygon: {
          shapeOptions: defaultStyle,
          allowIntersection: false,
          showArea: true
        },
        rectangle: {
          shapeOptions: defaultStyle,
          showArea: true
        },
        circle: {
          shapeOptions: defaultStyle,
          showRadius: true
        },
        polyline: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true
      }
    });

    map.addControl(drawControlRef.current);

    const handleCreate = (event) => {
      const layer = event.layer;
      console.log('Création de polygone :', {
        layer,
        geojson: layer.toGeoJSON(),
        featureGroup: drawnItemsRef.current
      });

      // Apply default style
      layer.setStyle(defaultStyle);

      // Add the layer to the FeatureGroup and ensure it's added to the map
      drawnItemsRef.current.addLayer(layer);
      console.log('Layer added to FeatureGroup, current layers:', drawnItemsRef.current.getLayers().length);

      // Generate the zone ID and data
      const geojson = layer.toGeoJSON();
      const zoneId = `POLYGONE${polygonCounter.current++}`;
      const coordinates = geojson.geometry.coordinates;
      const dateDebut = "2018-01-01";
      const dateFin = "2018-12-30";
      const quantiteMin = 0;
      
      // Bidirectional reference storage
      layersMapRef.current.set(zoneId, layer);
      zoneIdsMapRef.current.set(layer, zoneId);

      onPolygonCreated?.({ zoneId, coordinates, dateDebut, dateFin, quantiteMin });
    };

    const handleDelete = (event) => {
      const layers = event.layers;
      layers.eachLayer((layer) => {
        const zoneId = zoneIdsMapRef.current.get(layer);
        if (zoneId) {
          // delete notif for react
          onPolygonDeleted?.(zoneId);
          
          // clean ref
          layersMapRef.current.delete(zoneId);
          zoneIdsMapRef.current.delete(layer);
        }
      });
    };

    // Evenetlistener
    map.on(L.Draw.Event.CREATED, handleCreate);
    map.on(L.Draw.Event.DELETED, handleDelete);

    return () => {
      // Remove event listeners
      map.off(L.Draw.Event.CREATED, handleCreate);
      map.off(L.Draw.Event.DELETED, handleDelete);
      
      // Remove control but keep the FeatureGroup
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
    };
  }
  // End of useEffect
  }, [map, onPolygonCreated, onPolygonDeleted]);

  return null;
});

DrawControl.displayName = 'DrawControl';
export default DrawControl;