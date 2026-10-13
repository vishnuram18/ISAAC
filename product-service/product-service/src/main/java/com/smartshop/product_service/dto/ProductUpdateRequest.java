package com.smartshop.product_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

// Stock is changed by a relative adjustment (+10 restocked, -3 written off), never an absolute
// value, so units sold while the seller's edit form was open aren't put back on sale.
public record ProductUpdateRequest(
        @NotBlank(message = "Name is required") String name,
        String description,
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be positive") BigDecimal price,
        int stockAdjustment,
        String imageUrl
) {}
