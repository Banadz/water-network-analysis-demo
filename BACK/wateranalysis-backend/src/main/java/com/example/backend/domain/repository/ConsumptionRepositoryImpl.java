package com.example.backend.domain.repository;

import java.util.List;

import java.time.LocalDate;
import org.springframework.stereotype.Repository;

import com.example.backend.dto.ZoneConsumptionDTO;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

@Repository
public class ConsumptionRepositoryImpl implements ConsumptionRepository{
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<ZoneConsumptionDTO> getAllConsumptionByZone(LocalDate startDate, LocalDate endDate){
        
        // use default dates if null
        LocalDate finalStartDate = startDate != null ? startDate : LocalDate.now().minusYears(1);
        LocalDate finalEndDate = endDate != null ? endDate : LocalDate.now();

        String sql = """
        SELECT 
            CAST(q.id_quartier AS TEXT) as zoneId,
            CAST(q.lib_quartier AS TEXT) as zoneName,
            ST_AsGeoJSON(ST_Transform(q.geom, 4326)) as geometry,
            SUM(ed.quantite * 1000) as totalConsumption,
            COALESCE(q.nb_habitant, 0) as nombreHabitant           
        FROM quartier q
        JOIN point_de_distribution pdd
            ON q.id_quartier = pdd.id_quartier
        JOIN noeud_consommation nc
            ON pdd.id_noeud_cons = nc.id_noeud_cons
        JOIN eau_distribue ed
            ON pdd.id_point_dist = ed.id_point_dist
        WHERE 
            ed.date BETWEEN :startDate AND :endDate                                      
        GROUP BY 
            q.id_quartier,
            q.lib_quartier,
            q.nb_habitant
        ORDER BY
            totalConsumption
        DESC;
        """;
                
        Query query = entityManager.createNativeQuery(sql);
        
        query.setParameter("startDate", finalStartDate);
        query.setParameter("endDate", finalEndDate);
        
        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        return results.stream().map(result -> {
            return new ZoneConsumptionDTO(
                ((String) result[0]),                   
                ((String) result[1]),                   
                ((String) result[2]), 
                ((Number) result[3]).doubleValue(),     
                ((Number) result[4]).intValue()         
            );
        }).toList();
    }
}
