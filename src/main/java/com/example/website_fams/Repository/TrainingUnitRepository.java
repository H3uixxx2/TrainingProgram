package com.example.website_fams.Repository;

import com.example.website_fams.Entity.TrainingUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingUnitRepository extends JpaRepository<TrainingUnit, Long> {

    @Query("SELECT t FROM TrainingUnit t WHERE t.syllabus.topicCode = :topicCode")
    List<TrainingUnit> findByTopicCode(String topicCode);
}
