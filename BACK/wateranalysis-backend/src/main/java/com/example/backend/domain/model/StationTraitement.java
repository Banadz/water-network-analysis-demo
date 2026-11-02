package com.example.backend.domain.model;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "station_traitement")
public class StationTraitement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_station")
    private Integer idStation;
    
    @Column(name = "libelle", length = 50)
    private String libelle;
    
    @Column(name = "elevation")
    private Double elevation;
    
    @Column(name = "decanteurs")
    private Double decanteurs;
    
    @Column(name = "filtres")
    private Double filtres;
    
    @Column(name = "capacite")
    private Double capacite;
    
    @Column(name = "geom")
    @JsonIgnore
    private Point geom;
    
    @Column(name = "id_quartier")
    private Integer idQuartier;
    
    // Getters and setters
    public Integer getIdStation() { return idStation; }
    public void setIdStation(Integer idStation) { this.idStation = idStation; }
    
    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
    
    public Double getElevation() { return elevation; }
    public void setElevation(Double elevation) { this.elevation = elevation; }
    
    public Double getDecanteurs() { return decanteurs; }
    public void setDecanteurs(Double decanteurs) { this.decanteurs = decanteurs; }
    
    public Double getFiltres() { return filtres; }
    public void setFiltres(Double filtres) { this.filtres = filtres; }
    
    public Double getCapacite() { return capacite; }
    public void setCapacite(Double capacite) { this.capacite = capacite; }
    
    public Point getGeom() { return geom; }
    public void setGeom(Point geom) { this.geom = geom; }
    
    public Integer getIdQuartier() { return idQuartier; }
    public void setIdQuartier(Integer idQuartier) { this.idQuartier = idQuartier; }
}