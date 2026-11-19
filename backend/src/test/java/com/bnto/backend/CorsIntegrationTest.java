package com.bnto.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Browser preflight (OPTIONS) checks against the real security filter chain and CorsConfig.
 * Allowed origins come from app.cors.allowed-origins in src/test/resources/application.properties.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CorsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private org.springframework.test.web.servlet.ResultActions preflight(String origin) throws Exception {
        return mockMvc.perform(options("/api/auth/login")
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "content-type"));
    }

    @Test
    void deployedFrontendIsAllowed() throws Exception {
        preflight("https://frontend-ten-chi-hxiv0m6g7l.vercel.app")
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin",
                        "https://frontend-ten-chi-hxiv0m6g7l.vercel.app"));
    }

    @Test
    void localViteDevServerIsAllowed() throws Exception {
        preflight("http://localhost:8443")
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8443"));
    }

    @Test
    void unknownOriginIsRejected() throws Exception {
        preflight("https://evil.example.com")
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
