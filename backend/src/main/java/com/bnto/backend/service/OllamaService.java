package com.bnto.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class OllamaService {

    private final RestClient restClient;
    private final String model;

    public OllamaService(
            @Value("${ollama.base-url}") String baseUrl,
            @Value("${ollama.model}") String model) {

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();

        this.model = model;
    }

    public String generate(String prompt) {

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false
        );

        OllamaResponse response = restClient.post()
                .uri("/api/generate")
                .body(requestBody)
                .retrieve()
                .body(OllamaResponse.class);

        if (response == null) {
            throw new IllegalStateException("Ollama returned an empty response.");
        }

        return response.response();
    }

    private record OllamaResponse(String response) {
    }
}