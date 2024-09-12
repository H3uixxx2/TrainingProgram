package com.example.website_fams.Repository;

import com.example.website_fams.Entity.LearningObjective;
import com.example.website_fams.Entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, String> {

    @Query("SELECT s FROM Syllabus s ORDER BY s.createdDate DESC")
    List<Syllabus> findAllByCreatedDateDesc();
//
    @Query("SELECT MAX(s.topicCode) FROM Syllabus s WHERE s.topicCode LIKE :prefix%")
    String findMaxTopicCodeByPrefix(@Param("prefix") String prefix);

    @Query("SELECT s FROM Syllabus s " +
            "JOIN s.createdBy cb " +
            "WHERE (LOWER(s.topicCode) LIKE LOWER(CONCAT('%', :topicCode, '%')) OR " +
            "LOWER(s.topicName) LIKE LOWER(CONCAT('%', :topicName, '%')) OR " +
            "LOWER(cb.name) LIKE LOWER(CONCAT('%', :createdByName, '%')))")
    List<Syllabus> searchSyllabuses(
            @Param("topicCode") String topicCode,
            @Param("topicName") String topicName,
            @Param("createdByName") String createdByName
    );

    @Query("SELECT s FROM Syllabus s " +
            "WHERE (FUNCTION('DATE', s.createdDate) >= :startDate) " +
            "AND (FUNCTION('DATE', s.createdDate) <= :endDate)")
    List<Syllabus> searchSyllabusesByDateRange(@Param("startDate") Date startDate,
                                               @Param("endDate") Date endDate);


    @Query("SELECT s FROM Syllabus s ORDER BY s.topicCode ASC ")
    List<Syllabus> findAllByTopicCodeAsc();

    @Query("SELECT s FROM Syllabus s ORDER BY s.topicCode DESC ")
    List<Syllabus> findAllByTopicCodeDesc();

    @Query("SELECT s FROM Syllabus s ORDER BY s.topicName ASC ")
    List<Syllabus> findAllByTopicNameAsc();

    @Query("SELECT s FROM Syllabus s ORDER BY s.topicName DESC ")
    List<Syllabus> findAllByTopicNameDesc();

    @Query("SELECT s FROM Syllabus s ORDER BY s.createdDate ASC ")
    List<Syllabus> findAllByCreatedDateAsc();

    @Query("SELECT s FROM Syllabus s ORDER BY s.createdBy.name ASC ")
    List<Syllabus> findAllByCreatedByAsc();

    @Query("SELECT s FROM Syllabus s ORDER BY s.createdBy.name ASC ")
    List<Syllabus> findAllByCreatedByDesc();

    @Query("SELECT s FROM Syllabus s ORDER BY s.duration ASC ")
    List<Syllabus> findAllByDurationAsc();

    @Query("SELECT s FROM Syllabus s ORDER BY s.duration DESC ")
    List<Syllabus> findAllByDurationDesc();

    @Query("SELECT DISTINCT lo.code FROM LearningObjective lo " +
            "JOIN lo.trainingContent tc " +
            "JOIN tc.trainingUnit tu " +
            "JOIN tu.syllabus s " +
            "WHERE s.topicCode = :topicCode")
    List<String> findDistinctLearningObjectivesBySyllabusTopicCode(@Param("topicCode") String topicCode);
}
