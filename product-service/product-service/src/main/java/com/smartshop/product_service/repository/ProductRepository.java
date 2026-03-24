package com.smartshop.product_service.repository;

import com.smartshop.product_service.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Basic CRUD is already included!
}