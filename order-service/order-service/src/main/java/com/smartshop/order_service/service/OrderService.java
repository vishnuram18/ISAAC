package com.smartshop.order_service.service;

import com.smartshop.order_service.client.ProductClient;
import com.smartshop.order_service.kafka.OrderEventPublisher;
import com.smartshop.order_service.model.Order;
import com.smartshop.order_service.model.ProductDTO;
import com.smartshop.order_service.repository.OrderRepository;
import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final OrderEventPublisher orderEventPublisher;

    public OrderService(OrderRepository orderRepository,
                        ProductClient productClient,
                        OrderEventPublisher orderEventPublisher) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.orderEventPublisher = orderEventPublisher;
    }

    public Order placeOrder(Order order) {
        ProductDTO product;
        try {
            product = productClient.getProductById(order.getProductId());
        } catch (FeignException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }

        // Reserve stock before accepting the order. product-service decrements it with a single
        // conditional UPDATE, so when two customers race for the last unit only one succeeds.
        // (A read-then-check here would let both pass and oversell.)
        try {
            productClient.reserveStock(order.getProductId(), order.getQuantity());
        } catch (FeignException.Conflict e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Sorry, there is not enough stock left for " + product.getName());
        } catch (FeignException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }

        order.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(order.getQuantity())));
        order.setStatus("PLACED");

        try {
            return orderRepository.save(order);
        } catch (RuntimeException e) {
            // Order could not be recorded — give the reserved units back
            orderEventPublisher.publishStockRestore(null, order.getProductId(), order.getQuantity());
            throw e;
        }
    }

    public Order cancelOrder(Long id, String username) {
        return changeStatusAndRestoreStock(id, username, "PLACED", "CANCELLED",
                "Only orders with status PLACED can be cancelled");
    }

    public Order returnOrder(Long id, String username) {
        return changeStatusAndRestoreStock(id, username, "DELIVERED", "RETURNED",
                "Only orders with status DELIVERED can be returned");
    }

    private Order changeStatusAndRestoreStock(Long id, String username, String from, String to, String conflictMessage) {
        Order order = getOrderById(id, username);
        if (orderRepository.transitionStatus(id, from, to) == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, conflictMessage);
        }
        order.setStatus(to);
        orderEventPublisher.publishStockRestore(order.getId(), order.getProductId(), order.getQuantity());
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
