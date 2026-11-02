package com.example.backend.presentation.controller;

import com.example.backend.dto.EauTraiteDTO;
import com.example.backend.dto.QueryRequestDTO;
import com.example.backend.service.EauTraiteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@Tag(name = "Eau traité", description = "Récupération d'eau traité par zone et date")
@RequestMapping("/api/eau-traite")
@CrossOrigin(origins = "https://orehm.univ-fianarantsoa.mg/") // Adaptez selon votre frontend
public class EauTraiteController {
    private static final Logger logger = LoggerFactory.getLogger(EauTraiteController.class);

    private final EauTraiteService eauTraiteService;

    public EauTraiteController(EauTraiteService eauTraiteService) {
        this.eauTraiteService = eauTraiteService;
    }

    @PostMapping("/by-zone")
    @Operation(summary = "Récupérer les quantité d'eau traité",
            description = "Retourne la quantité d'eau traité groupée par zone et limité par des dates")
    public ResponseEntity<List<EauTraiteDTO>> getEauTraiteByZone(@RequestBody List<QueryRequestDTO> queryRequest) {
        try {
            logger.info("Received {} query requests", queryRequest.size());
            
            for (int i = 0; i < queryRequest.size(); i++) {
                QueryRequestDTO req = queryRequest.get(i);
                logger.info("Request {}: zoneId={}", i, req.getZoneId());
            }
            List<EauTraiteDTO> results = eauTraiteService.getEauTraiteByZone(queryRequest);
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            logger.error("Bad request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            logger.error("Internal error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(null);
        }
    }
}