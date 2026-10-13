package com.smartshop.order_service.client;

import com.smartshop.order_service.exception.ProductServiceUnavailableException;
import com.smartshop.order_service.model.ProductDTO;
import feign.FeignException;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
public class ProductClientFallbackFactory implements FallbackFactory<ProductClient> {

    @Override
    public ProductClient create(Throwable cause) {
        // A 4xx (product not found, insufficient stock) is a real answer from a healthy
        // product-service, so pass it through instead of reporting the service as down.
        if (cause instanceof FeignException.FeignClientException clientError) {
            throw clientError;
        }
        return new ProductClient() {
            @Override
            public ProductDTO getProductById(Long id) {
                throw unavailable();
            }

            @Override
            public void reserveStock(Long id, int quantity) {
                throw unavailable();
            }
        };
    }

    private static ProductServiceUnavailableException unavailable() {
        return new ProductServiceUnavailableException(
                "Product service is unavailable. Please try again later.");
    }
}
