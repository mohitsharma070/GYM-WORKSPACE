package com.gym.membership.specification;

import org.springframework.data.jpa.domain.Specification;

import com.gym.membership.entity.Product;

public class ProductSpecification {
    public static Specification<Product> containsTextInAttributes(String search) {
        return (***REMOVED***, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }
            String likePattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(***REMOVED***.get("name")), likePattern),
                cb.like(cb.lower(***REMOVED***.get("description")), likePattern),
                cb.like(cb.lower(***REMOVED***.get("category")), likePattern)
            );
        };
    }
}
