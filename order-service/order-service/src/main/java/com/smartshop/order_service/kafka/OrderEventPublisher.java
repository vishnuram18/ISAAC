package com.smartshop.order_service.kafka;

import com.smartshop.order_service.event.OrderPlacedEvent;
import com.smartshop.order_service.event.StockRestoreEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {

    static final String ORDER_PLACED_TOPIC = "order-placed";
    static final String STOCK_RESTORE_TOPIC = "stock-restore";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderPlaced(Long orderId, Long productId, Integer quantity) {
        kafkaTemplate.send(ORDER_PLACED_TOPIC, new OrderPlacedEvent(orderId, productId, quantity));
    }

    public void publishStockRestore(Long orderId, Long productId, Integer quantity) {
        kafkaTemplate.send(STOCK_RESTORE_TOPIC, new StockRestoreEvent(orderId, productId, quantity));
    }
}
