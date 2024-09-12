package com.example.website_fams.RestController;

import com.example.website_fams.DTO.TrainingUnitDTO;
import com.example.website_fams.Entity.TrainingUnit;
import com.example.website_fams.Service.TrainingUnitService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training_unit")
public class TrainingUnitController {

    @Autowired
    TrainingUnitService trainingUnitService;

    @PostMapping("/add")
    public ResponseEntity<?> addNewTrainingUnit(@RequestBody JsonNode jsonData) {
        String topicCode = (jsonData.get("topicCode") != null) ? jsonData.get("topicCode").asText() : null;
        Integer dayNumber = (jsonData.get("dayNumber") != null) ? jsonData.get("dayNumber").asInt() : null;
        String unitName = (jsonData.get("unitName") != null) ? jsonData.get("unitName").asText() : null;
        System.out.println("topicCode: " + topicCode);
        System.out.println("dayNumber: " + dayNumber);
        System.out.println("unitName: " + unitName);
        if (topicCode == null || dayNumber == null || unitName == null) {
            return ResponseEntity.badRequest().body("Some field of data is empty!");
        }
        TrainingUnitDTO saved = trainingUnitService.createNewTrainingUnit(unitName, dayNumber, topicCode);
        if (saved != null) {
            return ResponseEntity.ok().body(saved);
        }
        return ResponseEntity.badRequest().body("Cannot create new Training Content!");
    }

    @GetMapping("/all")
    public ResponseEntity<?> findAll() {
        List<TrainingUnitDTO> trainingUnitDTOS = trainingUnitService.findAll();
        if (trainingUnitDTOS.isEmpty()) {
            return ResponseEntity.badRequest().body("Not found");
        }
        return ResponseEntity.ok().body(trainingUnitDTOS);
    }
}
