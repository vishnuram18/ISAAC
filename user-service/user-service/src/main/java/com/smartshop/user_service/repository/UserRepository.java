package com.smartshop.user_service.repository;

import com.smartshop.user_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // This allows us to find a user by their username during login
    Optional<User> findByUsername(String username);
}