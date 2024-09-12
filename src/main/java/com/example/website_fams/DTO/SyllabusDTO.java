package com.example.website_fams.DTO;

import com.example.website_fams.Entity.Account;
import com.example.website_fams.Enum.LevelSyllabus;
import com.example.website_fams.Enum.SyllabusStatus;
import com.example.website_fams.Enum.TrainingProgramStatus;
import lombok.Data;

import java.util.List;

@Data
public class SyllabusDTO {

    private String topicCode;
    private String topicName;
    private SyllabusStatus status;
    private String technicalGroup;
    private String version;
    private LevelSyllabus level;
    private Long trainingAudience;
    private Account createdBy;
    private Long createdDate;
    private Account updatedBy;
    private Long updatedDate;
    private Long duration;
    private LearningObjectiveDTO courseObjective;
    private List<TrainingUnitDTO> outlines;
}
