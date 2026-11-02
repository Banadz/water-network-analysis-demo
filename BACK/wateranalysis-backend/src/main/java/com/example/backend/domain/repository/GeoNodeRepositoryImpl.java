package com.example.backend.domain.repository;

import com.example.backend.utils.GeoJsonUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Array;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class GeoNodeRepositoryImpl implements GeoNodeRepository {

    private final JdbcTemplate jdbcTemplate;

    public static class NodeConsumption {

        private final String nodeId;
        private final List<Double> recentSeries;

        public NodeConsumption(String nodeId, List<Double> recentSeries) {
            this.nodeId = nodeId;
            this.recentSeries = recentSeries;
        }

        public String getNodeId() {
            return nodeId;
        }

        public List<Double> getRecentSeries() {
            return recentSeries;
        }
    }

    @Override
    public List<NodeConsumption> findLast12ConsumptionPerNodeInZone(
            List<double[]> geoJson,
            LocalDate predictionDate
    ) {

        String polygonEwkt = GeoJsonUtils.convertToEwktPolygon(geoJson);

        String sql = """
            WITH zone AS (
                SELECT ST_GeomFromEWKT(?) AS geom
            ),

            nodes_in_zone AS (
                SELECT DISTINCT nc.id_noeud_cons
                FROM noeud_consommation nc
                JOIN zone z
                    ON ST_Intersects(
                        ST_Transform(nc.geom, 4326),
                        z.geom
                    )
            ),

            monthly_consumption AS (
                SELECT
                    nc.id_noeud_cons,
                    date_trunc('month', ed.date) AS consommation_month,
                    SUM(ed.quantite) AS y
                FROM noeud_consommation nc
                JOIN point_de_distribution pd
                    ON pd.id_noeud_cons = nc.id_noeud_cons
                JOIN eau_distribue ed
                    ON ed.id_point_dist = pd.id_point_dist
                JOIN nodes_in_zone nz
                    ON nc.id_noeud_cons = nz.id_noeud_cons
                WHERE ed.date < ?
                AND ed.date >= (? - INTERVAL '12 months')
                GROUP BY
                    nc.id_noeud_cons,
                    consommation_month
            )

            SELECT
                id_noeud_cons AS node_id,
                ARRAY_AGG(y ORDER BY consommation_month ASC) AS recent_series
            FROM monthly_consumption
            GROUP BY id_noeud_cons
            HAVING COUNT(*) = 12
            ORDER BY id_noeud_cons
        """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {

                    String nodeId = rs.getString("node_id");

                    Array sqlArray = rs.getArray("recent_series");
                    Object[] values = (Object[]) sqlArray.getArray();

                    List<Double> series = new ArrayList<>();

                    for (Object v : values) {
                        series.add(((Number) v).doubleValue());
                    }

                    return new NodeConsumption(nodeId, series);
                },
                polygonEwkt,
                predictionDate,
                predictionDate
        );
    }

    /**
     * Production nodes dans la zone
     */
    @Override
    public List<String> findProductionNodesInZone(List<double[]> geoJson) {

        String geoJsonString = GeoJsonUtils.convertToEwktPolygon(geoJson);

        String sql = """
            SELECT DISTINCT id_point_traitement
            FROM point_traitement
            WHERE ST_Within(
                geom,
                ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)
            )
        """;

        return jdbcTemplate.queryForList(
                sql,
                String.class,
                geoJsonString
        );
    }
}