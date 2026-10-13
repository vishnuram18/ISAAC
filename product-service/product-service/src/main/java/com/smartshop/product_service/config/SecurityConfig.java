package com.smartshop.product_service.config;

import com.smartshop.product_service.filter.JwtAuthFilter;
import com.smartshop.product_service.util.JwtUtil;
import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Configuration
public class SecurityConfig {

    static final String INTERNAL_API_KEY_HEADER = "X-Internal-Api-Key";

    private final JwtUtil jwtUtil;
    private final byte[] internalApiKey;

    public SecurityConfig(JwtUtil jwtUtil, @Value("${internal.api-key}") String internalApiKey) {
        this.jwtUtil = jwtUtil;
        this.internalApiKey = internalApiKey.getBytes(StandardCharsets.UTF_8);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .addFilterBefore(new JwtAuthFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // Let Spring's internal error dispatch through so real error statuses aren't turned into 403
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        // Service-to-service only (order-service via Feign). A user JWT is not enough,
                        // otherwise any logged-in customer could change any product's stock.
                        .requestMatchers(HttpMethod.PUT, "/api/products/*/reduce-stock").access((authentication, context) ->
                                new AuthorizationDecision(hasInternalApiKey(context.getRequest().getHeader(INTERNAL_API_KEY_HEADER))))
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("SELLER")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("SELLER")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("SELLER")
                        .anyRequest().authenticated()
                );
        return http.build();
    }

    private boolean hasInternalApiKey(String presented) {
        return presented != null
                && MessageDigest.isEqual(presented.getBytes(StandardCharsets.UTF_8), internalApiKey);
    }
}
