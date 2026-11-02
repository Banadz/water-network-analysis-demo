package com.example.backend.python;

import com.example.backend.dto.PythonPredictionRequestDTO;
import com.example.backend.dto.PythonPredictionResponseDTO;
import java.util.List;
import java.util.Map;

public interface PythonPredictionClient {
    List<PythonPredictionResponseDTO> predict(String type, PythonPredictionRequestDTO request);
    Map<String, Object> healthCheck();
}
