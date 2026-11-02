// Layout.js

import React, { useRef, useState } from 'react';
import Header from '../../components/NavBar/Header';
import LeftSidebar from '../../components/NavBar/NewLeftSideBar';
import RightSidebar from '../../components/NavBar/RightSideBar';
import MainContent from '../../components/NavBar/MainContent';
import Footer from '../../components/NavBar/Footer';
import { useLayoutState } from './hooks/useLayoutState';
import { useGraphData } from '../../hooks/chart/useGraphData';
import { useGeoJSONImport } from '../../hooks/layer/useGeoJSONImport';

const Layout = () => {
  const mapViewRef = useRef();
  
  // État pour la vue active
  const [activeView, setActiveView] = useState('map');
  
  const {
    leftSidebarOpen,
    setLeftSidebarOpen,
    rightSidebarOpen,
    setRightSidebarOpen,
    activeDropdown,
    setActiveDropdown,
    allLayers,
    activeLayers,
    checkedLayers,
    searchQuery,
    setSearchQuery,
    graphs,
    graphElements,
    addGraphElements,
    draggedItem,
    dragOverGraph,
    editingGraphId,
    graphNameEdit,
    setGraphNameEdit,
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
  } = useLayoutState();

  const {
    loading,
    error,
    graphsData,
    fetchGraphsData,
    clearGraphsData,
    getLoadedGraphsCount
  } = useGraphData(graphs, graphElements);
  
  // layer Import..
  const {
    importedLayers,
    importing,
    error: importError,
    importGeoJSON,
    removeImportedLayer,
    clearImportedLayers,
    updateLayerStatus
  } = useGeoJSONImport();

  const filteredLayers = allLayers.filter(layer =>
    layer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleZoneClick = (zoneData) => {
    addGraphElements(zoneData);
  };

  // imported layer toggle
  const handleToggleImportedActive = (layerId, active) => {
    updateLayerStatus(layerId, { active });
  };

  // imported & selected layer toggle
  const handleToggleImportedSelected = (layerId, selected) => {
    updateLayerStatus(layerId, { selected });
  };

  // Create unified layer for map (native & imported)
  const allMapLayers = [
    ...checkedLayers,
    ...importedLayers.filter(layer => layer.selected)
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100" onClick={() => setActiveDropdown(null)}>
      <Header 
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar 
          isOpen={leftSidebarOpen}
          setIsOpen={setLeftSidebarOpen}
          allLayers={allLayers}
          activeLayers={activeLayers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredLayers={filteredLayers}
          graphs={graphs}
          graphElements={graphElements}
          draggedItem={draggedItem}
          dragOverGraph={dragOverGraph}
          editingGraphId={editingGraphId}
          graphNameEdit={graphNameEdit}
          setGraphNameEdit={setGraphNameEdit}
          toggleLayerActive={toggleLayerActive}
          toggleLayerSelected={toggleLayerSelected}
          addNewLayer={addNewLayer}
          addNewGraph={addNewGraph}
          deleteGraph={deleteGraph}
          deleteGraphElements={deleteGraphElements}
          toggleGraphStatus={toggleGraphStatus}
          updateElementSettings={updateElementSettings}
          removeElementFromGraph={removeElementFromGraph}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          startEditingGraphName={startEditingGraphName}
          saveGraphName={saveGraphName}
          openDateModal={openDateModal}
          loading={loading}
          error={error}
          onSendRequest={fetchGraphsData}
          onClearData={clearGraphsData}
          loadedGraphsCount={getLoadedGraphsCount()}
          importedLayers={importedLayers}
          importing={importing}
          importError={importError}
          onImportGeoJSON={importGeoJSON}
          onRemoveImportedLayer={removeImportedLayer}
          onClearImportedLayers={clearImportedLayers}
          onToggleImportedActive={handleToggleImportedActive}
          onToggleImportedSelected={handleToggleImportedSelected}
          togglePrediction={togglePrediction}
        />

        <MainContent
          mapViewRef={mapViewRef}
          activeLayers={allMapLayers}
          handleFeatureClick={() => {}}
          handleZoneClick={handleZoneClick}
          activeView={activeView}
        />

        <RightSidebar 
          isOpen={rightSidebarOpen}
          setIsOpen={setRightSidebarOpen}
          graphs={graphs}
          graphElements={graphElements}
          graphsData={graphsData}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;