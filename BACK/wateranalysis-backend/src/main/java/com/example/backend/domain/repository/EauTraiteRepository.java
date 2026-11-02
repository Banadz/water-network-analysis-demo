package com.example.backend.domain.repository;

import com.example.backend.dto.EauTraiteDTO;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EauTraiteRepository {

    List<EauTraiteDTO> findEauTraiteByZoneAndDate(
        String zoneId,
        String zoneName,
        List<double[]> polygonCoordinates,
        String dateDebut,
        String dateFin
    );

}
