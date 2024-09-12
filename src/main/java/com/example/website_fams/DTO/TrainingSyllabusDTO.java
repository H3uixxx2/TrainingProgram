package com.example.website_fams.DTO;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.context.annotation.Lazy;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrainingSyllabusDTO {
    private Long id;
    private int sequence;
    @JsonIgnore
    private TrainingProgramDTO trainingProgram;
    private SyllabusDTO syllabus;
}
