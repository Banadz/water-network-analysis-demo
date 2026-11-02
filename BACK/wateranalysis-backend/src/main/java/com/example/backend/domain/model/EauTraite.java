package com.example.backend.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "eau_traite")
public class EauTraite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prod_et")
    private Integer idProdEt;
    
    @Column(name = "quantite")
    private Double quantite;
    
    @Column(name = "date")
    private LocalDate date;
    
    @Column(name = "id_station")
    private Integer idStation;
    
    // Getters and setters
    public Integer getIdProdEt() { return idProdEt; }
    public void setIdProdEt(Integer idProdEt) { this.idProdEt = idProdEt; }
    
    public Double getQuantite() { return quantite; }
    public void setQuantite(Double quantite) { this.quantite = quantite; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public Integer getIdStation() { return idStation; }
    public void setIdStation(Integer idStation) { this.idStation = idStation; }
}