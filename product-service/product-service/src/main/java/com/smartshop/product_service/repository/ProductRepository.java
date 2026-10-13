package com.smartshop.product_service.repository;

import com.smartshop.product_service.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    List<Product> findBySellerUsername(String sellerUsername);

    // Atomic check-and-decrement: the database row lock guarantees that of two concurrent
    // buyers competing for the last unit, exactly one gets 1 row updated and the other gets 0.
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :quantity " +
           "WHERE p.id = :id AND p.stockQuantity >= :quantity")
    int decrementStock(@Param("id") Long id, @Param("quantity") int quantity);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity + :quantity WHERE p.id = :id")
    int incrementStock(@Param("id") Long id, @Param("quantity") int quantity);

    // Seller restock / write-off: applied relative to the current value so concurrent sales are kept
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity + :delta " +
           "WHERE p.id = :id AND p.stockQuantity + :delta >= 0")
    int adjustStock(@Param("id") Long id, @Param("delta") int delta);
}
