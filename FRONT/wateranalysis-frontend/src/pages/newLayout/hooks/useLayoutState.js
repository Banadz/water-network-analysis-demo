import { useState } from 'react';

import { LAYER_TYPES } from '../../../config/mapConfig';

const LAYER_LABELS = {
  [LAYER_TYPES.REGION]: "Régions",
  [LAYER_TYPES.DISTRICT]: "Districts",
  [LAYER_TYPES.COMMUNE]: "Communes",
  [LAYER_TYPES.QUARTIER]: "Quartiers ADM",
  [LAYER_TYPES.QUARTIER_ORCHA]: "Quartiers ORCHA",
  [LAYER_TYPES.ZONE_COMMERCIALE]: "Zones commerciales",
  [LAYER_TYPES.FOKOTANY]: "Fokontany",
  [LAYER_TYPES.RESEAU]: "Réseaux",
  [LAYER_TYPES.STATION_TRAITEMENT]: "Stations de traitement",
  [LAYER_TYPES.RESERVOIR]: "Réservoirs",
  [LAYER_TYPES.BORNE_FONTAINE]: "Bornes fontaines",
  [LAYER_TYPES.NOEUD]: "Noeuds",
  [LAYER_TYPES.VANNE]: "Vannes",
  [LAYER_TYPES.POMPE]: "Pompes",
  [LAYER_TYPES.CONDUITE_AMENEE]: "Conduites amenées",
  [LAYER_TYPES.SOURCE]: "Sources",
  [LAYER_TYPES.CAPTAGE]: "Captages",
  [LAYER_TYPES.SECTEUR_DIST]: "Secteurs distribution",
  [LAYER_TYPES.RESEAU_D3]: "Réseaux (D3 sens écoulement)",
  [LAYER_TYPES.HEATMAP]: "Heatmap de consommation",
};

const LAYER_GROUPS = {
  "Réseau & Conduites": [
    LAYER_TYPES.RESEAU_D3,
    LAYER_TYPES.CONDUITE_AMENEE,
    LAYER_TYPES.RESEAU,
  ],
  "Équipements": [
    LAYER_TYPES.STATION_TRAITEMENT,
    LAYER_TYPES.RESERVOIR,
    LAYER_TYPES.BORNE_FONTAINE,
    LAYER_TYPES.NOEUD,
    LAYER_TYPES.VANNE,
    LAYER_TYPES.POMPE,
  ],
  "Territoires / Admin": [
    LAYER_TYPES.REGION,
    LAYER_TYPES.DISTRICT,
    LAYER_TYPES.COMMUNE,
    LAYER_TYPES.QUARTIER,
    LAYER_TYPES.QUARTIER_ORCHA, 
    LAYER_TYPES.FOKOTANY,
    LAYER_TYPES.ZONE_COMMERCIALE,
    LAYER_TYPES.SECTEUR_DIST,
  ],
  "Sources": [
    LAYER_TYPES.SOURCE,
    LAYER_TYPES.CAPTAGE,
  ],
  "Analytique": [
    LAYER_TYPES.HEATMAP,
  ]
};

