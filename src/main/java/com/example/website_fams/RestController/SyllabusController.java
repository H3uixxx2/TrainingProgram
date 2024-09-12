package com.example.website_fams.RestController;

import com.example.website_fams.DTO.LearningObjectiveDTO;
import com.example.website_fams.DTO.SyllabusDTO;
import com.example.website_fams.Entity.Syllabus;
import com.example.website_fams.Enum.LevelSyllabus;
import com.example.website_fams.Enum.SyllabusStatus;
import com.example.website_fams.Service.LearningObjectiveService;
import com.example.website_fams.Service.SyllabusService;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityNotFoundException;
import jakarta.websocket.server.PathParam;
import org.modelmapper.ModelMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.websocket.server.PathParam;
import org.modelmapper.ModelMapper;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/syllabus")
public class SyllabusController {

    @Autowired
    private SyllabusService syllabusService;

    @Autowired
    private LearningObjectiveService learningObjectiveService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllSyllabi() {
        List<SyllabusDTO> syllabi = syllabusService.viewAllItems();
        if (syllabi.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No syllabus found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok().body(syllabi);
    }

    @PostMapping("add")
    public ResponseEntity<?> addNewSyllabus(@RequestBody JsonNode jsonData) {
        String topicName = jsonData.get("topicName").asText();
        String technicalGroup = jsonData.get("technicalGroup").asText();
        String version = jsonData.get("version").asText();
        String level = jsonData.get("level").asText();
        String status = jsonData.get("status").asText();
        Long trainingAudience = (jsonData.get("trainingAudience") != null)
                ? jsonData.get("trainingAudience").asLong()
                : null;
        Long createdBy = (jsonData.get("createdBy") != null)
                ? jsonData.get("createdBy").asLong()
                :null;
        LocalDateTime localDateTime = LocalDateTime.now();
        Long createdDate = localDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

        String objName = jsonData.get("courseName").asText();
        String objDescription = jsonData.get("courseDescription").asText();
        char type = (jsonData.get("objectiveType") != null && !jsonData.get("objectiveType").asText().isEmpty())
                ? jsonData.get("objectiveType").asText().charAt(0)
                : '\0';

        Long duration = jsonData.has("duration") ? jsonData.get("duration").asLong() : null;

        LearningObjectiveDTO learningObjectiveDTO = new LearningObjectiveDTO();
        learningObjectiveDTO.setName(objName);
        learningObjectiveDTO.setType(type);
        learningObjectiveDTO.setDescription(objDescription);

        LearningObjectiveDTO savedLearningObjective = learningObjectiveService.addNew(learningObjectiveDTO);

        SyllabusDTO saved = syllabusService.userCreateSyllabus(createdBy, topicName, SyllabusStatus.valueOf(status), technicalGroup, version, LevelSyllabus.valueOf(level),
                trainingAudience, createdDate, savedLearningObjective, duration);

        if (saved != null) {
            return ResponseEntity.ok().body(saved);
        } else {
            return ResponseEntity.badRequest().body("ERROR");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> getSyllabusesBySearch(
            @RequestParam(name = "query", required = false, defaultValue = "") List<String> query,
            @RequestParam(name = "startDate", required = false) Optional<Long> startDate,
            @RequestParam(name = "endDate", required = false) Optional<Long> endDate) {

        Long start = startDate.orElse(null);
        Long end = endDate.orElse(null);

        List<SyllabusDTO> syllabuses;
        if ((query == null || query.isEmpty()) && start == null && end == null) {
            syllabuses = syllabusService.viewAllItems();
        } else if ((query != null && !query.isEmpty()) && (start == null && end == null)) {
            syllabuses = syllabusService.searchSyllabusByQuery(query);
        } else if ((start != null && end != null) && (query == null || query.isEmpty())) {
            syllabuses = syllabusService.searchSyllabusByDateRange(start, end);
        } else {
            syllabuses = syllabusService.searchSyllabus(query, start, end);
        }

        if (syllabuses.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No syllabuses found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok().body(syllabuses);
    }

    @GetMapping("/sort")
    public ResponseEntity<?> sortSyllabus(
            @RequestParam(name = "sortField", required = false, defaultValue = "id") String sortField,
            @RequestParam(name = "sortDirection", required = false, defaultValue = "asc") String sortDirection) {

        List<SyllabusDTO> syllabus = syllabusService.sortSyllabus(sortField, sortDirection);
        if (syllabus.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No training programs found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok().body(syllabus);
    }

    @GetMapping("/detail")
    public ResponseEntity<?> getSyllabusById(@RequestParam("code") String code) {
        SyllabusDTO syllabus = syllabusService.findByID(code);
        if (syllabus == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No syllabus found.");
            return ResponseEntity.ok().body(response);
        }
        return ResponseEntity.ok(syllabus);
    }

    @PostMapping("/edit")
    public ResponseEntity<?> editSyllabus(@RequestParam String code, @RequestBody Map<String, Object> updateData) {
        try {

            String topicName = (String) updateData.get("topicName");
            if (topicName == null || topicName.trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Topic Name is required and cannot be null or empty");
                return ResponseEntity.status(400).body(response);
            }

            String version = (String) updateData.get("version");
            if (version == null || version.trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Version is required and cannot be null or empty");
                return ResponseEntity.status(400).body(response);
            }

            LevelSyllabus level = null;
            if (updateData.containsKey("level") && updateData.get("level") != null) {
                try {
                    level = LevelSyllabus.valueOf(updateData.get("level").toString().toUpperCase());
                } catch (IllegalArgumentException e) {
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Invalid level value");
                    return ResponseEntity.status(400).body(response);
                }
            }

            Long trainingAudience = null;
            if (updateData.containsKey("trainingAudience") && updateData.get("trainingAudience") != null) {
                try {
                    trainingAudience = Long.parseLong(updateData.get("trainingAudience").toString());
                } catch (NumberFormatException e) {
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Invalid training audience value");
                    return ResponseEntity.status(400).body(response);
                }
            }
            Long updatedBy = Long.parseLong(updateData.get("updatedBy").toString());

            String technicalGroup = (String) updateData.get("technicalGroup");

            Map<String, Object> courseObjectiveData = (Map<String, Object>) updateData.get("courseObjective");
            LearningObjectiveDTO objectiveDTO = null;

            if (courseObjectiveData != null) {
                objectiveDTO = new LearningObjectiveDTO();
                objectiveDTO.setCode((String) courseObjectiveData.get("code"));
                objectiveDTO.setName((String) courseObjectiveData.get("name"));
                objectiveDTO.setDescription((String) courseObjectiveData.get("description"));
            }

            SyllabusDTO updatedSyllabus = syllabusService.updateSyllabus(code, topicName, version, level, trainingAudience, technicalGroup, updatedBy, objectiveDTO);

            return ResponseEntity.ok(updatedSyllabus);
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

    @GetMapping("/output/{topicCode}")
    public ResponseEntity<?> findOutput(@PathVariable String topicCode) {
        List<String> outputs = syllabusService.findOutput(topicCode);
        if (outputs.isEmpty()) {
            return ResponseEntity.badRequest().body("No output found.");
        } else {
            return ResponseEntity.ok().body(outputs);
        }
    }

    @PostMapping("/change_status/{topicCode}")
    public ResponseEntity<?> changeSyllabusStatus(@PathVariable String topicCode, @RequestBody Map<String, String> request) {
        String status = request.get("status").toUpperCase();  // Convert to uppercase to handle case insensitivity
        try {
            SyllabusStatus newStatus = SyllabusStatus.valueOf(status);
            syllabusService.changeStatus(topicCode, newStatus);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Syllabus status changed successfully.");
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

    @DeleteMapping("/delete/{topicCode}")
    public ResponseEntity<?> deleteSyllabus(@PathVariable String topicCode) {
        try {
            syllabusService.deleteByTopicCode(topicCode);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Syllabus deleted successfully.");
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

    @PostMapping("/create_duplicate/{topicCode}")
    public ResponseEntity<?> createDuplicateSyllabus(@PathVariable String topicCode) {
        try {
            SyllabusDTO duplicatedSyllabus = syllabusService.createDuplicateSyllabus(topicCode);
            return ResponseEntity.ok().body(duplicatedSyllabus);
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

    @GetMapping("/outlines")
    public ResponseEntity<?> getOutlinesById(@RequestParam("code") String code) {
        List<Map<String, Object>> results = syllabusService.getOutlinesById(code);
        if (!results.isEmpty()) {
            return ResponseEntity.ok().body(results);
        } else {
            return ResponseEntity.badRequest().body("Outlines is null");
        }
    }
}
