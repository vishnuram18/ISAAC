package com.smartshop.order_service.controller;

import com.smartshop.order_service.client.ProductClient;
import com.smartshop.order_service.model.Order;
import com.smartshop.order_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.smartshop.order_service.model.Order;
import com.smartshop.order_service.model.ProductDTO;
import com.smartshop.order_service.client.ProductClient;
import com.smartshop.order_service.repository.OrderRepository;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductClient productClient;

    @PostMapping("/place")
    public Order placeOrder(@RequestBody Order order) {
        try {
            ProductDTO product = productClient.getProductById(order.getProductId());

            if (product == null || product.getPrice() == null) {
                throw new RuntimeException("Product Service returned empty data for ID: " + order.getProductId());
            }

            order.setTotalPrice(product.getPrice() * order.getQuantity());
            order.setStatus("PLACED");
            return orderRepository.save(order);

        } catch (Exception e) {
            // This will print the REAL error in your console
            e.printStackTrace();
            throw new RuntimeException("Feign Call Failed: " + e.getMessage());
        }
    }
}