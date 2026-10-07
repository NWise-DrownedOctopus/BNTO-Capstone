package com.bnto.backend.controller;

import com.bnto.backend.service.OllamaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final OllamaService ollamaService;

    public AiController(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
    }

    @GetMapping("/test")
    public String testAi() {
        return ollamaService.generate(
                "Reply with exactly: BNTO AI connection successful"
        );
    }
}