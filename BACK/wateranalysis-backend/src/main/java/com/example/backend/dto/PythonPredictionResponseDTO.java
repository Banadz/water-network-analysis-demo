package com.example.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.ToString;

/**
 * DTO pour recevoir les réponses de prédiction de l'API Python
 * Format reçu de Python:
 * {
 *   "zone_id": "string",
 *   "total_predicted_consumption": 0,
 *   "monthly_predictions": [...],
 *   "nodes_count": 0,
 *   "clusters_used": [0]
 * }
 */
@Schema(description = "Réponse de prédiction reçue de l'API Python")
@Data
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class PythonPredictionResponseDTO {
    
    @Schema(description = "ID de la zone", example = "zone_123")
    @JsonProperty("zone_id")
    private String zoneId;
    
    @Schema(description = "Consommation totale prédite", example = "15000.5")
    @JsonProperty("total_predicted_consumption")
    private Double totalPredictedConsumption;
    
    @Schema(description = "Liste des prédictions mensuelles")
    @JsonProperty("monthly_predictions")
    private List<MonthlyPrediction> monthlyPredictions;
    
    @Schema(description = "Nombre de nœuds utilisés", example = "5")
    @JsonProperty("nodes_count")
    private Integer nodesCount;
    
    @Schema(description = "Clusters utilisés pour la prédiction", example = "[1, 2, 3]")
    @JsonProperty("clusters_used")
    private List<Integer> clustersUsed;
    
    // Constructeurs
    public PythonPredictionResponseDTO() {}
    
    // Getters et Setters
    public String getZoneId() { return zoneId; }
    public void setZoneId(String zoneId) { this.zoneId = zoneId; }
    
    public Double getTotalPredictedConsumption() { return totalPredictedConsumption; }
    public void setTotalPredictedConsumption(Double totalPredictedConsumption) { 
        this.totalPredictedConsumption = totalPredictedConsumption; 
    }
    
    public List<MonthlyPrediction> getMonthlyPredictions() { return monthlyPredictions; }
    public void setMonthlyPredictions(List<MonthlyPrediction> monthlyPredictions) { 
        this.monthlyPredictions = monthlyPredictions; 
    }
    
    public Integer getNodesCount() { return nodesCount; }
    public void setNodesCount(Integer nodesCount) { this.nodesCount = nodesCount; }
    
    public List<Integer> getClustersUsed() { return clustersUsed; }
    public void setClustersUsed(List<Integer> clustersUsed) { this.clustersUsed = clustersUsed; }
    
    /**
     * Classe interne représentant une prédiction mensuelle
     */
    @Schema(description = "Prédiction pour une date donnée")
    @Data
    @ToString
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MonthlyPrediction {
        
        @Schema(description = "Date de la prédiction", example = "2024-01-15")
        private String date;
        
        @Schema(description = "Consommation prédite pour cette date", example = "1234.5")
        @JsonProperty("predicted_consumption")
        private Double predictedConsumption;

        @Schema(description = "Identification de noeuds de consommation", example = "15")
        @JsonProperty("idStation")
        private Integer idStation;
        
        // Constructeurs
        public MonthlyPrediction() {}
        
        public MonthlyPrediction(String date, Double predictedConsumption, Integer idStation) {
            this.date = date;
            this.predictedConsumption = predictedConsumption;
            this.idStation = idStation;
        }
        
        // Getters et Setters
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        
        public Double getPredictedConsumption() { return predictedConsumption; }
        public void setPredictedConsumption(Double predictedConsumption) { 
            this.predictedConsumption = predictedConsumption; 
        }
    }
}