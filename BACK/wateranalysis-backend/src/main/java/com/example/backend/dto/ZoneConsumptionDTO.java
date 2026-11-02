package com.example.backend.dto;

public class ZoneConsumptionDTO {
    private String zoneId;
    private String zoneName;
    private String geometry;
    private Double totalConsumption;
    private Integer nombreHabitant;

    public ZoneConsumptionDTO() {}
    
    public ZoneConsumptionDTO(String zoneId, String zoneName, String geometry, Double totalConsumption, Integer nombreHabitant ) {
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.geometry = geometry;
        this.totalConsumption = totalConsumption;
        this.nombreHabitant = nombreHabitant;
    }

    public String getZoneId() {
        return zoneId;
    }
    public void setZoneId(String zoneId) {
        this.zoneId = zoneId;
    }
    public String getZoneName() {
        return zoneName;
    }
    public void setZoneName(String zoneName) {
        this.zoneName = zoneName;
    }
    public String getGeometry() {
        return geometry;
    }
    public void setGeometry(String geometry) {
        this.geometry = geometry;
    }
    public Double getTotalConsumption() {   
        return totalConsumption;
    }
    public void setTotalConsumption(Double totalConsumption) {
        this.totalConsumption = totalConsumption;
    }
    public Integer getNombreHabitant() {
        return nombreHabitant;
    }
    public void setNombreHabitant(Integer nombreHabitant){
        this.nombreHabitant = nombreHabitant;
    }
}