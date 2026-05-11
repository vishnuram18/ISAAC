package com.smartshop.user_service.service;

import com.smartshop.user_service.dto.LoginRequest;
import com.smartshop.user_service.dto.LoginResponse;
import com.smartshop.user_service.model.User;
import com.smartshop.user_service.repository.UserRepository;
import com.smartshop.user_service.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public User register(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }
        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        String token = jwtUtil.generateToken(user.getUsername());
        return new LoginResponse(token, user.getUsername(), user.getRole());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
