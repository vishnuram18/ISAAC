package com.smartshop.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.smartshop.order_service.model.ProductDTO;

// This tells Feign to talk to the Product Service running on port 8082
@FeignClient(name = "product-service")
public interface ProductClient {

    // This must match the mapping in ProductController exactly!
    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") Long id);
}