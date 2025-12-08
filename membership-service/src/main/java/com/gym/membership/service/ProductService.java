package com.gym.membership.service;

import com.gym.membership.dto.ProductRequest;
import com.gym.membership.entity.Product;
import com.gym.membership.entity.ProductAssignment;

import java.util.List;

public interface ProductService {
    Product createProduct(ProductRequest req);
    Product updateProduct(Long id, ProductRequest req);
    void deleteProduct(Long id);
    List<Product> getAllProducts();
    Product getProductById(Long id);
    ProductAssignment assignProduct(Long memberId, Long productId);
    List<ProductAssignment> getProductsForMember(Long memberId);
    void deleteAssignedProduct(Long assignmentId);
    ProductAssignment updateAssignedProduct(Long assignmentId, Long newProductId);
}
