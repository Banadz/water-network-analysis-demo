package com.example.backend.python;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.example.backend.dto.PythonPredictionRequestDTO;
import com.example.backend.dto.PythonPredictionResponseDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PythonPredictionClientImpl implements PythonPredictionClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String pythonApiUrl = "http://localhost:8000/api";

    @Override
    public List<PythonPredictionResponseDTO> predict(String type, PythonPredictionRequestDTO request) {
        try {
            // Log de la requête envoyée
            String jsonRequest = objectMapper.writeValueAsString(request);
            System.out.println("Sending to Python API: " + jsonRequest);
        } catch (JsonProcessingException e) {
            System.out.println("Could not log request: " + e.getMessage());
        }
        String endpoint = pythonApiUrl + "/predict/zones/" + type;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PythonPredictionRequestDTO> entity = new HttpEntity<>(request, headers);

        ResponseEntity<PythonPredictionResponseDTO[]> response = restTemplate.exchange(
            endpoint,
            HttpMethod.POST,
            entity,
            PythonPredictionResponseDTO[].class
        );
        System.out.println("Python response status: " + response.getStatusCode());
        System.out.println("Python response body: " + Arrays.toString(response.getBody()));
        return Arrays.asList(response.getBody());
    }

    @SuppressWarnings("unchecked")
    @Override
    public Map<String, Object> healthCheck() {
        String endpoint = pythonApiUrl + "/api/health";
        return restTemplate.getForObject(endpoint, Map.class);
    }
}
