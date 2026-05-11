package com.smartshop.order_service.controller;

import com.smartshop.order_service.model.Order;
import com.smartshop.order_service.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public ResponseEntity<Order> placeOrder(@Valid @RequestBody Order order) {
        return ResponseEntity.status(201).body(orderService.placeOrder(order));
    }
}