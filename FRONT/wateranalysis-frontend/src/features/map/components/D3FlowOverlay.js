import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { 
  normalizeId,
  buildNodeIndex,
  classifySourcesSinks,
  detectFlowDirection,
  computeNodeDegree
 } from './utils/DetectFlowDirection';

const D3FlowOverlay = ({ geoJsonData, nodesData, equipementData, onFeatureClick }) => {
  const map = useMap();
  const overlayRef = useRef();
  const nodeFeatures = useMemo(() => nodesData?.features || [], [nodesData]);
  const nodeSources = useMemo(() => ({
    noeud: nodesData,                        
    station_traitement: equipementData?.station_traitement || equipementData?.STATION_TRAITEMENT,
    reservoir:          equipementData?.reservoir || equipementData?.RESERVOIR,
    borne_fontaine:     equipementData?.borne_fontaine || equipementData?.BORNE_FONTAINE,
    vanne:              equipementData?.vanne || equipementData?.VANNE,
    pompe:              equipementData?.pompe || equipementData?.POMPE,
  }), [nodesData, equipementData]);

  const nodeIndex = useMemo(() => buildNodeIndex(nodeSources), [nodeSources]);

  const sourceSinkSets = useMemo(() => classifySourcesSinks(nodeIndex), [nodeIndex]);

  useEffect(() => {
    if (!geoJsonData || !map || !nodeFeatures.length) return;

    const overlayPane = map.getPanes().overlayPane;

    const container = L.DomUtil.create('div', 'd3-flow-container', overlayPane);
    const svg = d3.select(container).append('svg').attr('class', 'd3-flow-overlay');


    const g = svg.append('g').attr('class', 'leaflet-zoom-hide');
    overlayRef.current = svg;

    const projectPoint = function (x, y) {
      const point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    };

    const projection = d3.geoTransform({ point: projectPoint });
    const pathGenerator = d3.geoPath().projection(projection);

    const features = geoJsonData.type === 'FeatureCollection'
      ? geoJsonData.features
      : [geoJsonData];

    const nodeDegree = computeNodeDegree(features);
    
    // Lookup
    const elevationByNodeId = {};
    nodeFeatures.forEach((f) => {
      const id = normalizeId(f.properties?.ID_Noeud);
      const elevation = f.properties?.Elevation;
      if (id) elevationByNodeId[id] = elevation;
    });

    // flux Animation
    const animateFlow = () => {
      g.selectAll('circle.flow').remove(); // Clear previous

      g.selectAll('path.main').each(function () {
        const pathEl = this;
        let pathLength;
        try {
          pathLength = pathEl.getTotalLength();
        } catch (e) {
          return;
        }
        if (!pathLength || pathLength === 0) return;
        const circle = g.append('circle')
          .attr('class', 'flow')
          .attr('r', 2)
          .attr('fill', 'blue');

        let startTime = null;
        const duration = 3000 + Math.random() * 2000;

        d3.timer(function (elapsed) {
          if (!startTime) startTime = elapsed;
          const t = ((elapsed - startTime) % duration) / duration;
          const point = pathEl.getPointAtLength(t * pathLength);
          circle.attr('cx', point.x).attr('cy', point.y);
          return false;
        });
      });
    };
    const renderFeatures = () => {
      g.selectAll('path.main').remove();

      g.selectAll('path.main')
        .data(features)
        .enter()
        .append('path')
        .attr('class', 'main')
        .attr('d', (d) => {
          if (d.geometry.type !== 'MultiLineString') return null;

          const coords = d.geometry.coordinates.flat();
          if (coords.length < 2) return null;

          const orderedCoords = detectFlowDirection(coords, d.properties || {}, nodeIndex, sourceSinkSets, nodeDegree);


          // Generate way using ordered coordinates
          return pathGenerator({
            type: 'LineString',
            coordinates: orderedCoords
          });
        })
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('pointer-events', 'stroke')
        .style('cursor', 'pointer')
        .on('mouseover', function () {
          d3.select(this)
            .attr('stroke', 'orange')
            .attr('stroke-width', 4)
            .raise();
        })
        .on('mouseout', function () {
          d3.select(this)
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2);
        })
        .on('click', function(event, d) {
          event.stopPropagation();
          onFeatureClick?.(d.properties);
        });

      // start animation
      animateFlow();
    };


    const update = () => {
      const bounds = map.getBounds();
      const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
      const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());
      const width = bottomRight.x - topLeft.x;
      const height = bottomRight.y - topLeft.y;

      d3.select(container)
        .style('position', 'absolute')
        .style('width', `${width}px`)
        .style('height', `${height}px`)
        .style('left', `${topLeft.x}px`)
        .style('top', `${topLeft.y}px`);

      svg
        .attr('width', width)
        .attr('height', height)
        .style('left', null)
        .style('top', null);

      g.attr('transform', `translate(${-topLeft.x},${-topLeft.y})`);

      renderFeatures();
    };


    map.on('zoomend', update);
    map.on('moveend', update);
    update();

    return () => {
      map.off('zoomend', update);
      map.off('moveend', update);
      svg.remove();
      d3.selectAll('circle.flow').remove();
    };
  }, [geoJsonData, map, nodeFeatures, nodeIndex, sourceSinkSets, onFeatureClick]);

  return null;
};

export default D3FlowOverlay;
