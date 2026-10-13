package com.smartshop.api_gateway.filter;

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class InternalEndpointFilterTest {

    private final InternalEndpointFilter filter = new InternalEndpointFilter();

    @Test
    void blocksReduceStockFromOutside() {
        assertBlocked(MockServerHttpRequest.put("/api/products/7/reduce-stock?quantity=5").build());
    }

    @Test
    void blocksRestoreStockFromOutside() {
        assertBlocked(MockServerHttpRequest.put("/api/products/7/restore-stock?quantity=5").build());
    }

    @Test
    void blocksInternalPathEvenWithAForgedInternalKey() {
        assertBlocked(MockServerHttpRequest.put("/api/products/7/reduce-stock?quantity=5")
                .header(InternalEndpointFilter.INTERNAL_API_KEY_HEADER, "guess").build());
    }

    @Test
    void forwardsNormalRequestsWithoutTheInternalKeyHeader() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.put("/api/products/7")
                        .header(InternalEndpointFilter.INTERNAL_API_KEY_HEADER, "guess")
                        .header("Authorization", "Bearer token").build());
        AtomicReference<ServerWebExchange> forwarded = new AtomicReference<>();

        filter.filter(exchange, captureInto(forwarded)).block();

        assertThat(forwarded.get()).isNotNull();
        assertThat(forwarded.get().getRequest().getHeaders().containsKey(InternalEndpointFilter.INTERNAL_API_KEY_HEADER)).isFalse();
        assertThat(forwarded.get().getRequest().getHeaders().getFirst("Authorization")).isEqualTo("Bearer token");
    }

    private void assertBlocked(MockServerHttpRequest request) {
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        AtomicReference<ServerWebExchange> forwarded = new AtomicReference<>();

        filter.filter(exchange, captureInto(forwarded)).block();

        assertThat(forwarded.get()).isNull();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    private static GatewayFilterChain captureInto(AtomicReference<ServerWebExchange> forwarded) {
        return exchange -> {
            forwarded.set(exchange);
            return Mono.empty();
        };
    }
}
