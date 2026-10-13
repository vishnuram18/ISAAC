package com.smartshop.product_service.service;

import com.smartshop.product_service.dto.ProductUpdateRequest;
import com.smartshop.product_service.model.Product;
import com.smartshop.product_service.repository.ProductRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Runs on embedded H2 by default. To run against MySQL, pass
// -Dspring.test.database.replace=none -Dspring.datasource.url=jdbc:mysql://...
// -Dtest.dialect=org.hibernate.dialect.MySQLDialect
@DataJpaTest(properties = "spring.jpa.properties.hibernate.dialect=${test.dialect:org.hibernate.dialect.H2Dialect}")
@Import(ProductService.class)
@Transactional(propagation = Propagation.NOT_SUPPORTED) // each thread must commit on its own
class ProductUpdateStockTest {

    private static final int BUYERS = 10;

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @AfterEach
    void cleanUp() {
        productRepository.deleteAll();
    }

    @Test
    void editingDetailsDoesNotUndoASaleMadeWhileTheFormWasOpen() {
        Long id = productRepository.save(product(5)).getId();
        // Seller opens the edit page and sees 5; meanwhile a customer buys one
        productRepository.decrementStock(id, 1);

        productService.updateProduct(id, edit("New name", 0), "seller");

        assertThat(stockOf(id)).isEqualTo(4);
        assertThat(productRepository.findById(id).orElseThrow().getName()).isEqualTo("New name");
    }

    @Test
    void restockIsAddedOnTopOfSalesMadeWhileTheFormWasOpen() {
        Long id = productRepository.save(product(5)).getId();
        productRepository.decrementStock(id, 2);

        Product saved = productService.updateProduct(id, edit("Last one", 10), "seller");

        assertThat(saved.getStockQuantity()).isEqualTo(13);
        assertThat(stockOf(id)).isEqualTo(13);
    }

    @Test
    void adjustmentBelowZeroIsRejectedAndTheWholeEditIsRolledBack() {
        Long id = productRepository.save(product(2)).getId();

        assertThatThrownBy(() -> productService.updateProduct(id, edit("Renamed", -5), "seller"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        Product unchanged = productRepository.findById(id).orElseThrow();
        assertThat(unchanged.getStockQuantity()).isEqualTo(2);
        assertThat(unchanged.getName()).isEqualTo("Last one");
    }

    @Test
    void restockRacingWithBuyersLosesNoUnits() throws Exception {
        Long id = productRepository.save(product(BUYERS)).getId();

        ExecutorService pool = Executors.newFixedThreadPool(BUYERS + 1);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Integer>> sales = new ArrayList<>();
        for (int i = 0; i < BUYERS; i++) {
            sales.add(pool.submit(() -> {
                start.await();
                return productRepository.decrementStock(id, 1);
            }));
        }
        Future<?> restock = pool.submit(() -> {
            start.await();
            return productService.updateProduct(id, edit("Last one", 10), "seller");
        });
        start.countDown();
        int sold = 0;
        for (Future<Integer> sale : sales) {
            sold += sale.get();
        }
        restock.get();
        pool.shutdown();

        assertThat(sold).isEqualTo(BUYERS);
        assertThat(stockOf(id)).isEqualTo(10); // 10 + 10 restocked - 10 sold
    }

    private int stockOf(Long id) {
        return productRepository.findById(id).orElseThrow().getStockQuantity();
    }

    private static ProductUpdateRequest edit(String name, int stockAdjustment) {
        return new ProductUpdateRequest(name, "desc", new BigDecimal("9.99"), stockAdjustment, null);
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
