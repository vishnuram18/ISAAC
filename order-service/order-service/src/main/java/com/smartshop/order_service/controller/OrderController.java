package com.smartshop.order_service.controller;

import com.smartshop.order_service.model.Order;
import com.smartshop.order_service.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public ResponseEntity<Order> placeOrder(@Valid @RequestBody Order order, Authentication auth) {
        order.setUsername(auth.getName());
        return ResponseEntity.status(201).body(orderService.placeOrder(order));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getOrdersByUsername(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.getOrderById(id, auth.getName()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.cancelOrder(id, auth.getName()));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<Order> returnOrder(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(orderService.returnOrder(id, auth.getName()));
    }
}
