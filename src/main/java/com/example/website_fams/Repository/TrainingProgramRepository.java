package com.example.website_fams.Repository;

import com.example.website_fams.DTO.SyllabusDTO;
import com.example.website_fams.Entity.Syllabus;
import com.example.website_fams.Entity.TrainingProgram;
import com.example.website_fams.Enum.TrainingProgramStatus;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, Long> {

    @Query("SELECT tp FROM TrainingProgram tp JOIN tp.createdBy cb WHERE " +
            "tp.id = :id OR " +
            "FUNCTION('DATE', tp.createdDate) = :createdDate OR " +
            "tp.duration = :duration OR " +
            "LOWER(tp.name) LIKE LOWER(CONCAT('%', :programName, '%')) OR " +
            "tp.status = :status OR " +
            "LOWER(cb.name) LIKE LOWER(CONCAT('%', :createdByName, '%'))")
    List<TrainingProgram> searchTrainingPrograms(
            @Param("id") Long id,
            @Param("duration") Long duration,
            @Param("createdDate") Date createdDate,
            @Param("programName") String programName,
            @Param("status") TrainingProgramStatus status,
            @Param("createdByName") String createdByName
    );

    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.id = :id")
    @NotNull
    Optional<TrainingProgram> findById(@Param("id") @NotNull Long id);

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.id ASC")
    List<TrainingProgram> findAllByIdAsc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.id DESC")
    List<TrainingProgram> findAllByIdDesc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.duration ASC")
    List<TrainingProgram> findAllByDurationAsc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.duration DESC")
    List<TrainingProgram> findAllByDurationDesc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.createdDate ASC")
    List<TrainingProgram> findAllByCreatedDateAsc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.createdDate DESC")
    List<TrainingProgram> findAllByCreatedDateDesc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.name ASC")
    List<TrainingProgram> findAllByNameAsc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.name DESC")
    List<TrainingProgram> findAllByNameDesc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.status ASC")
    List<TrainingProgram> findAllByStatusAsc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.status DESC")
    List<TrainingProgram> findAllByStatusDesc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.createdBy.name ASC")
    List<TrainingProgram> findAllByCreatedByAsc();

    @Query("SELECT t FROM TrainingProgram t ORDER BY t.createdBy.name DESC")
    List<TrainingProgram> findAllByCreatedByDesc();

    @Query("SELECT t FROM  TrainingProgram t WHERE t.id = :id and t.name = :name")
    Optional<TrainingProgram> findAllByIdAndName(@Param("id") Long id, @Param("name") String name);

    @Query("SELECT s FROM TrainingSyllabus ts " +
            "JOIN ts.syllabus s " +
            "WHERE ts.trainingProgram.id = :trainingProgramId")
    List<Syllabus> findSyllabusTopicCodesByTrainingProgramId(@Param("trainingProgramId") Long trainingProgramId);

}

