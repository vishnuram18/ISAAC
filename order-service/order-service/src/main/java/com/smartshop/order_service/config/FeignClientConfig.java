package com.smartshop.order_service.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor jwtForwardInterceptor() {
        return template -> {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String auth = attrs.getRequest().getHeader("Authorization");
                if (auth != null && auth.startsWith("Bearer ")) {
                    template.header("Authorization", auth);
                }
            }
        };
    }

    // Identifies order-service to product-service for internal endpoints such as reduce-stock
    @Bean
    public RequestInterceptor internalApiKeyInterceptor(@Value("${internal.api-key}") String internalApiKey) {
        return template -> template.header("X-Internal-Api-Key", internalApiKey);
    }
}
