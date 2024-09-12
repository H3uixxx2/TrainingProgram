package com.example.website_fams.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@EqualsAndHashCode(exclude = {"trainingContent", "syllabuses"})
@AllArgsConstructor
@NoArgsConstructor
public class LearningObjective {

    @Id
    private String code;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false)
    private char type;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "training_content_id", referencedColumnName = "id")
    @JsonIgnore
    private TrainingContent trainingContent;

    @OneToMany(mappedBy = "courseObjective", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Syllabus> syllabuses;
}
