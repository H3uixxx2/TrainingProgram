package com.example.website_fams.Repository;

import com.example.website_fams.Entity.TrainingContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingContentRepository extends JpaRepository<TrainingContent, Long> {

}
