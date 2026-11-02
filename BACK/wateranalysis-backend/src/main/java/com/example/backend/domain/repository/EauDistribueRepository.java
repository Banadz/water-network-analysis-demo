package com.example.backend.domain.repository;

import com.example.backend.dto.EauDistribueDTO;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EauDistribueRepository {

    List<EauDistribueDTO> findEauDistribueByZoneAndDate(
        String zoneId,
        String zoneName,
        List<double[]> polygonCoordinates,
        String dateDebut,
        String dateFin
    );

}
