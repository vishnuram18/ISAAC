package com.smartshop.product_service.controller;

import com.smartshop.product_service.model.Product;
import com.smartshop.product_service.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(@Valid @RequestBody Product product, Authentication auth) {
        return ResponseEntity.status(201).body(productService.addProduct(product, auth.getName()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Product>> getMyProducts(Authentication auth) {
        return ResponseEntity.ok(productService.getProductsBySeller(auth.getName()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String q) {
        return ResponseEntity.ok(productService.searchProducts(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product, Authentication auth) {
        return ResponseEntity.ok(productService.updateProduct(id, product, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, Authentication auth) {
        productService.deleteProduct(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reduce-stock")
    public ResponseEntity<Void> reduceStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.reduceStock(id, quantity);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/restore-stock")
    public ResponseEntity<Void> restoreStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.restoreStock(id, quantity);
        return ResponseEntity.noContent().build();
    }
}
