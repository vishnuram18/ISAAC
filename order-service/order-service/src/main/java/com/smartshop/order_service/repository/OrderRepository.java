package com.smartshop.order_service.repository;

import com.smartshop.order_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUsernameOrderByIdDesc(String username);

    // Atomic status change: if the same order is cancelled twice at once (double click,
    // two tabs), only one request moves it out of `from`, so stock is restored only once.
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Order o SET o.status = :to WHERE o.id = :id AND o.status = :from")
    int transitionStatus(@Param("id") Long id, @Param("from") String from, @Param("to") String to);
}
