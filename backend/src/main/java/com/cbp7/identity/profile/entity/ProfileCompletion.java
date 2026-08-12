package com.cbp7.identity.profile.entity;

import com.cbp7.identity.auth.entity.BaseEntity;
import com.cbp7.identity.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "profile_completion", schema = "identity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProfileCompletion extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "profile_completed", nullable = false)
    private Boolean profileCompleted;

    @Column(name = "completion_percentage", nullable = false)
    private Integer completionPercentage;

    @Column(name = "last_completed_step")
    private String lastCompletedStep;
}
