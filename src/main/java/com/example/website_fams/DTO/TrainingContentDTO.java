package com.example.website_fams.DTO;

import com.example.website_fams.Enum.DeliveryType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.List;
@Data
public class TrainingContentDTO {
    private Long id;
    private String content;
    private Long duration;
    private DeliveryType deliveryType;
    private Boolean trainingFormat;
    @JsonIgnore
    private TrainingUnitDTO trainingUnit;
    @JsonIgnore
    private List<LearningObjectiveDTO> learningObjectives;
}
