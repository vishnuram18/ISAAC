package com.smartshop.user_service.controller;

import com.smartshop.user_service.model.User;
import com.smartshop.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // This is the "Register" endpoint
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // This lets us see all users to check if it worked
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}