package com.example.backend.presentation.controller;

import com.example.backend.dto.EauDistribueDTO;
import com.example.backend.dto.QueryRequestDTO;
import com.example.backend.dto.ZoneConsumptionDTO;
import com.example.backend.service.EauDistribueService;
import com.example.backend.service.ConsumptionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@Tag(name = "Eau distribué", description = "API pour la gestion de l'eau distribuée par zone et date")
@RequestMapping("/api/eau-distribue")
@CrossOrigin(origins = "https://orehm.univ-fianarantsoa.mg/")
public class EauDistribueController {
    private static final Logger logger = LoggerFactory.getLogger(EauDistribueController.class);

    private final EauDistribueService eauDistribueService;
    private final ConsumptionService consumptionService;

    public EauDistribueController(EauDistribueService eauDistribueService, ConsumptionService consumptionService) {
        this.eauDistribueService = eauDistribueService;
        this.consumptionService = consumptionService;
    }

    @PostMapping("/by-zone")
    @Operation(
        summary = "Récupérer les quantités d'eau distribuée",
        description = "Retourne la quantité d'eau distribuée groupée par zone et limitée par des dates"
    )
    @ApiResponse(responseCode = "200", description = "Succès", 
                 content = @Content(schema = @Schema(implementation = EauDistribueDTO.class)))
    public ResponseEntity<List<EauDistribueDTO>> getEauDistribueByZone(
        @Parameter(description = "Liste des requêtes de filtrage par zone", 
                  required = true,
                  content = @Content(schema = @Schema(implementation = QueryRequestDTO.class)))
        @RequestBody List<QueryRequestDTO> queryRequest) {
        
        try {
            logger.info("Received {} query requests", queryRequest.size());
            
            for (int i = 0; i < queryRequest.size(); i++) {
                QueryRequestDTO req = queryRequest.get(i);
                logger.info("Request {}: zoneId={}", i, req.getZoneId());
            }
            
            List<EauDistribueDTO> results = eauDistribueService.getEauDistribueByZone(queryRequest);
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            logger.error("Bad request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            logger.error("Internal error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(null);
        }
    }
    @GetMapping("/heatmap/by-zone")
    @Operation(
        summary = "Récupération de données pour heatmap",
        description = "Rétourne les données d'affichge de heatmap de consommation par zone pour un periode"
    )
    @ApiResponse(responseCode = "200", description = "Succès",
                content = @Content(schema = @Schema(implementation = ZoneConsumptionDTO.class))
    )
    public ResponseEntity<List<ZoneConsumptionDTO>> getConsumptionByZone(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ){
        List<ZoneConsumptionDTO> resultats = new ArrayList<>();
        try {    
            List<ZoneConsumptionDTO> resultat = consumptionService.getConsumptionByZone(startDate, endDate);
            resultats.addAll(resultat);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error getting data consumption by zone: " + e.getMessage());
        }
        return ResponseEntity.ok(resultats);
    }
    
}