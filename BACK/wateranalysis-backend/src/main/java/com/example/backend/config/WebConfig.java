package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                    "http://localhost:*", // local React development and Docker ports
                    "http://127.0.0.1:*",
                    "http://localhost:8080",  // Swagger UI (même origine)
                    "http://127.0.0.1:8080",  // Swagger UI (alternative)
                    "http://localhost:8081",
                    "http://38.242.147.247:4141",
                    "https://orehm.univ-fianarantsoa.mg",
                    "https://api-orehm.univ-fianarantsoa.mg"
                ) // URL de votre frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
