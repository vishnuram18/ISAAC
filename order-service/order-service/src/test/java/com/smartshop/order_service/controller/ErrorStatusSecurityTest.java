package com.smartshop.order_service.controller;

import com.smartshop.order_service.config.SecurityConfig;
import com.smartshop.order_service.service.OrderService;
import com.smartshop.order_service.util.JwtUtil;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.RequestDispatcher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class)
class ErrorStatusSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @BeforeEach
    void customerTokenIsValid() {
        when(jwtUtil.isValid("customer-token")).thenReturn(true);
        when(jwtUtil.extractUsername("customer-token")).thenReturn("alice");
    }

    // MockMvc never forwards to /error itself, so replay the forward Tomcat makes after
    // e.g. malformed JSON on /place. The JWT filter doesn't run on that dispatch.
    @Test
    void malformedOrderRequestIsReportedAs400NotMaskedAs403() throws Exception {
        mockMvc.perform(get("/error").with(errorDispatch(400, "/api/orders/place")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unexpectedServerErrorIsReportedAs500NotMaskedAs403() throws Exception {
        mockMvc.perform(get("/error").with(errorDispatch(500, "/api/orders/place")))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void responseStatusExceptionWithoutReasonStillGetsAJsonBody() throws Exception {
        when(orderService.cancelOrder(9L, "alice")).thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(put("/api/orders/9/cancel").header("Authorization", "Bearer customer-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Not Found"));
    }

    @Test
    void anonymousUserStillCannotReadOrders() throws Exception {
        mockMvc.perform(get("/api/orders/my"))
                .andExpect(status().isForbidden());
    }

    private static RequestPostProcessor errorDispatch(int status, String originalUri) {
        return request -> {
            request.setDispatcherType(DispatcherType.ERROR);
            request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, status);
            request.setAttribute(RequestDispatcher.ERROR_REQUEST_URI, originalUri);
            return request;
        };
    }
}
