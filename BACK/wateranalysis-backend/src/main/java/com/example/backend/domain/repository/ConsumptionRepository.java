package com.example.backend.domain.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.backend.dto.ZoneConsumptionDTO;

@Repository
public interface ConsumptionRepository {
    List<ZoneConsumptionDTO> getAllConsumptionByZone(LocalDate startDate, LocalDate endDate);
}