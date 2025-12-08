package com.gym.userservice.repository;

import com.gym.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // ---------- LOGIN / AUTHENTICATION ----------
    @Query("""
        SELECT u FROM User u
        WHERE u.email = :email AND u.deleted = false
    """)
    Optional<User> findByEmail(@Param("email") String email);

    @Query("""
        SELECT u FROM User u
        WHERE u.email = :email
    """)
    Optional<User> findByEmailIncludeDeleted(@Param("email") String email);


    // ---------- CHECK DUPLICATE EMAIL ----------
    @Query("""
        SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END
        FROM User u
        WHERE u.email = :email
    """)
    boolean existsByEmail(@Param("email") String email);

    @Query("""
        SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END
        FROM User u
        WHERE u.email = :email AND u.id <> :id
    """)
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("id") Long id);


    // ---------- FIND USERS BY ROLE ----------
    @Query("""
        SELECT u FROM User u
        WHERE u.role = :role AND u.deleted = false
    """)
    List<User> findByRole(@Param("role") String role);

    // ---------- TOTAL MEMBERS (SOFT DELETE RESPECTED) ----------
    @Query("""
        SELECT COUNT(u)
        FROM User u
        WHERE u.role = 'ROLE_MEMBER' AND u.deleted = false
    """)
    long countTotalMembers();

    // ---------- MEMBERS FOR GIVEN MONTH + YEAR (SOFT DELETE) ----------
    @Query("""
        SELECT COUNT(u)
        FROM User u
        WHERE u.role = 'ROLE_MEMBER'
          AND u.deleted = false
          AND EXTRACT(MONTH FROM u.createdAt) = :month
          AND EXTRACT(YEAR FROM u.createdAt) = :year
    """)
    long countMembersByMonthAndYear(
            @Param("month") int month,
            @Param("year") int year
    );
}
