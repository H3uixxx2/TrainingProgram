package com.example.website_fams.Service;

import com.example.website_fams.DTO.LearningObjectiveDTO;
import com.example.website_fams.DTO.SyllabusDTO;
import com.example.website_fams.Entity.LearningObjective;
import com.example.website_fams.Entity.Syllabus;
import com.example.website_fams.Repository.LearningObjectiveRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LearningObjectiveService implements CRUDService<LearningObjectiveDTO, String> {

    @Autowired
    private LearningObjectiveRepository learningObjectiveRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Override
    public LearningObjectiveDTO addNew(LearningObjectiveDTO newItems) {
        if (newItems != null) {
            String prefix = String.valueOf(newItems.getType());
            int sequence = generateNextSequence(prefix);
            newItems.setCode(generateCode(prefix, sequence));
            LearningObjective learningObjective = modelMapper.map(newItems, LearningObjective.class);
            LearningObjective saved = learningObjectiveRepository.save(learningObjective);
            return modelMapper.map(saved, LearningObjectiveDTO.class);
        }
        return null;
    }

    @Override
    public List<LearningObjectiveDTO> viewAllItems() {
        return null;
    }

    @Override
    public LearningObjectiveDTO findByID(String s) {
        return null;
    }

    @Override
    public void deleteById(String s) {

    }

    public int generateNextSequence(String prefix) {
        String maxCode = learningObjectiveRepository.findMaxCodeByPrefix(prefix);
        if (maxCode != null) {
            String sequencePart = maxCode.substring(prefix.length());
            try {
                sequencePart = sequencePart.replace("SD", "");
                int maxSequence = Integer.parseInt(sequencePart);
                return maxSequence + 1;
            } catch (NumberFormatException e) {
                System.err.println("Error parsing sequence part: " + e.getMessage());
                return 1;
            }
        }
        return 1;
    }

    public String generateCode(String prefix, int sequence) {
        return prefix + String.format("%02d", sequence)+"SD";
    }
}
