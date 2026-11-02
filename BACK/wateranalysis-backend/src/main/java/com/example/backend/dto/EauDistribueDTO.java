package com.example.backend.dto;
import java.time.LocalDate;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Données de consommation d'eau distribuée")
public class EauDistribueDTO {
    @Schema(description = "ID de la zone", example = "zone_123")
    private String zoneId;
    
    @Schema(description = "Nom de la zone", example = "Zone A")
    private String zoneName;
    
    @Schema(description = "ID du point de traitement", example = "1")
    private Integer idStation;
    
    @Schema(description = "Quantité d'eau traitée (m³)", example = "1500.5")
    private Double quantite;
    
    @Schema(description = "Date de production", example = "2024-01-15")
    private LocalDate date;
    
    // Constructeurs
    public EauDistribueDTO() {}
    
    public EauDistribueDTO(String zoneId, String zoneName, Integer idStation, 
                        Double quantite, LocalDate date) {
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.idStation = idStation;
        this.quantite = quantite;
        this.date = date;
    }
    
    // Getters et Setters
    public String getZoneId() { return zoneId; }
    public void setZoneId(String zoneId) { this.zoneId = zoneId; }
    
    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }
    
    public Integer getIdStation() { return idStation; }
    public void setIdStation(Integer idStation) { 
        this.idStation = idStation; 
    }
    
    public Double getQuantite() { return quantite; }
    public void setQuantite(Double quantite) { this.quantite = quantite; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}