package com.bnto.backend.repository;

import com.bnto.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

        private static final String FIRST_NAME = "Jane";
        private static final String LAST_NAME = "Doe";
        private static final String DATE_OF_BIRTH = "1990-05-15";
        private static final String HOME_ADDRESS = "123 Main St, Kansas City, MO";
        private static final String PASSWORD_HASH = "hashedPassword";

        private static final String EMAIL = "repository-test@bnto.com";
        private static final String MOBILE = "555-0100";

        @Autowired
        private UserRepository userRepository;

        private User buildUser(String email, String mobileNumber) {
                return new User(
                                FIRST_NAME,
                                LAST_NAME,
                                DATE_OF_BIRTH,
                                mobileNumber,
                                HOME_ADDRESS,
                                email,
                                PASSWORD_HASH);
        }

        @Test
        void saveAndFindUserByEmail() {
                userRepository.save(buildUser(EMAIL, MOBILE));

                User found = userRepository.findByEmail(EMAIL).orElseThrow();

                assertNotNull(found.getId());
                assertEquals(FIRST_NAME, found.getFirstName());
                assertEquals(LAST_NAME, found.getLastName());
                assertEquals(DATE_OF_BIRTH, found.getDateOfBirth());
                assertEquals(MOBILE, found.getMobileNumber());
                assertEquals(HOME_ADDRESS, found.getHomeAddress());
                assertEquals(EMAIL, found.getEmail());
                assertEquals(PASSWORD_HASH, found.getPasswordHash());
                assertNotNull(found.getCreatedAt());
                assertTrue(found.getAccounts().isEmpty());
        }

        @Test
        void findByEmailReturnsEmptyForUnknownUser() {
                assertTrue(userRepository.findByEmail("does-not-exist@bnto.com").isEmpty());
        }

        @Test
        void existsByEmailReturnsTrueForExistingUser() {
                userRepository.save(buildUser(EMAIL, MOBILE));

                assertTrue(userRepository.existsByEmail(EMAIL));
        }

        @Test
        void existsByEmailReturnsFalseForUnknownUser() {
                assertFalse(userRepository.existsByEmail("does-not-exist@bnto.com"));
        }

        @Test
        void saveFailsWhenEmailIsDuplicate() {
                userRepository.saveAndFlush(buildUser(EMAIL, "555-0100"));

                assertThrows(DataIntegrityViolationException.class,
                                () -> userRepository.saveAndFlush(buildUser(EMAIL, "555-0101")));
        }

        @Test
        void saveFailsWhenMobileNumberIsDuplicate() {
                userRepository.saveAndFlush(buildUser("first@bnto.com", MOBILE));

                assertThrows(DataIntegrityViolationException.class,
                                () -> userRepository.saveAndFlush(buildUser("second@bnto.com", MOBILE)));
        }

        @Test
        void saveFailsWhenRequiredFieldIsNull() {
                User user = buildUser(EMAIL, MOBILE);
                user.setFirstName(null);

                assertThrows(DataIntegrityViolationException.class,
                                () -> userRepository.saveAndFlush(user));
        }
}