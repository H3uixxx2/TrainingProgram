package com.example.website_fams.RestController;

import com.example.website_fams.DTO.ClassDTO;
import com.example.website_fams.DTO.LearningObjectiveDTO;
import com.example.website_fams.DTO.SyllabusDTO;
import com.example.website_fams.DTO.TrainingProgramDTO;
import com.example.website_fams.Enum.ClassStatus;
import com.example.website_fams.Enum.LevelSyllabus;
import com.example.website_fams.DTO.TrainingProgramDTO;
import com.example.website_fams.Enum.ClassStatus;
import com.example.website_fams.Enum.TrainingProgramStatus;
import com.example.website_fams.Service.ClassService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.*;

@RestController
@RequestMapping("/api/class")
public class ClassController {

    @Autowired
    ClassService classService;

    @PostMapping("/add")
    public ResponseEntity<?> addNewClass(@RequestBody JsonNode jsonNode) {
        String name = jsonNode.has("name") ? jsonNode.get("name").asText(null) : null;
        String location = jsonNode.has("location") ? jsonNode.get("location").asText(null) : null;
        String status = jsonNode.has("status") ? jsonNode.get("status").asText(null) : null;
        Long startTime = jsonNode.has("startTime") ? jsonNode.get("startTime").asLong() : null;
        Long endTime = jsonNode.has("endTime") ? jsonNode.get("endTime").asLong() : null;
        Long startDate = jsonNode.has("startDate") ? jsonNode.get("startDate").asLong() : null;
        Long endDate = jsonNode.has("endDate") ? jsonNode.get("endDate").asLong() : null;
        Long createdBy = jsonNode.has("createdBy") ? jsonNode.get("createdBy").asLong() : null;
        Long trainingId = jsonNode.has("trainingId") ? jsonNode.get("trainingId").asLong() : null;
        String FSU = jsonNode.has("FSU") ? jsonNode.get("FSU").asText(null) : null;
        Long duration = jsonNode.has("duration") ? jsonNode.get("duration").asLong() : null;

        if (name == null) {
            return ResponseEntity.badRequest().body("Name is required");
        }

        ClassDTO saved = classService.createNewClass(createdBy, name, location, status, startTime, endTime, startDate, endDate, trainingId, FSU, duration);
        if (saved != null) {
            return ResponseEntity.ok().body(saved);
        }
        return ResponseEntity.badRequest().body("ERROR");
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllClasses() {
        List<ClassDTO> classes = classService.viewAllItems();
        if (classes.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No classes found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok().body(classes);
    }

    @GetMapping("/search")
    public ResponseEntity<?> getTrainingProgramsBySearch(
            @RequestParam(name = "query", required = false, defaultValue = "") List<String> query,
            @RequestParam(name = "location", required = false, defaultValue = "") List<String> location,
            @RequestParam(name = "fromDate", required = false) Optional<Long> fromDate,
            @RequestParam(name = "toDate", required = false) Optional<Long> toDate,
            @RequestParam(name = "status", required = false, defaultValue = "") List<String> status) {

        List<ClassDTO> classes;

        Long start = fromDate.orElse(null);
        Long end = toDate.orElse(null);

        boolean allParametersEmpty = (query == null || query.isEmpty())
                                    && location.isEmpty()
                                    && fromDate.isEmpty()
                                    && toDate.isEmpty()
                                    && status.isEmpty();

        if (allParametersEmpty)
            classes = classService.viewAllItems();
        else if(location.isEmpty() && start == null && end == null && status.isEmpty()){
            classes = classService.searchClasses(query);
        } else if (query == null || query.isEmpty()) {
            if (location.isEmpty())
                location = Arrays.asList("HCM", "HN", "DN");
            if (status.isEmpty())
                status = Arrays.asList("PENDING", "PLANNING", "ACTIVE", "COMPLETED", "DRAFT");
            classes = classService.searchClassesByFilter(location, start, end, status);
        } else {
            if (location.isEmpty())
                location = Arrays.asList("HCM", "HN", "DN");
            if (status.isEmpty())
                status = Arrays.asList("PENDING", "PLANNING", "ACTIVE", "COMPLETED", "DRAFT");
            classes = classService.searchClass(query, location, start, end, status);
        }


        if (classes.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No training programs found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok().body(classes);
    }

    @GetMapping("detail")
    public ResponseEntity<?> getSyllabusById(@RequestParam("code") String code) {
        ClassDTO classDTO = classService.findByID(code);
        if (classDTO == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No syllabus found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok(classDTO);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> editClass(@RequestParam String id, @RequestBody Map<String, Object> updateData) {
        try {
            String className = (String) updateData.get("className");
            if (className == null || className.trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Class Name is required and cannot be null or empty");
                return ResponseEntity.status(400).body(response);
            }

            // Validate startTime
            Long startTime = (Long) updateData.get("startTime");
            if (startTime == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Start Time is required and cannot be null");
                return ResponseEntity.status(400).body(response);
            }

            // Validate endTime
            Long endTime = (Long) updateData.get("endTime");
            if (endTime == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "End Time is required and cannot be null");
                return ResponseEntity.status(400).body(response);
            }

            // Validate startDate
            Long startDate = (Long) updateData.get("startDate");
            if (startDate == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Start Date is required and cannot be null");
                return ResponseEntity.status(400).body(response);
            }

            // Validate location
            String location = (String) updateData.get("location");
            if (location == null || location.trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Location is required and cannot be null or empty");
                return ResponseEntity.status(400).body(response);
            }

            // Validate fsu
            String fsu = (String) updateData.get("fsu");
            if (fsu == null || fsu.trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "FSU is required and cannot be null or empty");
                return ResponseEntity.status(400).body(response);
            }

            // Validate trainingProgramId
            String trainingProgramId = (String) updateData.get("trainingProgramId");
            if (trainingProgramId == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Training Program ID is required and cannot be null");
                return ResponseEntity.status(400).body(response);
            }

            int updatedBy = (int) updateData.get("updatedBy");
            if (updatedBy == 0) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Updated By is required and cannot be null");
                return ResponseEntity.status(400).body(response);
            }

            ClassDTO classDTO = classService.updateClass(id, className, startTime, endTime, startDate, location, fsu, updatedBy, trainingProgramId);

            return ResponseEntity.ok(classDTO);
        } catch (EntityNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error updating syllabus");
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/change-status")
    public ResponseEntity<?> changeStatus(@RequestParam String id, @RequestBody Map<String, Object> data) {
        try {

            String newstatus = (String) data.get("status");
            System.out.println(newstatus);
            ClassStatus status = ClassStatus.valueOf(newstatus);


            ClassDTO classDTO = classService.change_status(id, status);

            return ResponseEntity.ok(classDTO);
        } catch (EntityNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error updating class");
            return ResponseEntity.status(500).body(response);
        }
    }
    @PostMapping("/change_status/{classID}")
    public ResponseEntity<?> changeClassStatus(@PathVariable String classID, @RequestBody Map<String, String> request) {
        String status = request.get("status").toUpperCase();  // Convert to uppercase to handle case insensitivity
        try {
            ClassStatus newStatus = ClassStatus.valueOf(status);
            classService.changeStatus(classID, newStatus);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Class status changed successfully.");
            return ResponseEntity.ok().body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid status.");
            return ResponseEntity.status(400).body(response);
        } catch (EntityNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("message", "An unexpected error occurred.");
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/delete/{classID}")
    public ResponseEntity<?> deleteClass(@PathVariable String classID) {
        try {
            classService.deleteClass(classID);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Class deleted successfully.");
            return ResponseEntity.ok().body(response);
        } catch (EntityNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("message", "An unexpected error occurred.");
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/allByTraining")
    public ResponseEntity<?> getByTrainig(@RequestParam(name = "id", required = false, defaultValue = "") Long id) {
        List<ClassDTO> classes = classService.findByTrainingID(id);
        if (classes.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No classes found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok().body(classes);
    }
}
