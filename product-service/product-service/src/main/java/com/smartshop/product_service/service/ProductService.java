package com.smartshop.product_service.service;

import com.smartshop.product_service.model.Product;
import com.smartshop.product_service.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "products-by-seller", allEntries = true)
    })
    public Product addProduct(Product product, String sellerUsername) {
        product.setSellerUsername(sellerUsername);
        return productRepository.save(product);
    }

    @Cacheable("products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Cacheable(value = "product", key = "#id")
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + id));
    }

    @Cacheable(value = "products-by-seller", key = "#sellerUsername")
    public List<Product> getProductsBySeller(String sellerUsername) {
        return productRepository.findBySellerUsername(sellerUsername);
    }

    @Cacheable(value = "product-search", key = "#query")
    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }

    @Caching(
            put  = { @CachePut(value = "product", key = "#id") },
            evict = {
                    @CacheEvict(value = "products", allEntries = true),
                    @CacheEvict(value = "products-by-seller", allEntries = true),
                    @CacheEvict(value = "product-search", allEntries = true)
            }
    )
    public Product updateProduct(Long id, Product updated, String sellerUsername) {
        Product existing = getProductById(id);
        if (!sellerUsername.equals(existing.getSellerUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own products");
        }
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setStockQuantity(updated.getStockQuantity());
        if (updated.getImageUrl() != null) {
            existing.setImageUrl(updated.getImageUrl());
        }
        return productRepository.save(existing);
    }

    @Caching(evict = {
            @CacheEvict(value = "product", key = "#id"),
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "products-by-seller", allEntries = true),
            @CacheEvict(value = "product-search", allEntries = true)
    })
    public void deleteProduct(Long id, String sellerUsername) {
        Product product = getProductById(id);
        if (!sellerUsername.equals(product.getSellerUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own products");
        }
        productRepository.deleteById(id);
    }

    @Caching(evict = {
            @CacheEvict(value = "product", key = "#id"),
            @CacheEvict(value = "products", allEntries = true)
    })
    public void reduceStock(Long id, int quantity) {
        Product product = getProductById(id);
        if (product.getStockQuantity() < quantity) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Insufficient stock. Available: " + product.getStockQuantity());
        }
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
    }

    @Caching(evict = {
            @CacheEvict(value = "product", key = "#id"),
            @CacheEvict(value = "products", allEntries = true)
    })
    public void restoreStock(Long id, int quantity) {
        Product product = getProductById(id);
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
    }
}
