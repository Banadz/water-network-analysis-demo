import { useState } from 'react';
import mapService from '../../services/api/mapService';

export const useGraphData = (graphs, graphElements) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphsData, setGraphsData] = useState({});

  const preparePayloadsByGraph = (graph) => {
    const payloads = {
      production: [],
      consumption: [],
      comparaison: [] // Pour les éléments qui ont les deux
    };

    graph.elements.forEach(elementId => {
      const element = graphElements.find(e => e.id === elementId);
      if (!element) return;

      const settings = graph.elementSettings[elementId] || { 
        showConsommation: true, 
        showProduction: true 
      };

      const queryDTO = {
        zoneId: element.id,
        zoneName: element.name,
        coordinates: element.coordonates,
        dateDebut: graph.dateDebut,
        dateFin: graph.dateFin,
        enablePrediction: graph.enablePrediction || false
      };

      // Déterminer quel type de requête faire en fonction des settings
      const hasProduction = settings.showProduction;
      const hasConsommation = settings.showConsommation;

      if (hasProduction && hasConsommation) {
        // Les deux sont activés → mode comparaison
        payloads.comparaison.push(queryDTO);
      } else if (hasProduction) {
        // Seulement production
        payloads.production.push(queryDTO);
      } else if (hasConsommation) {
        // Seulement consommation
        payloads.consumption.push(queryDTO);
      }
    });

    return payloads;
  };

  const fetchGraphsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const allRequests = [];
      const visibleGraphs = graphs.filter(g => g.status === "afficher");

      for (const graph of visibleGraphs) {
        if (!graph.dateDebut || !graph.dateFin) {
          console.warn(`⚠️ Le graphe "${graph.name}" n'a pas de dates définies`);
          continue;
        }

        if (!graph.elements || graph.elements.length === 0) {
          console.warn(`⚠️ Le graphe "${graph.name}" n'a pas d'éléments`);
          continue;
        }

        const { production, consumption, comparaison } = preparePayloadsByGraph(graph);
        const enablePrediction = graph.enablePrediction || false;

        // Log pour debug
        console.log(`\n📊 Graphe "${graph.name}"`);
        console.log(`  🔮 Prédiction: ${enablePrediction ? 'OUI' : 'NON'}`);
        console.log(`  📦 Production seule: ${production.length} zone(s)`);
        console.log(`  📦 Consommation seule: ${consumption.length} zone(s)`);
        console.log(`  📦 Comparaison (les deux): ${comparaison.length} zone(s)`);

        // Requête pour PRODUCTION seule
        if (production.length > 0) {
          allRequests.push({
            type: 'production',
            graphId: graph.id,
            graphName: graph.name,
            enablePrediction: enablePrediction,
            payload: production,
            promise: mapService.getConsumptionByZone(
              production, 
              'production', 
              enablePrediction
            )
          });
        }

        // Requête pour CONSOMMATION seule
        if (consumption.length > 0) {
          allRequests.push({
            type: 'consumption',
            graphId: graph.id,
            graphName: graph.name,
            enablePrediction: enablePrediction,
            payload: consumption,
            promise: mapService.getConsumptionByZone(
              consumption, 
              'consumption', 
              enablePrediction
            )
          });
        }

        // Requête pour COMPARAISON (les deux)
        if (comparaison.length > 0) {
          allRequests.push({
            type: 'comparaison',
            graphId: graph.id,
            graphName: graph.name,
            enablePrediction: enablePrediction,
            payload: comparaison,
            promise: mapService.getConsumptionByZone(
              comparaison, 
              'comparaison', 
              enablePrediction
            )
          });
        }
      }

      if (allRequests.length === 0) {
        setError("Aucun graphe visible avec des dates définies et des éléments actifs");
        setLoading(false);
        return;
      }

      console.log(`\n🚀 Envoi de ${allRequests.length} requête(s)...`);

      const results = await Promise.allSettled(
        allRequests.map(req => req.promise)
      );

      const processedData = results.map((result, index) => {
        const request = allRequests[index];
        
        if (result.status === 'fulfilled') {
          console.log(`✅ Succès: ${request.graphName} - ${request.type}`);
          return {
            graphId: request.graphId,
            graphName: request.graphName,
            type: request.type,
            enablePrediction: request.enablePrediction,
            success: true,
            data: result.value.data
          };
        } else {
          console.error(`❌ Échec: ${request.graphName} - ${request.type}`, result.reason);
          return {
            graphId: request.graphId,
            graphName: request.graphName,
            type: request.type,
            enablePrediction: request.enablePrediction,
            success: false,
            error: result.reason?.message || 'Erreur inconnue'
          };
        }
      });

      // Grouper les résultats par graphe
      const grouped = processedData.reduce((acc, item) => {
        if (!acc[item.graphId]) {
          acc[item.graphId] = {
            graphId: item.graphId,
            graphName: item.graphName,
            production: null,
            consumption: null,
            comparaison: null,
            enablePrediction: item.enablePrediction,
            errors: []
          };
        }

        if (item.success) {
          // Stocker les données selon le type
          if (item.type === 'comparaison') {
            // Pour la comparaison, séparer production et consommation
            const prodData = item.data.filter(d => d.type === 'production');
            const consoData = item.data.filter(d => d.type === 'consumption');
            
            acc[item.graphId].production = prodData;
            acc[item.graphId].consumption = consoData;
            acc[item.graphId].comparaison = item.data; // Garder aussi les données fusionnées
          } else {
            acc[item.graphId][item.type] = item.data;
          }
        } else {
          acc[item.graphId].errors.push({
            type: item.type,
            error: item.error
          });
        }

        return acc;
      }, {});

      setGraphsData(grouped);
      console.log('\n📊 Données reçues:', grouped);

      const hasErrors = processedData.some(item => !item.success);
      if (hasErrors) {
        setError("Certaines requêtes ont échoué. Consultez la console.");
      }

    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const clearGraphsData = () => {
    setGraphsData({});
    setError(null);
  };

  const getGraphData = (graphId) => {
    return graphsData[graphId] || null;
  };

  const hasGraphData = (graphId) => {
    return !!graphsData[graphId];
  };

  const getLoadedGraphsCount = () => {
    return Object.keys(graphsData).length;
  };

  const isPredictionEnabled = (graphId) => {
    const graphData = graphsData[graphId];
    return graphData ? graphData.enablePrediction : false;
  };

  return {
    loading,
    error,
    graphsData,
    fetchGraphsData,
    clearGraphsData,
    getGraphData,
    hasGraphData,
    getLoadedGraphsCount,
    isPredictionEnabled
  };
};