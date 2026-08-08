package com.cbp7.admin.student.entity;

import com.cbp7.auth.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(schema = "program", name = "admin_preferences")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPreferences extends BaseEntity {

    @Column(name = "admin_id", nullable = false, unique = true)
    private String adminId;

    @Builder.Default
    @Column(name = "visible_columns", nullable = false, columnDefinition = "TEXT")
    private String visibleColumns = "{\"showEmail\":true,\"showPhone\":true,\"showBranch\":true,\"showPayment\":true,\"showAttendance\":true,\"showRegistration\":true}";
}
