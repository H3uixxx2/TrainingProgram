package com.example.website_fams.RestController;

import com.example.website_fams.DTO.TrainingContentDTO;
import com.example.website_fams.Entity.TrainingContent;
import com.example.website_fams.Enum.DeliveryType;
import com.example.website_fams.Service.TrainingContentService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/training_content")
public class TrainingContentController {

    @Autowired
    TrainingContentService trainingContentService;

    @PostMapping("/update")
    public ResponseEntity<?> addNewTrainingContent(@RequestBody JsonNode jsonData) {
        Long unitCode = (jsonData.get("unitCode") != null) ? jsonData.get("unitCode").asLong() : null;
        Long id = (jsonData.has("id")) ? jsonData.get("id").asLong() : null;

        TrainingContentDTO trainingContentDTO = trainingContentService.updateTrainingContent(id, unitCode);

        if (trainingContentService != null) {
            return ResponseEntity.ok().body(trainingContentDTO);
        }
        return ResponseEntity.badRequest().body("Cannot create new training content");
    }

    @GetMapping("/unit-empty")
    public ResponseEntity<?> findContent() {
        List<TrainingContentDTO> trainingContentDTOS = trainingContentService.findContentHasUnitEmpty();
        List<Map<String, Object>> res = new ArrayList<>();
        for (TrainingContentDTO trainingContentDTO: trainingContentDTOS) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", trainingContentDTO.getId());
            map.put("content", trainingContentDTO.getContent());
            map.put("duration", trainingContentDTO.getDuration());
            map.put("status", trainingContentDTO.getTrainingFormat());
            map.put("objectives", trainingContentDTO.getLearningObjectives());
            res.add(map);
        }
        if (!res.isEmpty()) {
            return ResponseEntity.ok().body(res);
        }
        return ResponseEntity.badRequest().body("No data found");
    }
}
