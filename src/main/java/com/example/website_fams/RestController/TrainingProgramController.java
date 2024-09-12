package com.example.website_fams.RestController;

import com.example.website_fams.DTO.SyllabusDTO;
import com.example.website_fams.DTO.TrainingProgramDTO;
import com.example.website_fams.DTO.TrainingSyllabusDTO;
import com.example.website_fams.Entity.TrainingProgram;
import com.example.website_fams.DTO.TrainingSyllabusDTO;
import com.example.website_fams.Entity.Syllabus;
import com.example.website_fams.Entity.TrainingProgram;
import com.example.website_fams.Entity.TrainingProgram;
import com.example.website_fams.Enum.TrainingProgramStatus;
import com.example.website_fams.Enum.DuplicateHandleType;
import com.example.website_fams.Service.SyllabusService;
import com.example.website_fams.Service.TrainingProgramService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityNotFoundException;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training_program")
public class TrainingProgramController {

    @Autowired
    private TrainingProgramService trainingProgramService;
    @Autowired
    private SyllabusService syllabusService;

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTrainingProgram(@PathVariable Long id) {
        try {
            trainingProgramService.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Training program deleted successfully.");
            return ResponseEntity.ok().body(response);
        } catch (EntityNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        }
    }

    @PostMapping("/change_status/{id}")
    public ResponseEntity<?> changeTrainingProgramStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        try {
            TrainingProgramStatus newStatus = TrainingProgramStatus.valueOf(status);
            trainingProgramService.changeStatus(id, newStatus);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Training program status changed successfully.");
            return ResponseEntity.ok().body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid status.");
            return ResponseEntity.status(400).body(response);
        } catch (EntityNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        }
    }

    @PostMapping("/create_duplicate/{id}")
    public ResponseEntity<?> createDuplicateTrainingProgram(@PathVariable Long id) {
        try {
            TrainingProgramDTO duplicatedProgram = trainingProgramService.createDuplicateTrainingProgram(id);
            return ResponseEntity.ok().body(duplicatedProgram);
        } catch (EntityNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllTrainingPrograms() {
        List<TrainingProgramDTO> trainingPrograms = trainingProgramService.viewAllItems();
        if (trainingPrograms.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No training programs found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok().body(trainingPrograms);
    }

    @GetMapping("/search")
    public ResponseEntity<?> getTrainingProgramsBySearch(@RequestParam(name = "query", required = false, defaultValue = "") List<String> query) {
        List<TrainingProgramDTO> trainingPrograms = trainingProgramService.searchTrainingPrograms(query);
        if (trainingPrograms.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No training programs found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok().body(trainingPrograms);
    }

    @GetMapping("/detail")
    public ResponseEntity<?> getTrainingProgramById(@RequestParam("id") Long id) {
        Map<String, Object> trainingProgram = trainingProgramService.findByIDWithSyllabus(id);
        if (trainingProgram == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No training programs found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok(trainingProgram);
    }

    @PostMapping("/add")
    public ResponseEntity<String> createNewTrainingProgram(@RequestBody JsonNode data) {
        String name = data.has("name") ? data.get("name").asText(null) : null;
        Long createdBy = data.has("createdBy") ? data.get("createdBy").asLong() : null;
        Long createdDate = data.has("createdDate") ? data.get("createdDate").asLong() : null;
        Long duration = data.has("duration") ? data.get("duration").asLong() : null;
        JsonNode syllabusList = data.has("syllabuses") ? data.get("syllabuses") : null;

        if (name == null) {
            return ResponseEntity.badRequest().body("Training program name is required");
        }
        TrainingProgramDTO trainingDTO = new TrainingProgramDTO();
        trainingDTO.setName(name);
        if (duration != null) {
            trainingDTO.setDuration(duration);
        }
        List<String> syllabusCodes = new ArrayList<>();
        if (syllabusList != null && syllabusList.isArray()) {
            for (JsonNode node: syllabusList) {
                syllabusCodes.add(node.get("topicCode").asText());
            }
        }
        trainingDTO.setCreatedDate(createdDate);
        System.out.println(trainingDTO);

        TrainingProgramDTO saved = trainingProgramService.userCreateNewTrainingProgram(createdBy, trainingDTO);

        if (saved != null) {
            trainingProgramService.setSyllabus(saved, syllabusCodes);
            return ResponseEntity.ok().body("Create new training program successfully!");
        }
        return ResponseEntity.badRequest().body("Some data is invalid. Please check them again!");
    }

    @GetMapping("/sort")
    public ResponseEntity<?> sortTrainingPrograms(
            @RequestParam(name = "sortField", required = false, defaultValue = "id") String sortField,
            @RequestParam(name = "sortDirection", required = false, defaultValue = "asc") String sortDirection) {

        List<TrainingProgramDTO> trainingPrograms = trainingProgramService.sortTrainingPrograms(sortField, sortDirection);
        if (trainingPrograms.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No training programs found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok().body(trainingPrograms);
    }

    @PostMapping("/import")
    public ResponseEntity<?> createTrainingProgramByImport(@RequestParam("file") MultipartFile file, @RequestParam("id") boolean sId,
                                                           @RequestParam("name") boolean sName, @RequestParam("createdDate") Long createdDate,
                                                           @RequestParam("handleType") String handleType,
                                                           @Param("createdBy") Long createdBy) {

        if (file.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "File is required");
            return ResponseEntity.badRequest().body(response);
        }
        try {
            Map<String, Boolean> duplicateScanning = new HashMap<>();
            duplicateScanning.put("id", sId);
            duplicateScanning.put("name", sName);
            int success = trainingProgramService.createTrainingProgramByImportFile(file, duplicateScanning, DuplicateHandleType.valueOf(handleType), createdBy, createdDate);
            return ResponseEntity.ok().body("Add "+success+" rows successfully!");
        } catch (IOException | InvalidFormatException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<?> updateTrainingProgram(@PathVariable Long id, @RequestBody Map<String, Object> updateData) {
        try {
            if (!updateData.containsKey("name") || updateData.get("name") == null || updateData.get("name").toString().trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Name is required and cannot be null or empty");
                return ResponseEntity.status(400).body(response);
            }

            String name = (String) updateData.get("name");

            Long duration = null;
            if (updateData.containsKey("duration") && updateData.get("duration") != null) {
                duration = Long.parseLong(updateData.get("duration").toString());
            }

            TrainingProgramStatus status = null;
            if (updateData.containsKey("status") && updateData.get("status") != null) {
                status = TrainingProgramStatus.valueOf(updateData.get("status").toString().toUpperCase());
            }
            List<Map<String, Object>> syllabuses = (List<Map<String, Object>>) updateData.get("syllabuses");
            List<String> topicCodes = new ArrayList<>();

            if (syllabuses != null) {
                for (Map<String, Object> syllabus : syllabuses) {
                    String topicCode = (String) syllabus.get("topicCode");
                    if (topicCode != null) {
                        topicCodes.add(topicCode);
                    }
                }
            }
            TrainingProgramDTO updatedProgram = trainingProgramService.updateTrainingProgram(id, name, duration, status, topicCodes);

            return ResponseEntity.ok().body(updatedProgram);
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
            response.put("message", "Error updating program");
            return ResponseEntity.status(500).body(response);
        }
    }
}


