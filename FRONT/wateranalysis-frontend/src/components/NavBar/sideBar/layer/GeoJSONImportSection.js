import React, { useRef } from 'react';
import { Upload, X, FileJson, Trash2, Eye, EyeOff } from 'lucide-react';

const GeoJSONImportSection = ({
  importedLayers,
  importing,
  error,
  onImport,
  onRemoveLayer,
  onClearAll,
  onToggleActive,
  onToggleSelected
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      await onImport(file);
    }

    // Reset input for duplicate file imports
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wider">
          Couches importées
        </h3>
        {importedLayers.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1"
            title="Supprimer toutes les couches importées"
          >
            <Trash2 className="w-3 h-3" />
            <span>Tout effacer</span>
          </button>
        )}
      </div>

      {/* import button */}
      <button
        onClick={triggerFileInput}
        disabled={importing}
        className={`w-full bg-white p-2 rounded shadow-sm hover:shadow transition-shadow cursor-pointer border border-dashed text-xs ${
          importing 
            ? 'border-gray-300 bg-gray-50' 
            : 'border-blue-400 hover:border-blue-500'
        }`}
      >
        <div className="flex items-center justify-center space-x-1 text-blue-600">
          {importing ? (
            <>
              <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="font-medium">Import en cours...</span>
            </>
          ) : (
            <>
              <Upload className="w-3 h-3" />
              <span className="font-medium">Importer GeoJSON</span>
            </>
          )}
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".geojson,.json"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* error logs */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
          <p className="font-semibold">Erreur d'import:</p>
          <p>{error}</p>
        </div>
      )}

      {/* imported layer list */}
      {importedLayers.length > 0 && (
        <div className="space-y-2">
          {importedLayers.map(layer => (
            <div
              key={layer.id}
              className="bg-white p-2 rounded shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-1 flex-1 min-w-0">
                  <FileJson className="w-3 h-3 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {layer.name}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                      <span>{layer.featureCount} feature{layer.featureCount > 1 ? 's' : ''}</span>
                      {layer.geometryType && (
                        <>
                          <span>•</span>
                          <span className="font-medium" title="Type de géométrie">
                            {layer.geometryType}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onRemoveLayer(layer.id)}
                  className="text-red-500 hover:text-red-700 p-0.5 flex-shrink-0"
                  title="Supprimer cette couche"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleActive(layer.id, !layer.active)}
                    className={`p-1 rounded text-xs ${
                      layer.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                    title={layer.active ? 'Masquer' : 'Afficher'}
                  >
                    {layer.active ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </button>

                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layer.selected}
                      onChange={(e) => onToggleSelected(layer.id, e.target.checked)}
                      className="w-3 h-3 rounded"
                    />
                    <span className="text-[10px] text-gray-600">Sélectionner</span>
                  </label>
                </div>

                <span className="text-[9px] text-gray-400" title={layer.fileName}>
                  {formatDate(layer.importDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {importedLayers.length === 0 && !error && (
        <div className="text-center py-3 text-gray-500 text-xs italic">
          Aucune couche importée
        </div>
      )}
    </div>
  );
};

export default GeoJSONImportSection;