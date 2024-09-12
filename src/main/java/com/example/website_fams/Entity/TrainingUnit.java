package com.example.website_fams.Entity;

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
@EqualsAndHashCode(exclude = {"syllabus", "trainingContents"})
@AllArgsConstructor
@NoArgsConstructor
public class TrainingUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long unitCode;

    @ManyToOne
    @JsonIgnore
    private Syllabus syllabus;

    @Column
    private String unitName;

    @Column
    private int dayNumber;

    @JsonIgnore
    @OneToMany(mappedBy = "trainingUnit", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrainingContent> trainingContents = new ArrayList<>();
}
