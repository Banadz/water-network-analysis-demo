import axiosClient from "./axiosClient";

const mapService = {
  getTest() {
    return axiosClient.get("/test");
  },
  
  async getConsumptionByZone(payload, type, enablePrediction = false) {
    console.log('📤 Payload:', payload);
    console.log('📊 Type:', type);
    console.log('🔮 Prédiction:', enablePrediction ? 'OUI' : 'NON');
    
    // Ajouter le flag de prédiction à chaque élément du payload
    const enhancedPayload = payload.map(item => ({
      ...item,
      enablePrediction: enablePrediction
    }));
    
    // === PRODUCTION ===
    if (type === 'production') {
      const endpoint = enablePrediction 
        ? "/eau-traite/by-zone/prediction" 
        : "/eau-traite/by-zone";
      
      console.log(`→ Endpoint production: ${endpoint}`);
      return axiosClient.post(endpoint, enhancedPayload);
    }
    
    // === CONSOMMATION ===
    if (type === 'consumption') {
      const endpoint = enablePrediction 
        ? "/eau-distribue/by-zone/prediction" 
        : "/eau-distribue/by-zone";
      
      console.log(`→ Endpoint consommation: ${endpoint}`);
      return axiosClient.post(endpoint, enhancedPayload);
    }
    
    // === COMPARAISON (Production + Consommation) ===
    if (type === 'comparaison') {
      console.log('→ Mode comparaison: Production ET Consommation');
      
      // Endpoints avec ou sans prédiction
      const productionEndpoint = enablePrediction 
        ? "/eau-traite/by-zone/prediction" 
        : "/eau-traite/by-zone";
      
      const consumptionEndpoint = enablePrediction 
        ? "/eau-distribue/by-zone/prediction" 
        : "/eau-distribue/by-zone";
      
      console.log(`  - Production: ${productionEndpoint}`);
      console.log(`  - Consommation: ${consumptionEndpoint}`);
      
      // Récupérer les deux datasets en parallèle
      const [productionData, consumptionData] = await Promise.all([
        axiosClient.post(productionEndpoint, enhancedPayload),
        axiosClient.post(consumptionEndpoint, enhancedPayload)
      ]);
      
      // Fusionner les données avec un champ 'type' et 'isPrediction'
      const mergedData = [
        ...productionData.data.map(item => ({
          ...item,
          type: 'production',
          isPrediction: enablePrediction
        })),
        ...consumptionData.data.map(item => ({
          ...item,
          type: 'consumption',
          isPrediction: enablePrediction
        }))
      ];
      
      console.log(`✅ ${mergedData.length} éléments fusionnés (${productionData.data.length} prod + ${consumptionData.data.length} conso)`);
      
      return { data: mergedData };
    }
    
    // Type inconnu
    console.error('❌ Type inconnu:', type);
    return Promise.reject(new Error(`Type inconnu: ${type}`));
  },

  // Méthode utilitaire pour appeler directement les prédictions
  async getPredictionByZone(payload, type) {
    return this.getConsumptionByZone(payload, type, true);
  }
};

export default mapService;