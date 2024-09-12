package com.example.website_fams.DTO;

import com.example.website_fams.Entity.Syllabus;
import com.example.website_fams.Entity.TrainingContent;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.List;

@Data
public class TrainingUnitDTO {
    private Long unitCode;
    @JsonIgnore
    private Syllabus syllabus;
    private String unitName;
    private int dayNumber;
    private List<TrainingContentDTO> trainingContents;
}
