package com.smartshop.order_service.service;

import com.smartshop.order_service.client.ProductClient;
import com.smartshop.order_service.model.Order;
import com.smartshop.order_service.model.ProductDTO;
import com.smartshop.order_service.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

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
}
