package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.domain.repository.GeoNodeRepositoryImpl;
import com.example.backend.python.PythonPredictionClient;
import com.example.backend.utils.GeoJsonUtils;
import com.example.backend.mapper.PredictionMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final GeoNodeRepositoryImpl geoRepo;
    private final PythonPredictionClient pythonClient;

    public List<EauDistribueDTO> getConsumptionPredictions(
            List<QueryRequestDTO> queryRequests
    ) {

        List<PythonPredictionRequestDTO.ZoneRequest> zones = new ArrayList<>();

        String predictionType = "consumption";

        for (var query : queryRequests) {

            List<double[]> geoJson =
                    GeoJsonUtils.extractCoordinatesFlexible(query.getCoordinates());

            LocalDate predictionDate = query.getDateDebut();

            List<GeoNodeRepositoryImpl.NodeConsumption> nodes =
                    geoRepo.findLast12ConsumptionPerNodeInZone(
                            geoJson,
                            predictionDate
                    );
            var zone = new PythonPredictionRequestDTO.ZoneRequest();
            zone.setZoneId(query.getZoneId().toString());

            List<PythonPredictionRequestDTO.ZoneRequest.NodeRequest> nodeRequests =
                    new ArrayList<>();

            for (var node : nodes) {

                if (node.getRecentSeries().size() != 12)
                    continue;

                var nodeReq = zone.new NodeRequest();

                nodeReq.setNodeId(node.getNodeId());
                nodeReq.setRecentSeries(node.getRecentSeries());

                nodeRequests.add(nodeReq);
            }

            zone.setNodes(nodeRequests);

            var period = new PythonPredictionRequestDTO.PredictionPeriod();

            period.setStart(query.getDateDebut().toString());
            period.setEnd(query.getDateFin().toString());

            zone.setPredictionPeriod(period);

            zones.add(zone);

            predictionType = computePredictionType(
                    query.getDateDebut(),
                    query.getDateFin()
            );
        }

        var pythonReq = new PythonPredictionRequestDTO();

        pythonReq.setZones(zones);
        pythonReq.setPredictionType(predictionType);

        var pythonResp = pythonClient.predict(
                "consumption",
                pythonReq
        );

        return PredictionMapper.toConsumption(
                pythonResp,
                queryRequests
        );
    }

    /**
     * Calcul du prediction_type attendu par l'API Python
     */
    private String computePredictionType(
            LocalDate start,
            LocalDate end
    ) {

        long months = ChronoUnit.MONTHS.between(start, end);

        if (months <= 1)
            return "consumption_1m";

        if (months == 2)
            return "consumption_2m";

        if (months >= 3)
            return "consumption_3m";

        return "consumption";
    }

    public java.util.Map<String, Object> checkHealth() {
        return pythonClient.healthCheck();
    }
}