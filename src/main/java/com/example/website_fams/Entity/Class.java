package com.example.website_fams.Entity;

import com.example.website_fams.Enum.ClassStatus;
import com.example.website_fams.Enum.Location;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cglib.core.Local;

import java.sql.Time;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Class {

    @Id
    private String classID;

    @Column
    private String className;

    @Column
    private Long duration;

    @Enumerated(EnumType.STRING)
    private ClassStatus status;

    @Enumerated(EnumType.STRING)
    private Location location;

    @Column
    private LocalDateTime startDate;

    @Column
    private LocalDateTime endDate;

    @ManyToOne
    private Account createdBy;

    @Column
    private LocalDateTime createdDate;

    @ManyToOne
    private Account updatedBy;

    @Column
    private  LocalDateTime updatedDate;

    @Column
    private Time startTime;

    @Column
    private Time endTime;

    @Column
    private String FSU;

    @ManyToOne
    private TrainingProgram trainingProgram;
}