export const useLayoutState = () => {
  // sidebar state
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // drag & drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverGraph, setDragOverGraph] = useState(null);
  const [editingGraphId, setEditingGraphId] = useState(null);
  const [graphNameEdit, setGraphNameEdit] = useState('');

  const findCategory = (layerKey) => {
      for (const [groupName, types] of Object.entries(LAYER_GROUPS)) {
          if (types.includes(layerKey)) {
          return groupName;
          }
      }
      return "Autres";
  };

  // avalaible layer data
  const [allLayers, setAllLayers] = useState(
      Object.entries(LAYER_LABELS).map(([layerKey, label], index) => ({
          id: index + 1,
          layerKey: layerKey,        
          name: label,              
          category: findCategory(layerKey),
          active: false,            
          selected: false,          
      }))
  );

  // active layer (filtered)
  const [activeLayers, setActiveLayers] = useState(
    allLayers.filter(layer => layer.active)
  );
  const [checkedLayers, setCheckedLayers] = useState(
    allLayers.filter(layer => layer.selected)
  );

  // graph elements
  const [graphElements, setGraphElements] = useState([]);

  // graph state
  const [graphs, setGraphs] = useState([]);

  // layer function
  const toggleLayerActive = (layerId) => {
    const updatedLayers = allLayers.map(layer => 
      layer.id === layerId ? { ...layer, active: !layer.active } : layer
    );
    setAllLayers(updatedLayers);
    setActiveLayers(updatedLayers.filter(layer => layer.active));
    setCheckedLayers(updatedLayers.filter(layer => layer.selected));
    setSearchQuery('');
  };

  const toggleLayerSelected = (layerId) => {
    const updatedLayers = allLayers.map(layer => 
      layer.id === layerId ? { ...layer, selected: !layer.selected } : layer
    );
    setAllLayers(updatedLayers);
    setActiveLayers(updatedLayers.filter(layer => layer.active));
    setCheckedLayers(updatedLayers.filter(layer => layer.selected));
  };

  const addNewLayer = () => {
    const newLayer = {
      id: Date.now(),
      name: `Nouvelle couche ${Date.now()}`,
      category: "custom",
      active: true,
      selected: true
    };
    const updatedLayers = [...allLayers, newLayer];
    setAllLayers(updatedLayers);
    setActiveLayers(updatedLayers.filter(layer => layer.active));
    setCheckedLayers(updatedLayers.filter(layer => layer.selected));
  };

  // graph function
  const addNewGraph = () => {
    const newGraph = {
      id: Date.now(),
      name: `Nouveau graphe`,
      status: "afficher",
      elements: [],
      elementSettings: {},
      dateDebut: '',
      dateFin: '',
      enablePrediction: false
    };
    setGraphs([...graphs, newGraph]);
  };
  // Toggle prediction for a graph
  const togglePrediction = (graphId) => {
    setGraphs(prevGraphs => 
      prevGraphs.map(graph => 
        graph.id === graphId 
          ? { ...graph, enablePrediction: !graph.enablePrediction }
          : graph
      )
    );
    const updatedGraph = graphs.find(g => g.id === graphId);
    console.log(`Prédiction ${!updatedGraph?.enablePrediction ? 'activée' : 'désactivée'} pour "${updatedGraph?.name}"`);
  };

  const addGraphElements = (element) => {
    setGraphElements(prevElements => {
      const newId = prevElements.length > 0 
        ? Math.max(...prevElements.map(e => e.id)) + 1 
        : 1;
      
      const newElement = {
        id: newId,
        name: element.zoneId || `Zone ${newId}`,
        type: 'consommation',
        coordonates: element.coordinates
      };
      return [...prevElements, newElement];
    });
  };

  const deleteGraph = (graphId) => {
    setGraphs(graphs.filter(g => g.id !== graphId));
  };
  
  const deleteGraphElements = (GraphElementsId) => {
    setGraphElements(graphElements.filter(g => g.id !== GraphElementsId));
  };

  const toggleGraphStatus = (graphId) => {
    setGraphs(graphs.map(g => 
      g.id === graphId 
        ? { ...g, status: g.status === "afficher" ? "Masquer" : "afficher" }
        : g
    ));
  };

  const startEditingGraphName = (graph) => {
    setEditingGraphId(graph.id);
    setGraphNameEdit(graph.name);
  };

  const saveGraphName = (graphId) => {
    if (graphNameEdit.trim()) {
      setGraphs(graphs.map(g => 
        g.id === graphId ? { ...g, name: graphNameEdit.trim() } : g
      ));
    }
    setEditingGraphId(null);
    setGraphNameEdit('');
  };

  const updateElementSettings = (graphId, elementId, field, value) => {
    setGraphs(graphs.map(g => {
      if (g.id === graphId) {
        const currentSettings = g.elementSettings[elementId] || { showConsommation: true, showProduction: true };
        return {
          ...g,
          elementSettings: {
            ...g.elementSettings,
            [elementId]: {
              ...currentSettings,
              [field]: value
            }
          }
        };
      }
      return g;
    }));
  };

  const removeElementFromGraph = (graphId, elementId) => {
    setGraphs(graphs.map(g => 
      g.id === graphId 
        ? { 
            ...g, 
            elements: g.elements.filter(e => e !== elementId),
            elementSettings: Object.fromEntries(
              Object.entries(g.elementSettings).filter(([key]) => parseInt(key) !== elementId)
            )
          }
        : g
    ));
  };

  // update graph date
  const openDateModal = (graphId, dateDebut, dateFin) => {
    setGraphs(graphs.map(g => 
      g.id === graphId 
        ? { ...g, dateDebut, dateFin }
        : g
    ));
  };

  // drag & drop function
  const handleDragStart = (e, elementId) => {
    setDraggedItem(elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, graphId) => {
    e.preventDefault();
    setDragOverGraph(graphId);
  };

  const handleDragLeave = () => {
    setDragOverGraph(null);
  };

  const handleDrop = (e, targetGraphId) => {
    e.preventDefault();
    if (draggedItem && targetGraphId) {
      const updatedGraphs = graphs.map(g => ({
        ...g,
        elements: g.elements.filter(e => e !== draggedItem),
        elementSettings: Object.fromEntries(
          Object.entries(g.elementSettings).filter(([key]) => parseInt(key) !== draggedItem)
        )
      }));
      
      const finalGraphs = updatedGraphs.map(g => 
        g.id === targetGraphId 
          ? { 
              ...g, 
              elements: [...g.elements, draggedItem],
              elementSettings: {
                ...g.elementSettings,
                [draggedItem]: { showConsommation: true, showProduction: true }
              }
            }
          : g
      );
      
      setGraphs(finalGraphs);
    }
    setDraggedItem(null);
    setDragOverGraph(null);
  };


  return {
    // États
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    activeDropdown,
    setActiveDropdown,
    allLayers,
    setAllLayers,
    activeLayers,
    setActiveLayers,
    checkedLayers,
    setCheckedLayers,
    searchQuery,
    setSearchQuery,
    graphs,
    setGraphs,
    graphElements,
    addGraphElements,
    draggedItem,
    setDraggedItem,
    dragOverGraph,
    setDragOverGraph,
    editingGraphId,
    setEditingGraphId,
    graphNameEdit,
    setGraphNameEdit,
    
    // Fonctions
    toggleLayerActive,
    toggleLayerSelected,
    addNewLayer,
    addNewGraph,
    deleteGraph,
    deleteGraphElements,
    toggleGraphStatus,
    updateElementSettings,
    removeElementFromGraph,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    startEditingGraphName,
    saveGraphName,
    openDateModal,

    togglePrediction
  };
};