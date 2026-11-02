package com.example.backend.service;

import com.example.backend.dto.EauTraiteDTO;
import com.example.backend.dto.QueryRequestDTO;
import com.example.backend.domain.repository.EauTraiteRepository;
import com.example.backend.utils.GeoJsonUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EauTraiteService {

    private static final Logger logger = LoggerFactory.getLogger(EauTraiteService.class);
    private final EauTraiteRepository eauTraiteRepository;

    public EauTraiteService(EauTraiteRepository eauTraiteRepository) {
        this.eauTraiteRepository = eauTraiteRepository;
    }

    public List<EauTraiteDTO> getEauTraiteByZone(List<QueryRequestDTO> queryRequests) {
        List<EauTraiteDTO> allResults = new ArrayList<>();

        for (QueryRequestDTO queryRequest : queryRequests) {
            try {
                // Convert zoneId and zoneName to String
                String zoneIdStr = GeoJsonUtils.convertTxtObjToString(queryRequest.getZoneId());
                String zoneNameStr = GeoJsonUtils.convertTxtObjToString(queryRequest.getZoneName());

                // Extract coordinates flexibly
                List<double[]> polygonCoordinates = GeoJsonUtils.extractCoordinatesFlexible(queryRequest.getCoordinates());
                logger.info("Processing zone: {}, coordinates count: {}", zoneIdStr, polygonCoordinates.size());

                List<EauTraiteDTO> results = eauTraiteRepository.findEauTraiteByZoneAndDate(
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