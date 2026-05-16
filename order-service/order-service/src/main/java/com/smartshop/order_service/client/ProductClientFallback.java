package com.smartshop.order_service.client;

import com.smartshop.order_service.exception.ProductServiceUnavailableException;
import com.smartshop.order_service.model.ProductDTO;
import org.springframework.stereotype.Component;

@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public ProductDTO getProductById(Long id) {
        throw new ProductServiceUnavailableException(
                "Product service is unavailable. Cannot retrieve product details. Please try again later.");
    }
}
