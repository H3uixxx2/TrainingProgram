package com.example.website_fams.Entity;

import com.example.website_fams.Enum.TrainingProgramStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class TrainingProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    @NotNull(message = "Program name is required")
    private String name;

    @Enumerated(EnumType.STRING)
    private TrainingProgramStatus status;

    @Column
    private LocalDateTime createdDate;

    @ManyToOne
    private Account createdBy;

    @Column
    private LocalDateTime updatedDate;

    @ManyToOne
    private Account updatedBy;

    @Column
    private Long duration;

    @Column
    private String generalInformation;

    @OneToMany(mappedBy = "trainingProgram", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<Class> classList;

    @OneToMany(mappedBy = "trainingProgram", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<TrainingSyllabus> syllabuses = new ArrayList<>();

}