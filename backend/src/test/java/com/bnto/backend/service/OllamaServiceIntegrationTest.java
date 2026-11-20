package com.bnto.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import static org.junit.jupiter.api.Assertions.*;

class OllamaServiceIntegrationTest {

    @Test
    @EnabledIfEnvironmentVariable(
        named = "RUN_OLLAMA_INTEGRATION_TEST",
        matches = "true"
    )
    void generatesBudgetRecommendation() {
        OllamaService ollamaService = new OllamaService(
            "http://localhost:11434",
            "qwen3:1.7b"
        );

        String response = ollamaService.generate(
            "Give one short budgeting recommendation for someone " +
            "who spends $300 per month on restaurants."
        );

        assertNotNull(response);
        assertFalse(response.isBlank());

        System.out.println("Ollama response: " + response);
    }
}
