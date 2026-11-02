package com.example.backend.domain.repository;

import com.example.backend.dto.EauTraiteDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Repository
public class EauTraiteRepositoryImpl implements EauTraiteRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<EauTraiteDTO> findEauTraiteByZoneAndDate(String zoneId,
                                                        String zoneName,
                                                        List<double[]> polygonCoordinates,
                                                        String dateDebut,
                                                        String dateFin) {
        if (polygonCoordinates == null || polygonCoordinates.size() < 3) {
            throw new IllegalArgumentException("Polygon must have at least 3 points");
        }                                                    
        // transform coordinates to EWKT polygon
        String polygonEwkt = convertToEwktPolygon(polygonCoordinates);
        String sql = """
            WITH zone AS (
                SELECT ST_GeomFromEWKT(:polygonEwkt) AS geom
            )
            SELECT 
                et.id_station,
                et.quantite,
                et.date
            FROM eau_traite et
            JOIN station_traitement st 
              ON et.id_station = st.id_station
            JOIN zone z 
              ON ST_Intersects(ST_Transform(st.geom, 4326), z.geom)
            WHERE et.date BETWEEN :dateDebut AND :dateFin;
            """;

        Query query = entityManager.createNativeQuery(sql);
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

            return new EauTraiteDTO(
                zoneId,                                                         // zoneId
                zoneName,                                                       // zoneName
                ((Number) result[0]).intValue(),                                // id_station
                result[1] != null ? ((Number) result[1]).doubleValue() : 0.0,   //quantite
                date                                                            // date
            );
        }).toList();
    }

    /**
     * convert list of coordinates to EWKT polygon string
     */
    private String convertToEwktPolygon(List<double[]> coordinates) {
        if (coordinates == null || coordinates.isEmpty()) {
            throw new IllegalArgumentException("Coordinates cannot be null or empty");
        }

        StringBuilder ewktBuilder = new StringBuilder("SRID=4326;POLYGON((");

        for (int i = 0; i < coordinates.size(); i++) {
            double[] coord = coordinates.get(i);
            if (coord.length < 2) {
                throw new IllegalArgumentException("Each coordinate must have at least 2 values");
            }
            ewktBuilder.append(coord[0]).append(" ").append(coord[1]);

            if (i < coordinates.size() - 1) {
                ewktBuilder.append(", ");
            }
        }

        // close the polygon by repeating the first coordinate
        double[] firstCoord = coordinates.get(0);
        ewktBuilder.append(", ").append(firstCoord[0]).append(" ").append(firstCoord[1]);

        ewktBuilder.append("))");
        return ewktBuilder.toString();
    }
}
