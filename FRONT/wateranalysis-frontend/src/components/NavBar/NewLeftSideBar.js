import React from 'react';
import { ChevronLeft, ChevronRight, Send, Loader2, Trash2 } from 'lucide-react';
import LayerSection from './sideBar/layer/LayerSection';
import GraphSection from './sideBar/graph/GraphSection';

const LeftSidebar = ({
  isOpen,
  setIsOpen,
  allLayers,
  activeLayers,
  searchQuery,
  setSearchQuery,
  filteredLayers,
  graphs,
  graphElements,
  loading,
  error,
  onSendRequest,
  onClearData,
  loadedGraphsCount,
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

  importedLayers,
  importing,
  importError,
  onImportGeoJSON,
  onRemoveImportedLayer,
  onClearImportedLayers,
  onToggleImportedActive,
  onToggleImportedSelected,

  togglePrediction
}) => {
  return (
    <aside className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${
      isOpen ? 'w-72' : 'w-10'
    }`}>
      <div className="p-3 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          {isOpen && <h2 className="text-md font-semibold text-gray-800">Gestion d'affichage</h2>}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            {isOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
        
        {isOpen && (
          <>
            <LayerSection
              allLayers={allLayers}
              activeLayers={activeLayers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredLayers={filteredLayers}
              toggleLayerActive={toggleLayerActive}
              toggleLayerSelected={toggleLayerSelected}
              addNewLayer={addNewLayer}

              importedLayers={importedLayers}
              importing={importing}
              error={importError}
              onImport={onImportGeoJSON}
              onRemoveLayer={onRemoveImportedLayer}
              onClearAll={onClearImportedLayers}
              onToggleActive={onToggleImportedActive}
              onToggleSelected={onToggleImportedSelected}
            />
            <GraphSection
              graphs={graphs}
              graphElements={graphElements}
              draggedItem={draggedItem}
              dragOverGraph={dragOverGraph}
              editingGraphId={editingGraphId}
              graphNameEdit={graphNameEdit}
              setGraphNameEdit={setGraphNameEdit}
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
              togglePrediction={togglePrediction}
            />

            {/* backend request section */}
            {graphs.length > 0 && (
              <div className="space-y-2 mt-3 pt-3 border-t border-gray-300">
                {/* Send request button */}
                <button
                  onClick={onSendRequest}
                  disabled={loading}
                  className={`w-full p-2 rounded shadow-sm transition-all border text-xs ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed border-gray-500' 
                      : 'bg-blue-500 hover:bg-blue-800 hover:shadow border-gray-600 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 text-white">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-medium font-semibold">Chargement...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span className="font-medium font-semibold">
                          Envoyer la requête
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* clear data button */}
                {loadedGraphsCount > 0 && !loading && (
                  <button
                    onClick={onClearData}
                    className="w-full p-2 rounded shadow-sm transition-all border text-xs bg-red-500 hover:bg-red-600 border-red-600 cursor-pointer"
                  >
                    <div className="flex items-center justify-center space-x-2 text-white">
                      <Trash2 className="w-3 h-3" />
                      <span className="font-medium">
                        Effacer les données ({loadedGraphsCount})
                      </span>
                    </div>
                  </button>
                )}

                {/* log errors */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                    <p className="font-semibold">Erreur:</p>
                    <p>{error}</p>
                  </div>
                )}

                {/* success message */}
                {!loading && !error && loadedGraphsCount > 0 && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-xs">
                    <p className="font-semibold">✓ Données chargées</p>
                    <p className="text-[10px] mt-1">
                      {loadedGraphsCount} graphe(s) avec données
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;