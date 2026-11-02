import * as d3 from 'd3';

export const calculateForceLayout = (nodes, links, width, height) => {
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

  simulation.tick(300);
  return { nodes, links };
};

export const generateHexbin = (data, radius) => {
  const hexbin = d3.hexbin()
    .radius(radius)
    .extent([[0, 0], [1000, 1000]]);
  
  return hexbin(data);
};