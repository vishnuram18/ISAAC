package com.smartshop.product_service.repository;

import com.smartshop.product_service.model.Product;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
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
class ProductStockConcurrencyTest {

    private static final int BUYERS = 20;

    @Autowired
    private ProductRepository productRepository;

    @AfterEach
    void cleanUp() {
        productRepository.deleteAll();
    }

    @Test
    void lastUnitIsSoldToExactlyOneOfManyConcurrentBuyers() throws Exception {
        Long id = productRepository.save(product(1)).getId();

        int successes = raceToDecrement(id, 1);

        assertThat(successes).isEqualTo(1);
        assertThat(stockOf(id)).isZero();
    }

    @Test
    void concurrentBuyersNeverDriveStockNegative() throws Exception {
        Long id = productRepository.save(product(5)).getId();

        int successes = raceToDecrement(id, 2);

        assertThat(successes).isEqualTo(2); // 2 + 2 = 4 units sold, a third order of 2 cannot fit
        assertThat(stockOf(id)).isEqualTo(1);
    }

    @Test
    void concurrentRestoresAreNotLost() throws Exception {
        Long id = productRepository.save(product(0)).getId();

        runConcurrently(() -> productRepository.incrementStock(id, 1));

        assertThat(stockOf(id)).isEqualTo(BUYERS);
    }

    private int raceToDecrement(Long id, int quantity) throws Exception {
        return runConcurrently(() -> productRepository.decrementStock(id, quantity));
    }

    // Starts all threads at the same instant and returns how many updated a row
    private int runConcurrently(Callable<Integer> task) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(BUYERS);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Integer>> results = new ArrayList<>();
        for (int i = 0; i < BUYERS; i++) {
            results.add(pool.submit(() -> {
                start.await();
                return task.call();
            }));
        }
        start.countDown();
        int updatedRows = 0;
        for (Future<Integer> result : results) {
            updatedRows += result.get();
        }
        pool.shutdown();
        return updatedRows;
    }

    private int stockOf(Long id) {
        return productRepository.findById(id).orElseThrow().getStockQuantity();
    }

    private static Product product(int stock) {
        Product p = new Product();
        p.setName("Last one");
        p.setPrice(new BigDecimal("9.99"));
        p.setStockQuantity(stock);
        p.setSellerUsername("seller");
        return p;
    }
}
