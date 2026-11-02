package com.example.backend.service;

import com.example.backend.dto.EauDistribueDTO;
import com.example.backend.dto.QueryRequestDTO;
import com.example.backend.domain.repository.EauDistribueRepository;
import com.example.backend.utils.GeoJsonUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EauDistribueService {

    private static final Logger logger = LoggerFactory.getLogger(EauDistribueService.class);
    private final EauDistribueRepository eauDistribueRepository;

    public EauDistribueService(EauDistribueRepository eauDistribueRepository) {
        this.eauDistribueRepository = eauDistribueRepository;
    }

    public List<EauDistribueDTO> getEauDistribueByZone(List<QueryRequestDTO> queryRequests) {
        List<EauDistribueDTO> allResults = new ArrayList<>();

        for (QueryRequestDTO queryRequest : queryRequests) {
            try {
                // convert zoneId and zoneName to String
                String zoneIdStr = GeoJsonUtils.convertTxtObjToString(queryRequest.getZoneId());
                String zoneNameStr = GeoJsonUtils.convertTxtObjToString(queryRequest.getZoneName());

                // Extract coordinates flexibly
                List<double[]> polygonCoordinates = GeoJsonUtils.extractCoordinatesFlexible(queryRequest.getCoordinates());

                logger.info("Processing zone: {}, coordinates count: {}", zoneIdStr, polygonCoordinates.size());

                List<EauDistribueDTO> results = eauDistribueRepository.findEauDistribueByZoneAndDate(
                    zoneIdStr,
                    zoneNameStr,
                    polygonCoordinates,
                    queryRequest.getDateDebut() != null ? queryRequest.getDateDebut().toString() : null,
                    queryRequest.getDateFin() != null ? queryRequest.getDateFin().toString() : null
                );

                allResults.addAll(results);
            } catch (Exception e) {
                logger.error("Error processing request: {}", e.getMessage(), e);
                throw new IllegalArgumentException("Error processing zone: " + e.getMessage());
            }
        }

        return allResults;
    }

}