package com.example.backend.domain.repository;

import com.example.backend.dto.EauDistribueDTO;
import com.example.backend.utils.GeoJsonUtils;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Repository
public class EauDistribueRepositoryImpl implements EauDistribueRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<EauDistribueDTO> findEauDistribueByZoneAndDate(String zoneId,
                                                            String zoneName,
                                                            List<double[]> polygonCoordinates,
                                                            String dateDebut,
                                                            String dateFin) {
        if (polygonCoordinates == null || polygonCoordinates.size() < 3) {
            throw new IllegalArgumentException("Polygon must have at least 3 points");
        }                                                            
        // Transform coordinates to EWKT polygon
        String polygonEwkt = GeoJsonUtils.convertToEwktPolygon(polygonCoordinates);
        String sqlu = """
                WITH zone AS (
                    SELECT ST_GeomFromEWKT(:polygonEwkt) AS geom
                )
                SELECT
                    nc.id_noeud_cons AS id_station,
                    SUM(ed.quantite) AS consommation_journaliere,
                    ed.date
                FROM noeud_consommation nc
                JOIN point_de_distribution pd
                    ON pd.id_noeud_cons = nc.id_noeud_cons
                JOIN eau_distribue ed
                    ON ed.id_point_dist = pd.id_point_dist
                JOIN zone z
                    ON ST_Intersects(
                        ST_Transform(nc.geom, 4326),
                        z.geom
                    )
                WHERE ed.date BETWEEN :dateDebut AND :dateFin
                GROUP BY ed.date, nc.id_noeud_cons
                ORDER BY ed.date, nc.id_noeud_cons;
            """;

        Query query = entityManager.createNativeQuery(sqlu);
        query.setParameter("polygonEwkt", polygonEwkt);
        query.setParameter("dateDebut", java.sql.Date.valueOf(dateDebut));
        query.setParameter("dateFin", java.sql.Date.valueOf(dateFin));

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        return results.stream().map(result -> {
            LocalDate date;
            if (result[2] instanceof java.sql.Date sqlDate) {
                date = sqlDate.toLocalDate();
            } else if (result[2] instanceof java.util.Date utilDate) {
                date = utilDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            } else if (result[2] instanceof String strDate) {
                date = LocalDate.parse(strDate);
            } else {
                throw new IllegalStateException("Unsupported date type: " + result[2].getClass());
            }

            return new EauDistribueDTO(
                zoneId,                                          // zoneId
                zoneName,                                        // zoneName
                ((Number) result[0]).intValue(),                        // id_station
                result[1] != null ? ((Number) result[1]).doubleValue() : 0.0,              // quantite
                date                                            // date
            );
        }).toList();
    }
}
