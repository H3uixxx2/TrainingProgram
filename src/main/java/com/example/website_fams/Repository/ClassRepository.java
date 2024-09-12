package com.example.website_fams.Repository;

import com.example.website_fams.Entity.Class;
import com.example.website_fams.Enum.ClassStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class, String> {

    @Query("SELECT MAX(l.classID) FROM Class l WHERE l.classID LIKE :prefix%")
    String findMaxCodeByPrefix(@Param("prefix") String prefix);

    @Query("SELECT c FROM Class c ORDER BY c.createdDate DESC")
    List<Class> findAllByCreatedDateDesc();

    @Query("SELECT c FROM Class c WHERE " +
            "LOWER(c.classID) LIKE LOWER(CONCAT('%', :input, '%')) OR " +
            "LOWER(c.className) LIKE LOWER(CONCAT('%', :input, '%')) OR " +
            "LOWER(c.createdBy.name) LIKE LOWER(CONCAT('%', :input, '%')) OR " +
            "c.status = :status")
    List<Class> searchClasses(@Param("input") String classCode,
                              @Param("input") String className,
                              @Param("input") String createdBy,
                              @Param("status") ClassStatus status);

    @Query("SELECT c FROM Class c WHERE " +
            "(c.location IN :location) AND " +
            "(FUNCTION('DATE', c.startDate) >= :fromDate) AND " +
            "(FUNCTION('DATE', c.endDate) <= :toDate) AND " +
            "(c.status IN :status)")
    List<Class> findClasses(
            @Param("location") List<String> location,
            @Param("fromDate") Date fromDate,
            @Param("toDate") Date toDate,
            @Param("status") List<ClassStatus> status);

    @Query("SELECT c FROM Class c JOIN c.trainingProgram tp WHERE tp.id = :trainingID")
    List<Class> findByTrainingProgram_TrainingID(@Param("trainingID") Long trainingID);
}
