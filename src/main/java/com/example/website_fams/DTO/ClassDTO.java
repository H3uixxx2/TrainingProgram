package com.example.website_fams.DTO;

import com.example.website_fams.Entity.Account;
import com.example.website_fams.Enum.ClassStatus;
import com.example.website_fams.Enum.Location;
import lombok.Data;

@Data
public class ClassDTO {
    private String classID;
    private TrainingProgramDTO trainingProgramDTO;
    private String className;
    private Long duration;
    private Location location;
    private ClassStatus status;
    private Long startDate;
    private Long endDate;
    private Account createdBy;
    private Long createdDate;
    private Account updatedBy;
    private Long updatedDate;
    private Long startTime;
    private Long endTime;
    private String FSU;
}
