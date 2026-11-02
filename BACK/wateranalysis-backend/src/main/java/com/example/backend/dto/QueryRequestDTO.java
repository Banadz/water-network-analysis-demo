package com.example.backend.dto;

import java.time.LocalDate;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@Schema(description = "Données de réponse pour une requête ")
public class QueryRequestDTO {
    @Schema(description = "ID de la zone", example = "123")
    private Object zoneId;

    @Schema(description="Nom de la zone", example="Zone A")
    private Object zoneName;

    @Schema(description = "Coordonnées géographiques au format GeoJSON", example = "{\"type\":\"Polygon\",\"coordinates\":[[[...]]]}")
    private Object coordinates;   
    
    @Schema(description = "Date de début du filtre (optionnel)", example = "2023-01-01")
    private LocalDate dateDebut;
    
    @Schema(description = "Date de fin du filtre (optionnel)", example = "2023-12-31")
    private LocalDate dateFin;

    @Schema(description = "Activer la prédiction", example = "true")
    private Boolean enablePrediction;

    public QueryRequestDTO() {}

    public QueryRequestDTO(Object zoneId, Object zoneName, Object coordinates,
                           LocalDate dateDebut, LocalDate dateFin, Double quantiteMin, Boolean enablePrediction) {
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.coordinates = coordinates;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.enablePrediction = enablePrediction;
    }

    public Object getZoneId() { return zoneId; }
    public void setZoneId(Object zoneId) { this.zoneId = zoneId; }

    public Object getZoneName() { return zoneName; }
    public void setZoneName(Object zoneName) { this.zoneName = zoneName; }

    public Object getCoordinates() { return coordinates; }
    public void setCoordinates(Object coordinates) { this.coordinates = coordinates; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public Boolean getEnablePrediction() { return enablePrediction; }
    public void setEnablePrediction(Boolean enablePrediction) { this.enablePrediction = enablePrediction; }
}
