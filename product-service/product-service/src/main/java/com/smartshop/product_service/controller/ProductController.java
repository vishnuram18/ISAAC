package com.smartshop.product_service.controller;

import com.smartshop.product_service.model.Product;
import com.smartshop.product_service.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // Create a new product
    @PostMapping("/add")
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // Get all products
    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }


    // Get a single product by ID (Needed by Order Service!)
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
}