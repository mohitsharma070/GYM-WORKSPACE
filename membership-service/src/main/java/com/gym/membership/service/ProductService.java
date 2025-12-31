
package com.gym.membership.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.gym.membership.dto.ProductRequest;
import com.gym.membership.entity.Product;
import com.gym.membership.entity.ProductAssignment;

public interface ProductService {
    Product createProduct(ProductRequest req);
    Product updateProduct(Long id, ProductRequest req);
    void deleteProduct(Long id);
    Page<Product> getAllProducts(String search, Pageable pageable);
    Product getProductById(Long id);
    ProductAssignment assignProduct(Long memberId, Long productId);
    List<ProductAssignment> getProductsForMember(Long memberId);
    void deleteAssignedProduct(Long assignmentId);
    ProductAssignment updateAssignedProduct(Long assignmentId, Long newProductId);
}
