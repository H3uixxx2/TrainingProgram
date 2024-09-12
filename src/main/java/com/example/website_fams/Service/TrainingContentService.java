package com.example.website_fams.Service;

import com.example.website_fams.DTO.LearningObjectiveDTO;
import com.example.website_fams.DTO.TrainingContentDTO;
import com.example.website_fams.Entity.LearningObjective;
import com.example.website_fams.Entity.Syllabus;
import com.example.website_fams.Entity.TrainingContent;
import com.example.website_fams.Entity.TrainingUnit;
import com.example.website_fams.Enum.DeliveryType;
import com.example.website_fams.Repository.SyllabusRepository;
import com.example.website_fams.Repository.TrainingContentRepository;
import com.example.website_fams.Repository.TrainingUnitRepository;
import com.example.website_fams.RestController.TrainingContentController;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TrainingContentService implements CRUDService<TrainingContentDTO, Long> {

    @Autowired
    private TrainingContentRepository trainingContentRepository;

    @Autowired
    private TrainingUnitRepository trainingUnitRepository;

    @Autowired
    private ModelMapper modelMapper;


    @Override
    public TrainingContentDTO addNew(TrainingContentDTO newItems) {
        if (newItems != null) {
            TrainingContent newTrainingContent = modelMapper.map(newItems, TrainingContent.class);
            TrainingContent saved = trainingContentRepository.save(newTrainingContent);
            return modelMapper.map(saved, TrainingContentDTO.class);
        }
        return null;
    }

    @Override
    public List<TrainingContentDTO> viewAllItems() {
        return null;
    }

    @Override
    public TrainingContentDTO findByID(Long aLong) {
        return null;
    }

    @Override
    public void deleteById(Long aLong) {

    }

    public List<TrainingContentDTO> findContentHasUnitEmpty() {
        List<TrainingContent> trainingContents = trainingContentRepository.findAll();
        List<TrainingContentDTO> trainingContentDTOS = new ArrayList<>();
        for (TrainingContent trainingContent: trainingContents) {
            if (trainingContent.getTrainingUnit() == null) {
                trainingContentDTOS.add(modelMapper.map(trainingContent, TrainingContentDTO.class));
            }
        }
        return trainingContentDTOS;
    }

    public TrainingContentDTO updateTrainingContent(Long id, Long unitCode) {
        Optional<TrainingContent> trainingContent = trainingContentRepository.findById(id);
        if (trainingContent.isPresent()) {
            Optional<TrainingUnit> trainingUnit = trainingUnitRepository.findById(unitCode);
            if (trainingUnit.isPresent()) {
                trainingContent.get().setTrainingUnit(trainingUnit.get());
                TrainingContent saved = trainingContentRepository.save(trainingContent.get());
                return modelMapper.map(saved, TrainingContentDTO.class);
            }
        }
        return null;
    }
}
