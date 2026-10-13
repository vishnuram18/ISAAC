package com.smartshop.user_service.controller;

import com.smartshop.user_service.config.SecurityConfig;
import com.smartshop.user_service.model.User;
import com.smartshop.user_service.repository.UserRepository;
import com.smartshop.user_service.service.UserService;
import com.smartshop.user_service.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Runs the real UserService (only the repository is mocked) so the role rules are exercised end to end.
@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, UserService.class})
class RegistrationRoleSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        when(userRepository.findByUsername(any())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        when(jwtUtil.isValid("customer-token")).thenReturn(true);
        when(jwtUtil.extractUsername("customer-token")).thenReturn("alice");
        when(jwtUtil.extractRole("customer-token")).thenReturn("USER");
    }

    @Test
    void clientCannotSelfRegisterAsAdmin() throws Exception {
        mockMvc.perform(register("ADMIN"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Role must be USER or SELLER"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void lowercaseAdminIsAlsoRejected() throws Exception {
        mockMvc.perform(register("admin"))
                .andExpect(status().isBadRequest());
        verify(userRepository, never()).save(any());
    }

    @Test
    void unknownRoleIsRejected() throws Exception {
        mockMvc.perform(register("SUPERUSER"))
                .andExpect(status().isBadRequest());
        verify(userRepository, never()).save(any());
    }

    @Test
    void sellerCanStillSelfRegister() throws Exception {
        mockMvc.perform(register("SELLER"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("SELLER"));
    }

    @Test
    void missingRoleDefaultsToUser() throws Exception {
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"bob\",\"password\":\"secret1\",\"email\":\"bob@example.com\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    // With an id set, save() would merge over that existing user (e.g. the admin) instead of inserting.
    @Test
    void clientSuppliedIdCannotOverwriteAnExistingUser() throws Exception {
        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":1,\"username\":\"bob\",\"password\":\"secret1\",\"email\":\"bob@example.com\"}"))
                .andExpect(status().isCreated());

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getId()).isNull();
    }

    @Test
    void profileUpdateCannotChangeRole() throws Exception {
        User alice = new User(7L, "alice", "hashed", "alice@example.com", "USER");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer customer-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":1,\"username\":\"admin\",\"email\":\"new@example.com\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.email").value("new@example.com"));
    }

    private static RequestBuilder register(String role) {
        return post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"bob\",\"password\":\"secret1\",\"email\":\"bob@example.com\",\"role\":\"" + role + "\"}");
    }
}
