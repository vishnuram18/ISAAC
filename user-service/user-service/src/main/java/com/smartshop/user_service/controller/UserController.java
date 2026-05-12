package com.smartshop.user_service.controller;

import com.smartshop.user_service.dto.LoginRequest;
import com.smartshop.user_service.dto.LoginResponse;
import com.smartshop.user_service.model.User;
import com.smartshop.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody User user) {
        return ResponseEntity.status(201).body(userService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getByUsername(auth.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(Authentication auth, @RequestBody User updates) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), updates));
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
