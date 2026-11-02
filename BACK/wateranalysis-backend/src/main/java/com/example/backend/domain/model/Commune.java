package com.example.backend.domain.model;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.locationtech.jts.geom.MultiPolygon;

@Entity
@Table(name = "commune")
public class Commune {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_com")
    private Integer idCom;
    
    @Column(name = "code_dist", length = 20)
    private String codeDist;
    
    @Column(name = "code_com", length = 10, nullable = false)
    private String codeCom;
    
    @Column(name = "lib_com", length = 50)
    private String libCom;
    
    @Column(name = "cat_com", length = 30)
    private String catCom;
    
    @Column(name = "area_km2")
    private Double areaKm2;
    
    @Column(name = "nom_maire", length = 50)
    private String nomMaire;
    
    @Column(name = "nb_habitant")
    private Integer nbHabitant;
    
    @Column(name = "geom")
    @JsonIgnore
    private MultiPolygon geom;
    
    // Getters and setters
    public Integer getIdCom() { return idCom; }
    public void setIdCom(Integer idCom) { this.idCom = idCom; }
    
    public String getCodeDist() { return codeDist; }
    public void setCodeDist(String codeDist) { this.codeDist = codeDist; }
    
    public String getCodeCom() { return codeCom; }
    public void setCodeCom(String codeCom) { this.codeCom = codeCom; }
    
    public String getLibCom() { return libCom; }
    public void setLibCom(String libCom) { this.libCom = libCom; }
    
    public String getCatCom() { return catCom; }
    public void setCatCom(String catCom) { this.catCom = catCom; }
    
    public Double getAreaKm2() { return areaKm2; }
    public void setAreaKm2(Double areaKm2) { this.areaKm2 = areaKm2; }
    
    public String getNomMaire() { return nomMaire; }
    public void setNomMaire(String nomMaire) { this.nomMaire = nomMaire; }
    
    public Integer getNbHabitant() { return nbHabitant; }
    public void setNbHabitant(Integer nbHabitant) { this.nbHabitant = nbHabitant; }
    
    public MultiPolygon getGeom() { return geom; }
    public void setGeom(MultiPolygon geom) { this.geom = geom; }
}