package com.example.backend.presentation.controller;

import com.example.backend.dto.QueryRequestDTO;
import com.example.backend.dto.EauDistribueDTO;
import com.example.backend.service.PredictionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@Tag(name = "Predictions", description = "API for water consumption and production forecasts")
@RequestMapping("/api")
@CrossOrigin(origins = "https://orehm.univ-fianarantsoa.mg/")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }
    
    @PostMapping("/eau-distribue/by-zone/prediction")
    @Operation(summary = "Forecast water consumption")
    public ResponseEntity<?> getConsumptionPredictions(@RequestBody List<QueryRequestDTO> queryRequests) {

        try {
            validatePredictionRequests(queryRequests, "CONSOMMATION");
            List<EauDistribueDTO> results = predictionService.getConsumptionPredictions(queryRequests);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(createErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/predictions/health")
    public ResponseEntity<?> healthCheck() {
        try {
            Map<String, Object> health = predictionService.checkHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(createErrorResponse("Health check failed: " + e.getMessage()));
        }
    }

    private void validatePredictionRequests(List<QueryRequestDTO> requests, String type) {
        if (requests == null || requests.isEmpty())
            throw new IllegalArgumentException("The request list is empty");

        for (var req : requests) {
            if (req.getZoneId() == null)
                throw new IllegalArgumentException("Zone ID is missing");
            if (req.getCoordinates() == null)
                throw new IllegalArgumentException("Coordinates are missing");
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        error.put("timestamp", System.currentTimeMillis());
        return error;
    }
}
