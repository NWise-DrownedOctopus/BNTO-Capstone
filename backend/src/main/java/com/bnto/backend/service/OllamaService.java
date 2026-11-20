package com.bnto.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.Map;

@Service
public class OllamaService {

    private final RestClient restClient;
    private final String model;

    public OllamaService(
            @Value("${ollama.base-url}") String baseUrl,
            @Value("${ollama.model}") String model) {

        SimpleClientHttpRequestFactory requestFactory =
            new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(120));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();

        this.model = model;
    }

    public String generate(String prompt) {

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false,
                "think", false
        );

        OllamaResponse response = restClient.post()
                .uri("/api/generate")
                .body(requestBody)
                .retrieve()
                .body(OllamaResponse.class);

        if (response == null ||
            response.response() == null ||
            response.response().isBlank()) {

        throw new IllegalStateException(
                "Ollama returned an empty or invalid response."
        );
    }

    return response.response().trim();
    }

    private record OllamaResponse(String response) {
    }
}