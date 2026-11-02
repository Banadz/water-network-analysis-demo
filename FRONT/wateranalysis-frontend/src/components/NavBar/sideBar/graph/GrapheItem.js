import React, { useState } from 'react';
import { Edit, Eye, EyeOff, Trash2, GripVertical, X, Calendar, CalendarX, TrendingUp } from 'lucide-react';

const GraphItem = ({
  graph,
  graphElements,
  draggedItem,
  dragOverGraph,
  editingGraphId,
  graphNameEdit,
  setGraphNameEdit,
  deleteGraph,
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
}) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateDebut, setDateDebut] = useState(graph.dateDebut || '');
  const [dateFin, setDateFin] = useState(graph.dateFin || '');

  const hasDates = graph.dateDebut && graph.dateFin;
  const predictionEnabled = graph.enablePrediction || false;

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleMenuAction = (action) => {
    closeContextMenu();
    
    switch(action) {
      case 'insertDate':
      case 'modifyDate':
        setDateDebut(graph.dateDebut || '');
        setDateFin(graph.dateFin || '');
        setShowDateModal(true);
        break;
      case 'clearDate':
        if (openDateModal) {
          openDateModal(graph.id, '', '');
        }
        break;
      case 'togglePrediction':
        if (togglePrediction) {
          togglePrediction(graph.id);
        }
        break;
      case 'edit':
        startEditingGraphName(graph);
        break;
      case 'toggle':
        toggleGraphStatus(graph.id);
        break;
      case 'delete':
        deleteGraph(graph.id);
        break;
      default:
        break;
    }
  };

  const handleSaveDates = () => {
    if (openDateModal) {
      openDateModal(graph.id, dateDebut, dateFin);
    }
    setShowDateModal(false);
  };

  React.useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onDragOver={(e) => handleDragOver(e, graph.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, graph.id)}
        className={`relative bg-white p-2 rounded shadow border transition-all text-xs ${
          dragOverGraph === graph.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          {editingGraphId === graph.id ? (
            <div className="flex items-center space-x-1 flex-1">
              <input
                type="text"
                value={graphNameEdit}
                onChange={(e) => setGraphNameEdit(e.target.value)}
                onBlur={() => saveGraphName(graph.id)}
                onKeyPress={(e) => e.key === 'Enter' && saveGraphName(graph.id)}
                className="flex-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
                autoFocus
              />
            </div>
          ) : (
            <>
              <h4 className="font-medium text-gray-800 truncate flex-1">{graph.name}</h4>
            </>
          )}
          <div className="flex items-center space-x-1">
            {/* Bouton de prédiction */}
            <button
              onClick={() => togglePrediction && togglePrediction(graph.id)}
              className={`p-0.5 rounded transition-colors ${
                predictionEnabled 
                  ? 'bg-purple-100 hover:bg-purple-200' 
                  : 'hover:bg-gray-100'
              }`}
              title={predictionEnabled ? "Prédiction activée" : "Prédiction désactivée"}
            >
              <TrendingUp className={`w-3 h-3 ${
                predictionEnabled ? 'text-purple-600' : 'text-gray-400'
              }`} />
            </button>
            <button
              onClick={() => startEditingGraphName(graph)}
              className="p-0.5 rounded hover:bg-gray-100"
            >
              <Edit className="w-3 h-3 text-gray-500" />
            </button>
            <button
              onClick={() => toggleGraphStatus(graph.id)}
              className="p-0.5 rounded hover:bg-gray-100"
            >
              {graph.status === "afficher" ? 
                <Eye className="w-3 h-3 text-green-600" /> : 
                <EyeOff className="w-3 h-3 text-gray-400" />
              }
            </button>
            <button
              onClick={() => deleteGraph(graph.id)}
              className="p-0.5 rounded hover:bg-gray-100 text-red-500"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {/* Indicateur de prédiction active */}
        {predictionEnabled && (
          <div className="mb-2 flex items-center text-[10px] text-purple-600 bg-purple-50 p-1 rounded">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Prédiction activée</span>
          </div>  
        )}

        {/* Période avec dates validées */}
        {hasDates && (
          <div className="mb-2 flex items-center text-[10px] text-gray-500 bg-blue-50 p-1 rounded">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Période: {graph.dateDebut} au {graph.dateFin}</span>
          </div>  
        )}

        {/* Éléments du graphe */}
        <div className="space-y-1">
          {graph.elements.map(elementId => {
            const element = graphElements.find(e => e.id === elementId);
            if (!element) return null;
            
            const settings = graph.elementSettings[elementId] || { showConsommation: true, showProduction: true };
            
            return (
              <div 
                key={elementId}
                className="flex items-center justify-between bg-gray-50 p-1 rounded"
                draggable
                onDragStart={(e) => handleDragStart(e, elementId)}
              >
                <div className="flex items-center space-x-1 flex-1">
                  <GripVertical 
                    className="w-3 h-3 text-gray-400 cursor-move"
                  />
                  <span className="text-gray-700 truncate flex-1">{element.name}</span>
                </div>
                
                <div className="flex items-center space-x-1 mr-1">
                  {element.type === 'consommation' || element.type === 'production' ? (
                    <>
                      <label className="flex items-center space-x-0.5">
                        <input
                          type="checkbox"
                          checked={settings.showConsommation}
                          onChange={(e) => updateElementSettings(graph.id, elementId, 'showConsommation', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-red-600 text-xs">C</span>
                      </label>
                      <label className="flex items-center space-x-0.5">
                        <input
                          type="checkbox"
                          checked={settings.showProduction}
                          onChange={(e) => updateElementSettings(graph.id, elementId, 'showProduction', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-green-600 text-xs">P</span>
                      </label>
                    </>
                  ) : (
                    <span className={`px-1 rounded text-xs ${
                      element.type === 'consommation' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {element.type === 'consommation' ? 'C' : 'P'}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => removeElementFromGraph(graph.id, elementId)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {graph.elements.length === 0 && (
          <div className="text-center py-2 text-gray-500 border border-dashed border-gray-300 rounded text-xs">
            Glissez des éléments ici
          </div>
        )}
      </div>

      {/* Menu contextuel */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            zIndex: 1000
          }}
          className="bg-white shadow-lg rounded-lg border border-gray-200 py-1 min-w-[180px]"
        >
          {/* Option de prédiction */}
          <button
            onClick={() => handleMenuAction('togglePrediction')}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
          >
            <TrendingUp className={`w-4 h-4 ${predictionEnabled ? 'text-purple-600' : 'text-gray-600'}`} />
            <span>{predictionEnabled ? 'Désactiver prédiction' : 'Activer prédiction'}</span>
          </button>
          
          <div className="border-t border-gray-200 my-1"></div>

          {/* Options de date */}
          {hasDates ? (
            <>
              <button
                onClick={() => handleMenuAction('modifyDate')}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Modifier date</span>
              </button>
              <button
                onClick={() => handleMenuAction('clearDate')}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
              >
                <CalendarX className="w-4 h-4 text-orange-600" />
                <span>Vider date</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleMenuAction('insertDate')}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
            >
              <Calendar className="w-4 h-4 text-green-600" />
              <span>Insérer date</span>
            </button>
          )}
          
          <div className="border-t border-gray-200 my-1"></div>
          
          <button
            onClick={() => handleMenuAction('edit')}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
          >
            <Edit className="w-4 h-4 text-gray-600" />
            <span>Éditer</span>
          </button>
          <button
            onClick={() => handleMenuAction('toggle')}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
          >
            {graph.status === "afficher" ? (
              <>
                <EyeOff className="w-4 h-4 text-gray-600" />
                <span>Masquer</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-green-600" />
                <span>Afficher</span>
              </>
            )}
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={() => handleMenuAction('delete')}
            className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center space-x-2 text-sm text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>
      )}

      {/* Modal de dates */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>{hasDates ? 'Modifier la période' : 'Définir la période'}</span>
              </h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowDateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveDates}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GraphItem;