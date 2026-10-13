package com.smartshop.order_service.repository;

import com.smartshop.order_service.model.Order;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;

// Runs on embedded H2 by default. To run against MySQL, pass
// -Dspring.test.database.replace=none -Dspring.datasource.url=jdbc:mysql://...
// -Dtest.dialect=org.hibernate.dialect.MySQLDialect
@DataJpaTest(properties = "spring.jpa.properties.hibernate.dialect=${test.dialect:org.hibernate.dialect.H2Dialect}")
@Transactional(propagation = Propagation.NOT_SUPPORTED) // each thread must commit on its own
class OrderStatusConcurrencyTest {

    private static final int REQUESTS = 20;

    @Autowired
    private OrderRepository orderRepository;

    @AfterEach
    void cleanUp() {
        orderRepository.deleteAll();
    }

    @Test
    void orderIsCancelledOnlyOnceUnderConcurrentCancelRequests() throws Exception {
        Order order = new Order();
        order.setUsername("alice");
        order.setProductId(1L);
        order.setQuantity(1);
        order.setStatus("PLACED");
        Long id = orderRepository.save(order).getId();

        ExecutorService pool = Executors.newFixedThreadPool(REQUESTS);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Integer>> results = new ArrayList<>();
        for (int i = 0; i < REQUESTS; i++) {
            results.add(pool.submit(() -> {
                start.await();
                return orderRepository.transitionStatus(id, "PLACED", "CANCELLED");
            }));
        }
        start.countDown();
        int transitions = 0;
        for (Future<Integer> result : results) {
            transitions += result.get();
        }
        pool.shutdown();

        assertThat(transitions).isEqualTo(1); // so stock is restored exactly once
        assertThat(orderRepository.findById(id).orElseThrow().getStatus()).isEqualTo("CANCELLED");
    }
}
