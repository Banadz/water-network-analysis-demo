package com.example.backend.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.locationtech.jts.geom.MultiPolygon;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "captage")
public class Captage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_capt")
    private Integer idCapt;
    
    @Column(name = "libelle_capt", length = 50)
    private String libelleCapt;
    
    @Column(name = "type_capt", length = 60)
    private String typeCapt;
    
    @Column(name = "debit_capt")
    private Double debitCapt;
    
    @Column(name = "date_mes")
    private LocalDate dateMes;
    
    @Column(name = "geom")
    @JsonIgnore
    private MultiPolygon geom;
    
    @Column(name = "id_quartier")
    private Integer idQuartier;
    
    // Getters and setters
    public Integer getIdCapt() { return idCapt; }
    public void setIdCapt(Integer idCapt) { this.idCapt = idCapt; }
    
    public String getLibelleCapt() { return libelleCapt; }
    public void setLibelleCapt(String libelleCapt) { this.libelleCapt = libelleCapt; }
    
    public String getTypeCapt() { return typeCapt; }
    public void setTypeCapt(String typeCapt) { this.typeCapt = typeCapt; }
    
    public Double getDebitCapt() { return debitCapt; }
    public void setDebitCapt(Double debitCapt) { this.debitCapt = debitCapt; }
    
    public LocalDate getDateMes() { return dateMes; }
    public void setDateMes(LocalDate dateMes) { this.dateMes = dateMes; }
    
    public MultiPolygon getGeom() { return geom; }
    public void setGeom(MultiPolygon geom) { this.geom = geom; }
    
    public Integer getIdQuartier() { return idQuartier; }
    public void setIdQuartier(Integer idQuartier) { this.idQuartier = idQuartier; }
}