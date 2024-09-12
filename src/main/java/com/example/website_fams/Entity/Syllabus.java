package com.example.website_fams.Entity;

import com.example.website_fams.Entity.Account;
import com.example.website_fams.Entity.LearningObjective;
import com.example.website_fams.Entity.TrainingSyllabus;
import com.example.website_fams.Entity.TrainingUnit;
import com.example.website_fams.Enum.LevelSyllabus;
import com.example.website_fams.Enum.SyllabusStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(exclude = {"courseObjective", "outlines", "trainingSyllabuses"})
@AllArgsConstructor
@NoArgsConstructor
public class Syllabus {

    @Id
    private String topicCode;

    @Column
    private String topicName;

    @Enumerated(EnumType.STRING)
    private SyllabusStatus status;

    @Column
    private String technicalGroup;

    @Column
    private String version;

    @Enumerated(EnumType.STRING)
    private LevelSyllabus level;

    @Column
    private Long trainingAudience;

    @ManyToOne
    private Account createdBy;

    @Column
    private LocalDateTime createdDate;

    @ManyToOne
    private Account updatedBy;

    @Column
    private LocalDateTime updatedDate;

    @Column
    private Long duration;

    @ManyToOne
    @JsonIgnore
    @ToString.Exclude
    private LearningObjective courseObjective;

    @Column
    @OneToMany(mappedBy = "syllabus", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrainingUnit> outlines;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrainingSyllabus> trainingSyllabuses;
}
