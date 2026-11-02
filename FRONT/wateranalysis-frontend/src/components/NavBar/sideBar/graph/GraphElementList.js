import React from 'react';
import { GripVertical, X } from 'lucide-react';

const GraphElementList = ({ 
  graphElements,
  deleteGraphElements,
  graphs,
  handleDragStart
}) => {
  // avalaible elements filter
  const availableElements = graphElements.filter(el => 
    !graphs.some(g => g.elements.includes(el.id))
  );

  return (
    <div className="mb-3">
      <h4 className="text-xs font-medium text-gray-600 mb-1">
        Available elements ({availableElements.length})
      </h4>
      {availableElements.length === 0 ? (
        <p className="text-xs text-gray-500 italic p-1">
          No elements available. Click a map area to add one.
        </p>
      ) : (
        <div className="space-y-1">
          {availableElements.map(element => (
            <div
              key={element.id}
              draggable
              onDragStart={(e) => handleDragStart(e, element.id)}
              className="bg-white p-2 rounded border border-gray-200 cursor-move hover:shadow transition-shadow flex items-center space-x-2 text-xs"
            >
              <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 truncate font-medium">
                    {element.name}
                  </span>
                </div>
                <div className="text-gray-500 text-xs truncate">
                  ID: {element.id} | Type: {element.type || 'N/A'}
                </div>
              </div>
              <button
                onClick={() => deleteGraphElements(element.id)}
                className="p-0.5 rounded hover:bg-gray-100 text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GraphElementList;