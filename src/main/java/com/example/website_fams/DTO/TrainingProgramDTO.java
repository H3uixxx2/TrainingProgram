package com.example.website_fams.DTO;

import com.example.website_fams.Entity.Account;
import com.example.website_fams.Enum.TrainingProgramStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Lazy;

import java.util.ArrayList;
import java.util.List;

@Data
@Getter
@Setter
public class TrainingProgramDTO {
    private Long id;
    private String name;
    private TrainingProgramStatus status;
    private Long createdDate;
    private Account createdBy;
    private Long updatedDate;
    private Account updatedBy;
    private Long duration;
    private String generalInformation;
    @Lazy
    private List<TrainingSyllabusDTO> syllabuses = new ArrayList<>();
}
