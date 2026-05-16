package com.smartshop.product_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockRestoreEvent {
    private Long orderId;
    private Long productId;
    private Integer quantity;
}
