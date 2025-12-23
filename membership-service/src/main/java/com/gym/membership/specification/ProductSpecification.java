package com.gym.membership.specification;

import org.springframework.data.jpa.domain.Specification;

import com.gym.membership.entity.Product;

public class ProductSpecification {
    public static Specification<Product> containsTextInAttributes(String search) {
        return (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }
            String likePattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("name")), likePattern),
                cb.like(cb.lower(root.get("description")), likePattern),
                cb.like(cb.lower(root.get("category")), likePattern)
            );
        };
    }
}
