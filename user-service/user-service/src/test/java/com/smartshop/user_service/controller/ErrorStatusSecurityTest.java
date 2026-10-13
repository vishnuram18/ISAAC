package com.smartshop.user_service.controller;

import com.smartshop.user_service.config.SecurityConfig;
import com.smartshop.user_service.service.UserService;
import com.smartshop.user_service.util.JwtUtil;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.RequestDispatcher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class ErrorStatusSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtil jwtUtil;

    @BeforeEach
    void customerTokenIsValid() {
        when(jwtUtil.isValid("customer-token")).thenReturn(true);
        when(jwtUtil.extractUsername("customer-token")).thenReturn("alice");
        when(jwtUtil.extractRole("customer-token")).thenReturn("USER");
    }

    // MockMvc never forwards to /error itself, so replay the forward Tomcat makes after
    // e.g. malformed JSON on /register. The JWT filter doesn't run on that dispatch.
    @Test
    void malformedRegisterRequestIsReportedAs400NotMaskedAs403() throws Exception {
        mockMvc.perform(get("/error").with(errorDispatch(400, "/api/users/register")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unexpectedServerErrorIsReportedAs500NotMaskedAs403() throws Exception {
        mockMvc.perform(get("/error").with(errorDispatch(500, "/api/users/register")))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void responseStatusExceptionKeepsItsStatusAndMessage() throws Exception {
        when(userService.getByUsername("alice"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer customer-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found"));
    }

    @Test
    void anonymousUserStillCannotReadProfile() throws Exception {
        mockMvc.perform(get("/api/users/me"))
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
