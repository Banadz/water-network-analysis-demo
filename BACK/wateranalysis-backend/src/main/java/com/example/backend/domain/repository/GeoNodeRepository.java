package com.example.backend.domain.repository;

import java.time.LocalDate;
import java.util.List;

public interface GeoNodeRepository {

    /**
     * Retourne les 12 dernières consommations par nœud dans la zone
     */
    List<GeoNodeRepositoryImpl.NodeConsumption> findLast12ConsumptionPerNodeInZone(
            List<double[]> geoJson,
            LocalDate predictionDate
    );

    /**
     * Nœuds de production dans la zone
     */
    List<String> findProductionNodesInZone(List<double[]> geoJson);
}