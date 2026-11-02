import React from 'react';
import { Plus, X } from 'lucide-react';
import GeoJSONImportSection from './GeoJSONImportSection';

const LayerSection = ({
  activeLayers,
  searchQuery,
  setSearchQuery,
  filteredLayers,
  toggleLayerActive,
  toggleLayerSelected,
  addNewLayer,
  importedLayers,
  importing,
  error,
  onImport,
  onRemoveLayer,
  onClearAll,
  onToggleActive,
  onToggleSelected
}) => {

  return (
    <div className="space-y-3 mb-4 pb-4 border-b border-gray-300">
      <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Couches</h3>
      
      {/* layer Search */}
      <div className="mb-3">
        <input 
          type="text" 
          placeholder="Rechercher des couches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* active layer */}
      {activeLayers.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-600 mb-1">Couches actives</h4>
          <div className="space-y-1">
            {activeLayers.map(layer => (
              <div key={layer.id} className="bg-white p-1 rounded border border-gray-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={layer.selected}
                    onChange={() => toggleLayerSelected(layer.id)}
                    className="rounded"
                  />
                  <span className="text-gray-700 truncate">{layer.name}</span>
                </div>
                <button
                  onClick={() => toggleLayerActive(layer.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {searchQuery && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-600 mb-1">Résultats de recherche</h4>
          <div className="space-y-1">
            {filteredLayers.map(layer => (
              <div key={layer.id} className="bg-white p-1 rounded border border-gray-200 flex items-center justify-between text-xs">
                <span className="text-gray-700 truncate">{layer.name}</span>
                <button
                  onClick={() => toggleLayerActive(layer.id)}
                  className="text-green-500 hover:text-green-700"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-gray-300">
        <GeoJSONImportSection
          importedLayers={importedLayers}
          importing={importing}
          error={error}
          onImport={onImport}
          onRemoveLayer={onRemoveLayer}
          onClearAll={onClearAll}
          onToggleActive={onToggleActive}
          onToggleSelected={onToggleSelected}
        />
      </div>
    </div>
  );
};

export default LayerSection;