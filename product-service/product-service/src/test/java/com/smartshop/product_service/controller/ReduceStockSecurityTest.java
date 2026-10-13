package com.smartshop.product_service.controller;

import com.smartshop.product_service.config.SecurityConfig;
import com.smartshop.product_service.service.ProductService;
import com.smartshop.product_service.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import(SecurityConfig.class)
class ReduceStockSecurityTest {

    private static final String KEY_HEADER = "X-Internal-Api-Key";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private JwtUtil jwtUtil;

    @Value("${internal.api-key}")
    private String internalApiKey;

    @BeforeEach
    void customerTokenIsValid() {
        when(jwtUtil.isValid("customer-token")).thenReturn(true);
        when(jwtUtil.extractUsername("customer-token")).thenReturn("alice");
        when(jwtUtil.extractRole("customer-token")).thenReturn("USER");
    }

    @Test
    void loggedInCustomerCannotReduceStock() throws Exception {
        mockMvc.perform(put("/api/products/7/reduce-stock").param("quantity", "100")
                        .header("Authorization", "Bearer customer-token"))
                .andExpect(status().isForbidden());

        verify(productService, never()).reduceStock(anyLong(), anyInt());
    }

    @Test
    void wrongInternalKeyIsRejected() throws Exception {
        mockMvc.perform(put("/api/products/7/reduce-stock").param("quantity", "1")
                        .header("Authorization", "Bearer customer-token")
                        .header(KEY_HEADER, "guess"))
                .andExpect(status().isForbidden());

        verify(productService, never()).reduceStock(anyLong(), anyInt());
    }

    @Test
    void orderServiceWithInternalKeyCanReduceStock() throws Exception {
        mockMvc.perform(put("/api/products/7/reduce-stock").param("quantity", "1")
                        .header("Authorization", "Bearer customer-token")
                        .header(KEY_HEADER, internalApiKey))
                .andExpect(status().isNoContent());

        verify(productService).reduceStock(7L, 1);
    }

    @Test
    void insufficientStockIsReportedAs409NotMaskedAs403() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock for product 7"))
                .when(productService).reduceStock(7L, 1);

        mockMvc.perform(put("/api/products/7/reduce-stock").param("quantity", "1")
                        .header("Authorization", "Bearer customer-token")
                        .header(KEY_HEADER, internalApiKey))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Insufficient stock for product 7"));
    }

    @Test
    void restoreStockIsNoLongerExposedOverHttp() throws Exception {
        mockMvc.perform(put("/api/products/7/restore-stock").param("quantity", "100")
                        .header("Authorization", "Bearer customer-token")
                        .header(KEY_HEADER, internalApiKey))
                .andExpect(status().is4xxClientError());

        verify(productService, never()).restoreStock(anyLong(), anyInt());
    }
}
