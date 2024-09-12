package com.example.website_fams.Repository;

import com.example.website_fams.Entity.TrainingProgram;
import com.example.website_fams.Entity.TrainingSyllabus;
import com.example.website_fams.Entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingSyllabusRepository extends JpaRepository<TrainingSyllabus, Long> {

    // Phương thức để xóa tất cả các TrainingSyllabus liên quan đến một Syllabus
    void deleteAllBySyllabus(Syllabus syllabus);

    // Phương thức để tìm tất cả các TrainingSyllabus liên quan đến một Syllabus
    List<TrainingSyllabus> findAllBySyllabus(Syllabus syllabus);

    @Modifying
    @Query("DELETE FROM TrainingSyllabus ts WHERE ts.trainingProgram.id = :trainingProgramId")
    void deleteByTrainingProgramId(@Param("trainingProgramId") Long trainingProgramId);

    @Query("SELECT ts FROM TrainingSyllabus ts WHERE ts.trainingProgram.id = :trainingProgramId")
    List<TrainingSyllabus> findAllByTrainingProgramId(@Param("trainingProgramId") Long trainingProgramId);
}
