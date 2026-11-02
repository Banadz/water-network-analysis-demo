package com.example.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO pour envoyer les requêtes de prédiction à l'API Python
 * Format attendu par Python:
 * {
 *   "zones": [...],
 *   "prediction_type": "consumption" | "production"
 * }
 */
@Schema(description = "Requête de prédiction envoyée à l'API Python")
public class PythonPredictionRequestDTO {
    
    @Schema(description = "Liste des zones pour lesquelles prédire")
    private List<ZoneRequest> zones;
    
    @Schema(description = "Type de prédiction", example = "consumption")
    @JsonProperty("prediction_type")
    private String predictionType; // "consumption" ou "production"
    
    // Constructeurs
    public PythonPredictionRequestDTO() {}
    
    public PythonPredictionRequestDTO(List<ZoneRequest> zones, String predictionType) {
        this.zones = zones;
        this.predictionType = predictionType;
    }
    
    // Getters et Setters
    public List<ZoneRequest> getZones() { return zones; }
    public void setZones(List<ZoneRequest> zones) { this.zones = zones; }
    
    public String getPredictionType() { return predictionType; }
    public void setPredictionType(String predictionType) { this.predictionType = predictionType; }
    
    /**
     * Classe interne représentant une zone dans la requête Python
     */
    @Schema(description = "Détails d'une zone pour la prédiction")
    public static class ZoneRequest {
        
        @Schema(description = "ID de la zone", example = "zone_123")
        @JsonProperty("zone_id")
        private String zoneId;
        
        @Schema(description = "Liste des IDs des nœuds dans cette zone", example = "[\"node_1\", \"node_2\"]")
        @JsonProperty("nodes")
        private List<NodeRequest> nodes;
        
        @Schema(description = "Période de prédiction")
        @JsonProperty("prediction_period")
        private PredictionPeriod predictionPeriod;
        
        // Constructeurs
        public ZoneRequest() {}
        
        public ZoneRequest(String zoneId, List<NodeRequest> nodes, PredictionPeriod predictionPeriod) {
            this.zoneId = zoneId;
            this.nodes = nodes;
            this.predictionPeriod = predictionPeriod;
        }
        
        // Getters et Setters
        public String getZoneId() { return zoneId; }
        public void setZoneId(String zoneId) { this.zoneId = zoneId; }
        
        public List<NodeRequest> getNodes() { return nodes; }
        public void setNodes(List<NodeRequest> nodes) { this.nodes = nodes; }
        
        public PredictionPeriod getPredictionPeriod() { return predictionPeriod; }
        public void setPredictionPeriod(PredictionPeriod predictionPeriod) { 
            this.predictionPeriod = predictionPeriod; 
        }
        @Schema(description = "Noeud de consommation")
        public class NodeRequest {

            @JsonProperty("node_id")
            private String nodeId;

            @Schema(description = "12 dernières valeurs mensuelles")
            @JsonProperty("recent_series")
            private List<Double> recentSeries;

            public NodeRequest() {};
            public NodeRequest(String nodeId, List<Double> recentSeries) {
                this.nodeId = nodeId;
                this.recentSeries = recentSeries;
            }
            // Getters et Setters
            public String getNodeId() { return nodeId; }
            public void setNodeId(String nodeId) { this.nodeId = nodeId; }
            public List<Double> getRecentSeries() { return recentSeries; }
            public void setRecentSeries(List<Double> recentSeries) { this.recentSeries = recentSeries; }

        }

    }
    
    /**
     * Classe interne représentant une période de prédiction
     */
    @Schema(description = "Période de prédiction")
    public static class PredictionPeriod {
        
        @Schema(description = "Date de début", example = "2024-01-01")
        private String start;
        
        @Schema(description = "Date de fin", example = "2024-12-31")
        private String end;
        
        // Constructeurs
        public PredictionPeriod() {}
        
        public PredictionPeriod(String start, String end) {
            this.start = start;
            this.end = end;
        }
        
        // Getters et Setters
        public String getStart() { return start; }
        public void setStart(String start) { this.start = start; }
        
        public String getEnd() { return end; }
        public void setEnd(String end) { this.end = end; }
    }
}