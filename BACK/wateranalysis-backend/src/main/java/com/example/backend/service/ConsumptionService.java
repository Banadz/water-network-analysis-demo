package com.example.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.domain.repository.ConsumptionRepository;
import com.example.backend.dto.ZoneConsumptionDTO;

@Service
public class ConsumptionService {
    private final ConsumptionRepository consumptionRepository;

    public ConsumptionService(ConsumptionRepository consumptionRepository) {
        this.consumptionRepository = consumptionRepository;
    }

    public List<ZoneConsumptionDTO> getConsumptionByZone(LocalDate startDate, LocalDate endDate){
        List<ZoneConsumptionDTO> allResults = new ArrayList<>();

        try {
            // Default dates if null
            if (startDate == null) {
                startDate = LocalDate.now().minusYears(5);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }

            // Validate dates
            if (startDate.isAfter(endDate)) {
                throw new IllegalArgumentException("Start date cannot be after end date");
            }
            
            List<ZoneConsumptionDTO> results = consumptionRepository.getAllConsumptionByZone(startDate, endDate);
            allResults.addAll(results);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error processing zone: " + e.getMessage());
        }
        return allResults;
    }
}