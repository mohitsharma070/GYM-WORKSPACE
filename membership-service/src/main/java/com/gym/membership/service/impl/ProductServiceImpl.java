package com.gym.membership.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.gym.membership.dto.ProductRequest;
import com.gym.membership.entity.Product;
import com.gym.membership.entity.ProductAssignment;
import com.gym.membership.exception.ResourceNotFoundException;
import com.gym.membership.repository.ProductAssignmentRepository;
import com.gym.membership.repository.ProductRepository;
import com.gym.membership.service.ProductService;
import com.gym.membership.specification.ProductSpecification;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepo;
    private final ProductAssignmentRepository productAssignmentRepo;

    public ProductServiceImpl(ProductRepository productRepo,
                              ProductAssignmentRepository productAssignmentRepo) {
        this.productRepo = productRepo;
        this.productAssignmentRepo = productAssignmentRepo;
    }

    @Override
    public Product createProduct(ProductRequest req) {

        Product p = new Product();
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setQuantity(req.getQuantity());
        p.setCategory(req.getCategory());

        return productRepo.save(p);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Product updateProduct(Long id, ProductRequest req) {

        Product p = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setQuantity(req.getQuantity());
        p.setCategory(req.getCategory());

        return productRepo.save(p);
    }

    @Override
    @SuppressWarnings("unchecked")
    public void deleteProduct(Long id) {
        if (!productRepo.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepo.deleteById(id);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Page<Product> getAllProducts(String search, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.containsTextInAttributes(search);
        return productRepo.findAll(spec, pageable);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Product getProductById(Long id) {
        return productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Override
    @SuppressWarnings("unchecked")
    public ProductAssignment assignProduct(Long memberId, Long productId) {

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductAssignment pa = new ProductAssignment();
        pa.setMemberId(memberId);
        pa.setProduct(product);
        pa.setAssignedDate(LocalDate.now());

        return productAssignmentRepo.save(pa);
    }

    @Override
    public List<ProductAssignment> getProductsForMember(Long memberId) {
        return productAssignmentRepo.findByMemberId(memberId);
    }

    @Override
    @SuppressWarnings("unchecked")
    public void deleteAssignedProduct(Long assignmentId) {
        if (!productAssignmentRepo.existsById(assignmentId)) {
            throw new ResourceNotFoundException("Assigned product not found with id: " + assignmentId);
        }
        productAssignmentRepo.deleteById(assignmentId);
    }

    @Override
    @SuppressWarnings("unchecked")
    public ProductAssignment updateAssignedProduct(Long assignmentId, Long newProductId) {

        ProductAssignment assignment = productAssignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Product assignment not found"));

        Product newProduct = productRepo.findById(newProductId)
                .orElseThrow(() -> new ResourceNotFoundException("New product not found"));

        assignment.setProduct(newProduct);
        assignment.setAssignedDate(LocalDate.now());

        return productAssignmentRepo.save(assignment);
    }
}
