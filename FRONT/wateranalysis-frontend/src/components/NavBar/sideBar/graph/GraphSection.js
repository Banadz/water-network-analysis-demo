import React from 'react';
import { Plus } from 'lucide-react';
import GraphElementList from '../graph/GraphElementList';
import GraphItem from '../graph/GrapheItem';

const GraphSection = ({
  graphs,
  graphElements,
  draggedItem,
  dragOverGraph,
  editingGraphId,
  graphNameEdit,
  setGraphNameEdit,
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
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Graphiques</h3>
      
      {/* Avalaible elements */}
      <GraphElementList
        graphElements={graphElements}
        deleteGraphElements={deleteGraphElements}
        graphs={graphs}
        handleDragStart={handleDragStart}
      />

      {/* Graph */}
      {graphs.map(graph => (
        <GraphItem
          key={graph.id}
          graph={graph}
          graphElements={graphElements}
          draggedItem={draggedItem}
          dragOverGraph={dragOverGraph}
          editingGraphId={editingGraphId}
          graphNameEdit={graphNameEdit}
          setGraphNameEdit={setGraphNameEdit}
          deleteGraph={deleteGraph}
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
      ))}

      {/* new graph button */}
      <button
        onClick={addNewGraph}
        className="w-full bg-white p-2 rounded shadow-sm hover:shadow transition-shadow cursor-pointer border border-dashed border-gray-300 hover:border-blue-400 text-xs"
      >
        <div className="flex items-center justify-center space-x-1 text-gray-600 hover:text-blue-600">
          <Plus className="w-3 h-3" />
          <span className="font-medium">Nouveau graphique</span>
        </div>
      </button>
    </div>
  );
};

export default GraphSection;