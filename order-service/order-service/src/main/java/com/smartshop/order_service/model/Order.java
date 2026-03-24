package com.smartshop.order_service.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.Data;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;    // This links to User Service ID
    private Long productId; // This links to Product Service ID
    private Integer quantity;
    private Double totalPrice;
    private String status;
}