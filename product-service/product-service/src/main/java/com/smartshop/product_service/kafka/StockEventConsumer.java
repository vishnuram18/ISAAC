package com.smartshop.product_service.kafka;

import com.smartshop.product_service.event.OrderPlacedEvent;
import com.smartshop.product_service.event.StockRestoreEvent;
import com.smartshop.product_service.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class StockEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(StockEventConsumer.class);

    private final ProductService productService;

    public StockEventConsumer(ProductService productService) {
        this.productService = productService;
    }

    @KafkaListener(topics = "order-placed", groupId = "product-service",
            containerFactory = "orderPlacedListenerFactory")
    public void handleOrderPlaced(OrderPlacedEvent event) {
        try {
            productService.reduceStock(event.getProductId(), event.getQuantity());
            log.info("Stock reduced for order {}: product={} qty={}", event.getOrderId(), event.getProductId(), event.getQuantity());
        } catch (Exception e) {
            // Log and discard — retrying an insufficient-stock error will never succeed.
            // Production: route to a dead-letter topic for manual review.
            log.error("Failed to reduce stock for order {}: {}", event.getOrderId(), e.getMessage());
        }
    }

    @KafkaListener(topics = "stock-restore", groupId = "product-service",
            containerFactory = "stockRestoreListenerFactory")
    public void handleStockRestore(StockRestoreEvent event) {
        try {
            productService.restoreStock(event.getProductId(), event.getQuantity());
            log.info("Stock restored for order {}: product={} qty={}", event.getOrderId(), event.getProductId(), event.getQuantity());
        } catch (Exception e) {
            log.error("Failed to restore stock for order {}: {}", event.getOrderId(), e.getMessage());
        }
    }
}
