import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import mapService from '../../../../services/api/mapService';

const GraphRequestSection = ({ graphs, graphElements }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseData, setResponseData] = useState(null);

  // Data preparation (showConsommation/showProduction)
  const preparePayloadsByGraph = (graph) => {
    const payloads = {
      production: [],
      consumption: []
    };

    // Browse graph elements liste
    graph.elements.forEach(elementId => {
      const element = graphElements.find(e => e.id === elementId);
      if (!element) return;

      const settings = graph.elementSettings[elementId] || { 
        showConsommation: true, 
        showProduction: true 
      };

      // Create DTO (Backend request DTO)
      const queryDTO = {
        zoneId: element.id,
        coordinates: element.coordonates, // GeoJSON format
        dateDebut: graph.dateDebut, // Format: "YYYY-MM-DD"
        dateFin: graph.dateFin
      };

      // add in production list (showProduction is true)
      if (settings.showProduction) {
        payloads.production.push(queryDTO);
      }

      // add in consumption list (showConsumption is true)
      if (settings.showConsommation) {
        payloads.consumption.push(queryDTO);
      }
    });

    return payloads;
  };

  // send request
  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      // Collect all pending requests
      const allRequests = [];

      // for each graph with status "afficher"
      const visibleGraphs = graphs.filter(g => g.status === "afficher");

      for (const graph of visibleGraphs) {
        // Check if the graph has dates
        if (!graph.dateDebut || !graph.dateFin) {
          console.warn(`Chart "${graph.name}" has no dates and will be skipped`);
          continue;
        }

        // Check if the graph has elements
        if (!graph.elements || graph.elements.length === 0) {
          console.warn(`Chart "${graph.name}" has no elements and will be skipped`);
          continue;
        }

        // Payloads preparation
        const { production, consumption } = preparePayloadsByGraph(graph);

        // Add production query if needed
        if (production.length > 0) {
          allRequests.push({
            type: 'production',
            graphId: graph.id,
            graphName: graph.name,
            payload: production,
            promise: mapService.getConsumptionByZone(production, 'production')
          });
        }

        // Add consumption query if needed
        if (consumption.length > 0) {
          allRequests.push({
            type: 'consumption',
            graphId: graph.id,
            graphName: graph.name,
            payload: consumption,
            promise: mapService.getConsumptionByZone(consumption, 'consumption')
          });
        }
      }

      if (allRequests.length === 0) {
        setError("No visible chart has a date range and active elements");
        setLoading(false);
        return;
      }

      console.log(`Envoi de ${allRequests.length} requête(s)...`);
      console.log('Payloads:', allRequests.map(r => ({
        type: r.type,
        graphName: r.graphName,
        zonesCount: r.payload.length,
        zones: r.payload.map(z => ({ zoneId: z.zoneId, dateDebut: z.dateDebut, dateFin: z.dateFin }))
      })));

      // Execute all requests in parallel
      const results = await Promise.allSettled(
        allRequests.map(req => req.promise)
      );

      // Process results
      const processedData = results.map((result, index) => {
        const request = allRequests[index];
        
        if (result.status === 'fulfilled') {
          return {
            graphId: request.graphId,
            graphName: request.graphName,
            type: request.type,
            success: true,
            zonesCount: request.payload.length,
            data: result.value.data
          };
        } else {
          return {
            graphId: request.graphId,
            graphName: request.graphName,
            type: request.type,
            success: false,
            zonesCount: request.payload.length,
            error: result.reason?.message || 'Unknown error'
          };
        }
      });

      // group data by graph
      const groupedData = processedData.reduce((acc, item) => {
        if (!acc[item.graphId]) {
          acc[item.graphId] = {
            graphId: item.graphId,
            graphName: item.graphName,
            production: null,
            consumption: null,
            errors: []
          };
        }

        if (item.success) {
          if (item.type === 'production') {
            acc[item.graphId].production = {
              data: item.data,
              zonesCount: item.zonesCount
            };
          } else if (item.type === 'consumption') {
            acc[item.graphId].consumption = {
              data: item.data,
              zonesCount: item.zonesCount
            };
          }
        } else {
          acc[item.graphId].errors.push({
            type: item.type,
            error: item.error
          });
        }

        return acc;
      }, {});

      const finalData = Object.values(groupedData);
      setResponseData(finalData);
      console.log('Received and grouped data:', finalData);

      // check for errors
      const hasErrors = processedData.some(item => !item.success);
      if (hasErrors) {
        setError("Some requests failed. Check the console for details.");
      }

    } catch (err) {
      console.error('Error sending requests:', err);
      setError(err.message || 'An error occurred while sending requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {graphs.length > 0 && (
        <button
          onClick={sendRequest}
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
                <span className="font-medium font-semibold">Loading...</span>
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                <span className="font-medium font-semibold">Send request</span>
              </>
            )}
          </div>
        </button>
      )}

      {/* show errors */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* display results */}
      {responseData && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-xs">
          <p className="font-semibold">Request sent successfully!</p>
          <div className="text-[10px] mt-1 space-y-1">
            {responseData.map(graph => (
              <div key={graph.graphId} className="bg-white bg-opacity-50 p-1 rounded">
                <span className="font-semibold">{graph.graphName}:</span>
                {graph.production && (
                  <span className="ml-1">
                    Production ({graph.production.zonesCount} zone{graph.production.zonesCount > 1 ? 's' : ''})
                  </span>
                )}
                {graph.production && graph.consumption && <span>, </span>}
                {graph.consumption && (
                  <span className="ml-1">
                    Consumption ({graph.consumption.zonesCount} zone{graph.consumption.zonesCount > 1 ? 's' : ''})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log received data (remove before deployment) */}
      {responseData && (
        <details className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
          <summary className="cursor-pointer font-semibold text-gray-700">
            View received data (debug)
          </summary>
          <pre className="mt-2 text-[10px] overflow-auto max-h-60 bg-white p-2 rounded">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default GraphRequestSection;