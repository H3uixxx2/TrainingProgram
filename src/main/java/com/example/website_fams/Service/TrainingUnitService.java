package com.example.website_fams.Service;

import com.example.website_fams.DTO.TrainingContentDTO;
import com.example.website_fams.DTO.TrainingUnitDTO;
import com.example.website_fams.Entity.Syllabus;
import com.example.website_fams.Entity.TrainingContent;
import com.example.website_fams.Entity.TrainingUnit;
import com.example.website_fams.Repository.SyllabusRepository;
import com.example.website_fams.Repository.TrainingUnitRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TrainingUnitService{
    @Autowired
    TrainingUnitRepository trainingUnitRepository;

    @Autowired
    SyllabusRepository syllabusRepository;

    @Autowired
    ModelMapper modelMapper;

    public List<TrainingUnitDTO> findAll() {
        List<TrainingUnit> trainingUnits = trainingUnitRepository.findAll();
        List<TrainingUnitDTO> trainingUnitDTOS = new ArrayList<>();
        for (TrainingUnit item: trainingUnits) {
            TrainingUnitDTO dto = modelMapper.map(item, TrainingUnitDTO.class);
            trainingUnitDTOS.add(dto);
        }
        return trainingUnitDTOS;
    }

    public TrainingUnitDTO createNewTrainingUnit(String unitName, int dayNumber, String topicCode) {
        TrainingUnitDTO dto = new TrainingUnitDTO();
        dto.setUnitName(unitName);
        dto.setDayNumber(dayNumber);

        TrainingUnit entity = modelMapper.map(dto, TrainingUnit.class);

        Optional<Syllabus> syllabus = syllabusRepository.findById(topicCode);
        if (syllabus.isPresent()) {
            entity.setSyllabus(syllabus.get());
        }

        TrainingUnit saved = trainingUnitRepository.save(entity);
        return modelMapper.map(saved, TrainingUnitDTO.class);
    }

}
