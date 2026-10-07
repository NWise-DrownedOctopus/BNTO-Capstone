package com.bnto.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
<<<<<<< HEAD
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
=======
>>>>>>> feature/ai-integration
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
<<<<<<< HEAD
                .requestMatchers("/api/health","/api/auth/register").permitAll()
=======
                .requestMatchers(
                    "/api/health",
                    "/api/ai/test",
                    "/api/budget/generate"
                ).permitAll()
>>>>>>> feature/ai-integration
                .anyRequest().authenticated()
            );

        return http.build();
    }
<<<<<<< HEAD

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
=======
>>>>>>> feature/ai-integration
}