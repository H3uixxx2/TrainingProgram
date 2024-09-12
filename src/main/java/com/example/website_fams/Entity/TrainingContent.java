package com.example.website_fams.Entity;

import com.example.website_fams.Enum.DeliveryType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(exclude = {"trainingUnit", "learningObjectives"})
@AllArgsConstructor
@NoArgsConstructor
public class TrainingContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private Long duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryType deliveryType;

    @Column(nullable = false)
    private boolean trainingFormat;

    @OneToMany(mappedBy = "trainingContent", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<LearningObjective> learningObjectives = new ArrayList<>();

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    private TrainingUnit trainingUnit;
}
