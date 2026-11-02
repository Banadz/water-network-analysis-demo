package com.example.backend.mapper;

import com.example.backend.dto.*;
import com.example.backend.utils.GeoJsonUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class PredictionMapper {

    /**
     * Normalisation des identifiants provenant du Python
     * (supprime espaces, guillemets, etc.)
     */
    private static String normalize(String s) {
        return (s == null) ? null : s.trim().replace("\"", "");
    }

    // =========================================================================
    //                      MAPPING CONSOMMATION
    // =========================================================================
    public static List<EauDistribueDTO> toConsumption(
            List<PythonPredictionResponseDTO> responses,
            List<QueryRequestDTO> originalRequests
    ) {

        var results = new ArrayList<EauDistribueDTO>();

        // Map de sécurité : clé = zoneId normalisé
        var requestMap = originalRequests.stream()
                .collect(Collectors.toMap(
                        req -> normalize(req.getZoneId().toString()),
                        req -> req
                ));      
        for (var resp : responses) {

            // Zone ID retourné par Python
            String zoneId = normalize(
                GeoJsonUtils.convertTxtObjToString(resp.getZoneId())
            );

            QueryRequestDTO linkedRequest = requestMap.get(zoneId);

            if (linkedRequest == null) {
                throw new IllegalStateException(
                    "Zone ID '" + zoneId + "' not found in originalRequests"
                );
            }

            String zoneName = linkedRequest.getZoneName().toString();

            for (var pred : resp.getMonthlyPredictions()) {

                var dto = new EauDistribueDTO();
                dto.setZoneId(zoneId);
                dto.setZoneName(zoneName);
                dto.setIdStation(pred.getIdStation());
                dto.setDate(LocalDate.parse(pred.getDate()));
                dto.setQuantite(pred.getPredictedConsumption());

                results.add(dto);
            }
        }

        return results;
    }

    // =========================================================================
    //                        MAPPING PRODUCTION
    // =========================================================================
    public static List<EauTraiteDTO> toProduction(
            List<PythonPredictionResponseDTO> responses,
            List<QueryRequestDTO> originalRequests
    ) {
        var results = new ArrayList<EauTraiteDTO>();

        // Map de sécurité : clé = zoneId normalisé
        var requestMap = originalRequests.stream()
                .collect(Collectors.toMap(
                        req -> normalize(req.getZoneId().toString()),
                        req -> req
                ));

        for (var resp : responses) {

            String zoneId = normalize(resp.getZoneId());

            QueryRequestDTO linkedRequest = requestMap.get(zoneId);

            if (linkedRequest == null) {
                throw new IllegalStateException(
                        "Zone ID '" + zoneId + "' not found in originalRequests"
                );
            }

            String zoneName = linkedRequest.getZoneName().toString();

            for (var pred : resp.getMonthlyPredictions()) {

                var dto = new EauTraiteDTO();
                dto.setZoneId(zoneId);
                dto.setZoneName(zoneName);
                dto.setDate(LocalDate.parse(pred.getDate()));
                dto.setQuantite(pred.getPredictedConsumption());

                results.add(dto);
            }
        }

        return results;
    }
}
