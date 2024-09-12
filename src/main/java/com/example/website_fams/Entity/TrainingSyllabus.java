package com.example.website_fams.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrainingSyllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private int sequence;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    private TrainingProgram trainingProgram;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    private Syllabus syllabus;
}