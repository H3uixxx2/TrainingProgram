package com.example.website_fams.DTO;

import com.example.website_fams.Entity.TrainingContent;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.List;

@Data
public class LearningObjectiveDTO {
    private String code;
    private String name;
    private String description;
    private char type;
    @JsonIgnore
    private List<SyllabusDTO> syllabuses;
    @JsonIgnore
    private TrainingContent trainingContent;
}
