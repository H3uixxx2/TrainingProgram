package com.example.website_fams.Repository;

import com.example.website_fams.Entity.LearningObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningObjectiveRepository extends JpaRepository<LearningObjective, String> {

    @Query("SELECT MAX(l.code) FROM LearningObjective l WHERE l.code LIKE :prefix%")
    String findMaxCodeByPrefix(@Param("prefix") String prefix);

    List<LearningObjective> findBySyllabuses_TopicCode(String topicCode);
}
