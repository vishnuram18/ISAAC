package com.smartshop.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Keeps service-to-service endpoints off the public API. Services call each other directly
 * (via Eureka), never through the gateway, so these paths have no legitimate external caller.
 */
@Component
public class InternalEndpointFilter implements GlobalFilter, Ordered {

    static final String INTERNAL_API_KEY_HEADER = "X-Internal-Api-Key";

    private static final List<String> INTERNAL_PATHS = List.of(
            "/api/products/*/reduce-stock",
            "/api/products/*/restore-stock"
    );

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (INTERNAL_PATHS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path))) {
            exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
            return exchange.getResponse().setComplete();
        }
        // Never let a client pass itself off as an internal service
        ServerWebExchange sanitized = exchange.mutate()
                .request(request -> request.headers(headers -> headers.remove(INTERNAL_API_KEY_HEADER)))
                .build();
        return chain.filter(sanitized);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
