package com.smartshop.order_service.service;

import com.smartshop.order_service.client.ProductClient;
import com.smartshop.order_service.model.Order;
import com.smartshop.order_service.model.ProductDTO;
import com.smartshop.order_service.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;

    public OrderService(OrderRepository orderRepository, ProductClient productClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
    }

    public Order placeOrder(Order order) {
        ProductDTO product = productClient.getProductById(order.getProductId());

        if (product.getStockQuantity() < order.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Insufficient stock. Available: " + product.getStockQuantity());
        }

        order.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(order.getQuantity())));
        order.setStatus("PLACED");

        Order saved = orderRepository.save(order);
        productClient.reduceStock(order.getProductId(), order.getQuantity());
        return saved;
    }

    public Order cancelOrder(Long id, String username) {
        Order order = getOrderById(id, username);
        if (!"PLACED".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only orders with status PLACED can be cancelled");
        }
        order.setStatus("CANCELLED");
        orderRepository.save(order);
        productClient.restoreStock(order.getProductId(), order.getQuantity());
        return order;
    }

    public Order returnOrder(Long id, String username) {
        Order order = getOrderById(id, username);
        if (!"DELIVERED".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only orders with status DELIVERED can be returned");
        }
        order.setStatus("RETURNED");
        orderRepository.save(order);
        productClient.restoreStock(order.getProductId(), order.getQuantity());
        return order;
    }

    public List<Order> getOrdersByUsername(String username) {
        return orderRepository.findByUsernameOrderByIdDesc(username);
    }

    public Order getOrderById(Long id, String username) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return order;
    }
}
