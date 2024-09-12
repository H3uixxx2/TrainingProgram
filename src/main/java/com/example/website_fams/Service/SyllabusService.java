package com.example.website_fams.Service;

import com.example.website_fams.DTO.*;
import com.example.website_fams.Entity.*;
import com.example.website_fams.Enum.LevelSyllabus;
import com.example.website_fams.Enum.SyllabusStatus;
import com.example.website_fams.Repository.AccountRepository;
import com.example.website_fams.Repository.LearningObjectiveRepository;
import com.example.website_fams.Repository.SyllabusRepository;
import jakarta.persistence.EntityNotFoundException;
import com.example.website_fams.Repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SyllabusService implements CRUDService<SyllabusDTO, String> {

    @Autowired
    private SyllabusRepository syllabusRepository;

    @Autowired
    private LearningObjectiveRepository learningObjectiveRepository;

    @Autowired
    private TrainingSyllabusRepository trainingSyllabusRepository;

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private LearningObjectiveService learningObjectiveService;

    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private TrainingUnitRepository trainingUnitRepository;

    @Override
    public SyllabusDTO addNew(SyllabusDTO newSyllabusDTO) {
        if (newSyllabusDTO != null) {
            Syllabus syllabus = modelMapper.map(newSyllabusDTO, Syllabus.class);
            Syllabus savedSyllabus = syllabusRepository.save(syllabus);
            return modelMapper.map(savedSyllabus, SyllabusDTO.class);
        }
        return null;
    }

    public List<SyllabusDTO> viewAllItems() {
        List<Syllabus> syllabi = syllabusRepository.findAllByCreatedDateDesc();
        return syllabi.stream()
                .map(syllabus -> {
                    return modelMapper.map(syllabus, SyllabusDTO.class);
                })
                .collect(Collectors.toList());
    }

    @Override
    public SyllabusDTO findByID(String s) {
        return modelMapper.map(syllabusRepository.findById(s), SyllabusDTO.class);
    }

    @Override
    public void deleteById(String s) {

    }

    public List<String> findOutput(String topicCode) {
        List<String> learningObjectives = syllabusRepository.findDistinctLearningObjectivesBySyllabusTopicCode(topicCode);
        if (learningObjectives.isEmpty()) {
            Optional<Syllabus> syllabusEntity = syllabusRepository.findById(topicCode);
            if (syllabusEntity.isPresent()) {
                Syllabus syllabus = syllabusEntity.get();
                learningObjectives.add(syllabus.getCourseObjective().getCode());
            }
        }

        return learningObjectives;
    }

    private int generateNextSequence(String prefix) {
        String maxCode = syllabusRepository.findMaxTopicCodeByPrefix(prefix);
        if (maxCode != null) {
            String sequencePart = maxCode.substring(prefix.length());
            try {
                int maxSequence = Integer.parseInt(sequencePart);
                return maxSequence + 1;
            } catch (NumberFormatException e) {
                return 1;
            }
        }
        return 1;
    }

    private String generateCode(String prefix, int sequence) {
        return prefix + String.format("%02d", sequence);
    }


    public SyllabusDTO userCreateSyllabus(Long createdBy, String topicName, SyllabusStatus status, String technicalGroup, String version, LevelSyllabus level, Long trainingAudience,
                                          Long createdDate, LearningObjectiveDTO courseObjective, Long duration) {
        SyllabusDTO syllabusDTO = new SyllabusDTO();
        Optional<Account> currentUser = accountRepository.findById(createdBy);
        if (currentUser.isPresent()) {
            syllabusDTO.setCreatedBy(currentUser.get());
        }
        LearningObjectiveDTO newObjective = addObjectives(courseObjective);
        String prefixString = String.valueOf(newObjective.getType());
        int sequence = generateNextSequence(prefixString);
        String topicCode = generateCode(prefixString, sequence);

        syllabusDTO.setTopicCode(topicCode);
        syllabusDTO.setStatus(status);
        syllabusDTO.setTopicName(topicName);
        syllabusDTO.setTechnicalGroup(technicalGroup);
        syllabusDTO.setVersion(version);
        syllabusDTO.setLevel(level);
        syllabusDTO.setTrainingAudience(trainingAudience);
        syllabusDTO.setCreatedDate(createdDate);
        syllabusDTO.setCourseObjective(newObjective);
        syllabusDTO.setDuration(duration);

        return addNew(syllabusDTO);
    }
    public List<SyllabusDTO> sortSyllabus(String sortField, String sortDirection) {

        List<Syllabus> syllabusEntity = new ArrayList<>();
        if ("topicCode".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                syllabusEntity = syllabusRepository.findAllByTopicCodeAsc();
            } else
                syllabusEntity = syllabusRepository.findAllByTopicCodeDesc();
        }
        if ("topicName".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                syllabusEntity = syllabusRepository.findAllByTopicNameAsc();
            } else
                syllabusEntity = syllabusRepository.findAllByTopicNameDesc();
        }

        if ("duration".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                syllabusEntity = syllabusRepository.findAllByDurationAsc();
            } else
                syllabusEntity = syllabusRepository.findAllByDurationDesc();
        }

        if ("createdDate".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                syllabusEntity = syllabusRepository.findAllByCreatedDateAsc();
            } else
                syllabusEntity = syllabusRepository.findAllByCreatedDateDesc();
        }

        if("createdBy".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                syllabusEntity = syllabusRepository.findAllByCreatedByAsc();
            } else
                syllabusEntity = syllabusRepository.findAllByCreatedByDesc();
        }

        List<SyllabusDTO> result = new ArrayList<>();
        for (Syllabus syllabus : syllabusEntity){
            SyllabusDTO syllabusDTO = modelMapper.map(syllabus, SyllabusDTO.class);
            result.add(syllabusDTO);
        }
        return result;
    }

    public LearningObjectiveDTO addObjectives(LearningObjectiveDTO learningObjectiveDTO) {
        LearningObjective learningObjective = modelMapper.map(learningObjectiveDTO, LearningObjective.class);

        LearningObjective savedLearningObjective = learningObjectiveRepository.save(learningObjective);
        return modelMapper.map(savedLearningObjective, LearningObjectiveDTO.class);
    }


    public List<SyllabusDTO> searchSyllabusByQuery(List<String> inputs) {
        List<SyllabusDTO> result = new ArrayList<>();
        List<Syllabus> syllabuses = new ArrayList<>();
        int index = 0;

        for (String input : inputs) {
            List<Syllabus> searchResult = syllabusRepository.searchSyllabuses(input, input, input);
            if (index == 0) {
                syllabuses = searchResult;
            } else {
                syllabuses.retainAll(searchResult);
            }
            index++;
        }
        for (Syllabus syllabus : syllabuses) {
            SyllabusDTO syllabusDTO = modelMapper.map(syllabus, SyllabusDTO.class);
            result.add(syllabusDTO);
        }
        return result;
    }

    public List<SyllabusDTO> searchSyllabusByDateRange(Long startDate, Long endDate) {
        Date start = new Date(startDate);
        Date end = new Date(endDate);

        List<Syllabus> syllabuses = syllabusRepository.searchSyllabusesByDateRange(start, end);
        List<SyllabusDTO> result = new ArrayList<>();
        for (Syllabus syllabus : syllabuses) {
            SyllabusDTO syllabusDTO = modelMapper.map(syllabus, SyllabusDTO.class);
            result.add(syllabusDTO);
        }
        return result;
    }

    public List<SyllabusDTO> searchSyllabus(List<String> inputs, Long startDate, Long endDate) {
        List<SyllabusDTO> searchByQuery = searchSyllabusByQuery(inputs);
        List<SyllabusDTO> searchByCreatedDate = searchSyllabusByDateRange(startDate, endDate);

        Set<String> dateRangeCodes = searchByCreatedDate.stream()
                .map(SyllabusDTO::getTopicCode)
                .collect(Collectors.toSet());

        List<SyllabusDTO> intersectionList = searchByQuery.stream()
                .filter(syllabus -> dateRangeCodes.contains(syllabus.getTopicCode()))
                .collect(Collectors.toList());

        return intersectionList;
    }

    public SyllabusDTO updateSyllabus(String code, String topicName, String version, LevelSyllabus level, Long trainingAudience, String technicalGroup, Long updatedBy, LearningObjectiveDTO learningObjectiveDTOS) {
        Optional<Syllabus> syllabusOptional = syllabusRepository.findById(code);

        if (syllabusOptional.isPresent()) {
            Syllabus syllabus = syllabusOptional.get();

            if (topicName != null && !topicName.isEmpty()) {
                syllabus.setTopicName(topicName);
            } else {
                throw new IllegalArgumentException("Topic Name cannot be null or empty");
            }

            if (version != null && !version.isEmpty()) {
                syllabus.setVersion(version);
            } else {
                throw new IllegalArgumentException("Version cannot be null or empty");
            }

            if (level != null) {
                syllabus.setLevel(level);
            }

            if (trainingAudience != null) {
                syllabus.setTrainingAudience(trainingAudience);
            }

            if (technicalGroup != null && !technicalGroup.isEmpty()) {
                syllabus.setTechnicalGroup(technicalGroup);
            }

            // Cập nhật thời gian cập nhật
            LocalDateTime updatedDate = LocalDateTime.ofInstant(new Date().toInstant(), ZoneId.systemDefault());
            syllabus.setUpdatedDate(updatedDate);
            Optional<Account> accountOptional = accountRepository.findById(updatedBy);
            if (accountOptional.isPresent()) {
                Account account = accountOptional.get();
                syllabus.setUpdatedBy(account);
            } else {
                throw new EntityNotFoundException("Account not found with ID: " + updatedBy);
            }

            if (learningObjectiveDTOS != null) {
                Optional<LearningObjective> learningObjective = learningObjectiveRepository.findById(learningObjectiveDTOS.getCode());
                LearningObjective learningObjective1 = learningObjective.get();
                learningObjective1.setDescription(learningObjectiveDTOS.getDescription());
                learningObjectiveRepository.save(learningObjective1);
            }

            Syllabus updatedSyllabus = syllabusRepository.save(syllabus);
            return modelMapper.map(updatedSyllabus, SyllabusDTO.class);
        } else {
            throw new EntityNotFoundException("Syllabus not found");
        }
    }

    public SyllabusDTO createDuplicateSyllabus(String topicCode) {
        Optional<Syllabus> syllabusOptional = syllabusRepository.findById(topicCode);
        if (syllabusOptional.isPresent()) {
            Syllabus originalSyllabus = syllabusOptional.get();

            // Generate a new topic code
            String prefix = String.valueOf(originalSyllabus.getCourseObjective().getType());
            int nextSequence = generateNextSequence(prefix);
            String newTopicCode = generateCode(prefix, nextSequence);

            // Create the duplicated syllabus with the new topic code
            Syllabus duplicatedSyllabus = new Syllabus();
            duplicatedSyllabus.setTopicCode(newTopicCode);
            duplicatedSyllabus.setTopicName(originalSyllabus.getTopicName());
            duplicatedSyllabus.setStatus(SyllabusStatus.DRAFT); // Set as DRAFT for the new copy
            duplicatedSyllabus.setTechnicalGroup(originalSyllabus.getTechnicalGroup());
            duplicatedSyllabus.setVersion(originalSyllabus.getVersion());
            duplicatedSyllabus.setLevel(originalSyllabus.getLevel());
            duplicatedSyllabus.setTrainingAudience(originalSyllabus.getTrainingAudience());
            duplicatedSyllabus.setCreatedBy(originalSyllabus.getCreatedBy());
            duplicatedSyllabus.setCreatedDate(LocalDateTime.now());
            duplicatedSyllabus.setUpdatedBy(originalSyllabus.getUpdatedBy());
            duplicatedSyllabus.setUpdatedDate(LocalDateTime.now());
            duplicatedSyllabus.setDuration(originalSyllabus.getDuration());

            // Copy course objectives (assuming one-to-one relationship)
            duplicatedSyllabus.setCourseObjective(originalSyllabus.getCourseObjective());

            // Duplicate the outlines (TrainingUnit) and link them to the new syllabus
            List<TrainingUnit> originalUnits = trainingUnitRepository.findByTopicCode(originalSyllabus.getTopicCode());
            List<TrainingUnit> duplicatedUnits = new ArrayList<>();
            for (TrainingUnit originalUnit : originalUnits) {
                TrainingUnit duplicatedUnit = new TrainingUnit();
                duplicatedUnit.setUnitName(originalUnit.getUnitName());
                duplicatedUnit.setDayNumber(originalUnit.getDayNumber());
                duplicatedUnit.setSyllabus(duplicatedSyllabus); // Link the new unit to the new syllabus

                // Duplicate the training contents and link them to the new unit
                List<TrainingContent> duplicatedContents = new ArrayList<>();
                for (TrainingContent originalContent : originalUnit.getTrainingContents()) {
                    TrainingContent duplicatedContent = new TrainingContent();
                    duplicatedContent.setContent(originalContent.getContent());
                    duplicatedContent.setDuration(originalContent.getDuration());
                    duplicatedContent.setDeliveryType(originalContent.getDeliveryType());
                    duplicatedContent.setTrainingFormat(originalContent.isTrainingFormat());
                    duplicatedContent.setTrainingUnit(duplicatedUnit); // Link the new content to the new unit

                    // Duplicate the learning objectives and link them to the new content
                    List<LearningObjective> duplicatedObjectives = new ArrayList<>();
                    for (LearningObjective originalObjective : originalContent.getLearningObjectives()) {
                        LearningObjective duplicatedObjective = new LearningObjective();
                        duplicatedObjective.setCode(generateNewLearningObjectiveCode(originalObjective.getCode())); // Pass the original code
                        duplicatedObjective.setName(originalObjective.getName());
                        duplicatedObjective.setDescription(originalObjective.getDescription());
                        duplicatedObjective.setType(originalObjective.getType());
                        duplicatedObjective.setTrainingContent(duplicatedContent); // Link to the duplicated content
                        duplicatedObjectives.add(duplicatedObjective);
                    }
                    duplicatedContent.setLearningObjectives(duplicatedObjectives);
                    duplicatedContents.add(duplicatedContent);
                }
                duplicatedUnit.setTrainingContents(duplicatedContents);
                duplicatedUnits.add(duplicatedUnit);
            }

            // Save the duplicated syllabus first
            Syllabus savedSyllabus = syllabusRepository.save(duplicatedSyllabus);

            // Set the saved syllabus to the duplicated units and save each unit
            for (TrainingUnit unit : duplicatedUnits) {
                unit.setSyllabus(savedSyllabus); // Ensure the relationship is correct
                trainingUnitRepository.save(unit); // Save each TrainingUnit
            }

            // Now set the outlines to the saved syllabus and update it
            savedSyllabus.setOutlines(duplicatedUnits);
            syllabusRepository.save(savedSyllabus);

            // Map the saved syllabus to DTO and return
            return modelMapper.map(savedSyllabus, SyllabusDTO.class);
        } else {
            throw new EntityNotFoundException("Syllabus not found.");
        }
    }

    // Example method to generate a new LearningObjective code
    private String generateNewLearningObjectiveCode(String baseCode) {
        String newCode = baseCode;
        int counter = 1;

        // Loop until a unique code is found
        while (learningObjectiveRepository.existsById(newCode)) {
            newCode = baseCode + counter;
            counter++;
        }

        return newCode;
    }

    @Transactional
    public void deleteByTopicCode(String topicCode) {
        Optional<Syllabus> syllabusOptional = syllabusRepository.findById(topicCode);
        if (syllabusOptional.isPresent()) {
            Syllabus syllabus = syllabusOptional.get();

            // Xóa các TrainingSyllabus liên quan
            trainingSyllabusRepository.deleteAllBySyllabus(syllabus);

            // Xóa Syllabus
            syllabusRepository.deleteById(topicCode);
        } else {
            throw new EntityNotFoundException("Syllabus not found.");
        }
    }

    public SyllabusDTO changeStatus(String topicCode, SyllabusStatus newStatus) {
        Optional<Syllabus> syllabusOptional = syllabusRepository.findById(topicCode);
        if (syllabusOptional.isPresent()) {
            Syllabus syllabus = syllabusOptional.get();  // Lấy đối tượng Syllabus từ Optional
            syllabus.setStatus(newStatus);
            syllabus.setUpdatedDate(LocalDateTime.now()); // Cập nhật updatedDate
            Syllabus updatedSyllabus = syllabusRepository.save(syllabus);
            return modelMapper.map(updatedSyllabus, SyllabusDTO.class);
        } else {
            throw new EntityNotFoundException("Syllabus not found.");
        }
    }

    public List<Map<String, Object>> getOutlinesById(String id) {
        Optional<Syllabus> syllabus = syllabusRepository.findById(id);
        List<Map<String, Object>> results = new ArrayList<>();
        if (syllabus.isPresent()) {
            List<TrainingUnit> trainingUnits = syllabus.get().getOutlines();
            for (TrainingUnit unit: trainingUnits) {
                Map<String, Object> unitMap = new HashMap<>();
                unitMap.put("dayNumber", unit.getDayNumber());
                unitMap.put("unitName", unit.getUnitName());
                List<TrainingContent> trainingContents = unit.getTrainingContents();
                System.out.println(trainingContents.size());
                List<Map<String, Object>> contents = new ArrayList<>();
                List<TrainingContentDTO> trainingContentDTOS = new ArrayList<>();
                for (TrainingContent trainingContent: trainingContents) {
                    TrainingContentDTO trainingContentDTO = modelMapper.map(trainingContent, TrainingContentDTO.class);
                    trainingContentDTOS.add(trainingContentDTO);
                    List<LearningObjective> learningObjectives = trainingContent.getLearningObjectives();
                    List<String> objCode = new ArrayList<>();
                    for (LearningObjective learningObjective: learningObjectives) {
                        objCode.add(learningObjective.getCode());
                    }
                    Map<String, Object> map = new HashMap<>();
                    map.put("item", trainingContentDTO);
                    map.put("objectiveCode", objCode);
                    contents.add(map);
                }
                unitMap.put("contents", contents);
                unitMap.put("duration", calculateDurationOfListContent(trainingContentDTOS));
                results.add(unitMap);
            }
        }
        return results;
    }

    private double calculateDurationOfListContent(List<TrainingContentDTO> trainingContentDTOS) {
        long total = 0;
        for (TrainingContentDTO trainingContentDTO: trainingContentDTOS) {
            total += trainingContentDTO.getDuration();
        }
        double result = total/60.0;
        return Math.floor((result*10)/10);
    }
}