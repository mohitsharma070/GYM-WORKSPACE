package com.gym.membership.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "product_assignments")
public class ProductAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long memberId;  // from User Service

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private LocalDate assignedDate;

    // Getters and Setters
    public Long getId() { return id; }

    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }
}
