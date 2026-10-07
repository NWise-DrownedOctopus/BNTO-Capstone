package com.bnto.backend.repository;

import com.bnto.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void saveAndFindUserByEmail() {
        User user = new User(
                "repository-test@bnto.com",
                "hashedPassword"
        );

        userRepository.save(user);

        User foundUser = userRepository
                .findByEmail("repository-test@bnto.com")
                .orElseThrow();

        assertNotNull(foundUser.getId());
        assertEquals("repository-test@bnto.com", foundUser.getEmail());
        assertEquals("hashedPassword", foundUser.getPasswordHash());
    }

    @Test
    void existsByEmailReturnsTrueForExistingUser() {
        User user = new User(
                "exists-test@bnto.com",
                "hashedPassword"
        );

        userRepository.save(user);

        assertTrue(
                userRepository.existsByEmail("exists-test@bnto.com")
        );
    }

    @Test
    void existsByEmailReturnsFalseForUnknownUser() {
        assertFalse(
                userRepository.existsByEmail("does-not-exist@bnto.com")
        );
    }
}