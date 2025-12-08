package com.gym.membership.controller;

import com.gym.membership.dto.ProductRequest;
import com.gym.membership.entity.Product;
import com.gym.membership.entity.ProductAssignment;
import com.gym.membership.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // GET ALL PRODUCTS
    @GetMapping
    public ResponseEntity<List<Product>> all() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // GET SINGLE PRODUCT
    @GetMapping("/{id}")
    public ResponseEntity<Product> one(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // CREATE PRODUCT
    @PostMapping
    public ResponseEntity<Product> create(@RequestBody ProductRequest req) {
        return ResponseEntity.status(201).body(productService.createProduct(req));
    }

    // UPDATE PRODUCT
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody ProductRequest req) {
        return ResponseEntity.ok(productService.updateProduct(id, req));
    }

    // DELETE PRODUCT
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // =====================================================================
    //            PRODUCT ASSIGNMENT API
    // =====================================================================

    // ASSIGN PRODUCT TO MEMBER
    @PostMapping("/assign/{memberId}/{productId}")
    public ResponseEntity<ProductAssignment> assignProduct(
            @PathVariable Long memberId,
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(productService.assignProduct(memberId, productId));
    }

    // GET ALL PRODUCTS OF A MEMBER
    @GetMapping("/assigned/{memberId}")
    public ResponseEntity<List<ProductAssignment>> getAssignedProducts(
            @PathVariable Long memberId
    ) {
        return ResponseEntity.ok(productService.getProductsForMember(memberId));
    }

    // REMOVE ASSIGNED PRODUCT
    @DeleteMapping("/assigned/delete/{assignmentId}")
    public ResponseEntity<Void> deleteAssignedProduct(@PathVariable Long assignmentId) {
        productService.deleteAssignedProduct(assignmentId);
        return ResponseEntity.noContent().build();
    }

    // UPDATE ASSIGNED PRODUCT
    @PutMapping("/assigned/update/{assignmentId}/{newProductId}")
    public ResponseEntity<ProductAssignment> updateAssignedProduct(
            @PathVariable Long assignmentId,
            @PathVariable Long newProductId
    ) {
        return ResponseEntity.ok(productService.updateAssignedProduct(assignmentId, newProductId));
    }
}
