package com.example.backend.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "eau_distribue")
public class EauDistribue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_distr_ep")
    private Integer idDistEd;
    
    @Column(name = "quantite")
    private Double quantite;
    
    @Column(name = "date")
    private LocalDate date;
    
    @Column(name = "id_poin_dist")
    private Integer idPointDist;
    
    // Getters and setters
    public Integer getIdDistEd() { return idDistEd; }
    public void setIdDistEd(Integer idDistEd) { this.idDistEd = idDistEd; }
    
    public Double getQuantite() { return quantite; }
    public void setQuantite(Double quantite) { this.quantite = quantite; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public Integer getIdPointDist() { return idPointDist; }
    public void setIdPointDist(Integer idPointDist) { this.idPointDist = idPointDist; }
}