package com.example.website_fams.Service;

import com.example.website_fams.DTO.*;
import com.example.website_fams.Entity.Account;
import com.example.website_fams.Entity.Class;
import com.example.website_fams.Entity.Syllabus;
import com.example.website_fams.Entity.TrainingProgram;
import com.example.website_fams.Enum.ClassStatus;
import com.example.website_fams.Enum.LevelSyllabus;
import com.example.website_fams.Enum.Location;
import com.example.website_fams.Repository.AccountRepository;
import com.example.website_fams.Enum.ClassStatus;
import com.example.website_fams.Repository.ClassRepository;
import com.example.website_fams.Repository.TrainingProgramRepository;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClassService implements CRUDService<ClassDTO, String> {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TrainingProgramRepository trainingProgramRepository;

    @Autowired
    private ModelMapper modelMapper;

    public ClassDTO createNewClass(Long createdBy, String name,
                                   String location, String status, Long startTime,
                                   Long endTime, Long startDate, Long endDate, Long trainingId, String FSU, Long duration) {
        ClassDTO classDTO = new ClassDTO();
        LocalDateTime current = LocalDateTime.now();
        String prefix = location+"_CPL_"+current.getYear()+"_";
                ;
        int sequence = generateNextSequence(prefix);

        String id = generateCode(prefix, sequence);
        classDTO.setClassID(id);


        classDTO.setClassName(name);
        classDTO.setLocation(Location.valueOf(location));
        classDTO.setStatus(ClassStatus.valueOf(status));
        classDTO.setStartTime(startTime);
        classDTO.setEndTime(endTime);
        classDTO.setStartDate(startDate);
        classDTO.setEndDate(endDate);
        classDTO.setCreatedDate(System.currentTimeMillis());
        classDTO.setFSU(FSU);
        classDTO.setDuration(duration);

        Class entity = modelMapper.map(classDTO, Class.class);
        Optional<Account> account = accountRepository.findById(createdBy);
        Optional<TrainingProgram> trainingProgram = trainingProgramRepository.findById(trainingId);
        if (account.isPresent()) {
            entity.setCreatedBy(account.get());
            if (trainingProgram.isPresent()) {
                entity.setTrainingProgram(trainingProgram.get());
                System.out.println(trainingId);
            }
            Class saved = classRepository.save(entity);
            return modelMapper.map(saved, ClassDTO.class);
        }
        return null;
    }

    private int generateNextSequence(String prefix) {
        String maxCode = classRepository.findMaxCodeByPrefix(prefix);
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

    @Override
    public ClassDTO addNew(ClassDTO newItems) {
        return null;
    }

    public List<ClassDTO> viewAllItems() {
        List<Class> classes = classRepository.findAllByCreatedDateDesc();
        return classes.stream()
                .map(classEntity -> modelMapper.map(classEntity, ClassDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {

    }

    public List<ClassDTO> searchClasses(List<String> inputs) {

        List<ClassDTO> result = new ArrayList<>();
        List<Class> classes = new ArrayList<>();
        int index = 0;

        for (String input : inputs) {
            ClassStatus status = findClosestStatus(input);

            List<Class> searchResult = classRepository.searchClasses(input, input, input, status);

            if (index == 0) {
                for (Class clazz : searchResult) {
                    if (!classes.contains(clazz)) {
                        classes.add(clazz);
                    }
                }
            } else {
                classes.retainAll(searchResult);
            }
            index++;
        }

        for (Class clazz : classes) {
            ClassDTO classDTO = modelMapper.map(clazz, ClassDTO.class);
            result.add(classDTO);
        }

        return result;
    }

    private ClassStatus findClosestStatus(String input) {
        String upperInput = input.toUpperCase();

        return Arrays.stream(ClassStatus.values())
                .filter(status -> status.name().startsWith(upperInput))
                .findFirst()
                .orElse(null);
    }

    public List<ClassDTO> searchClassesByFilter(List<String> location, Long fromDate, Long toDate, List<String> status) {
        Date startDate = (fromDate != null) ? new Date(fromDate) : getEarliestDate();
        Date endDate = (toDate != null) ? new Date(toDate) : getLatestDate();
        List<ClassStatus> statuses = new ArrayList<>();
        for (String statuss : status)
        {
            ClassStatus classStatus = findClosestStatus(statuss);
            statuses.add(classStatus);
        }
        List<Class> classes = classRepository.findClasses(location, startDate, endDate, statuses);

        return classes.stream()
                .map(classEntity -> modelMapper.map(classEntity, ClassDTO.class))
                .collect(Collectors.toList());
    }

    public List<ClassDTO> searchClass(List<String> query, List<String> location, Long startDate, Long endDate, List<String> status) {
        List<ClassDTO> first = searchClasses(query);
        List<ClassDTO> second = searchClassesByFilter(location, startDate, endDate, status);
        Set<ClassDTO> setFirst = new HashSet<>(first);
        Set<ClassDTO> setSecond = new HashSet<>(second);
        setFirst.retainAll(setSecond);

        List<ClassDTO> result = new ArrayList<>(setFirst);
        return result;
    }

    private Date getEarliestDate() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(1, Calendar.JANUARY, 1, 0, 0, 0);  // Ngày 1 tháng 1 năm 0001
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    private Date getLatestDate() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(9999, Calendar.DECEMBER, 31, 23, 59, 59);  // Ngày 31 tháng 12 năm 9999
        calendar.set(Calendar.MILLISECOND, 999);  // Đặt mili giây để bao phủ cả ngày
        return calendar.getTime();
    }
    @Override
    public ClassDTO findByID(String id) {
        Optional<Class> classOptional = classRepository.findById(id);

        Class classEntity = classOptional.get();
        ClassDTO classDTO = modelMapper.map(classEntity, ClassDTO.class);

        if (classEntity.getTrainingProgram() != null) {

        TrainingProgramDTO trainingProgramDTO = modelMapper.map(classEntity.getTrainingProgram(), TrainingProgramDTO.class);
        List<TrainingSyllabusDTO> trainingSyllabusDTOs = classEntity.getTrainingProgram().getSyllabuses().stream()
                .map(trainingSyllabus -> {
                    TrainingSyllabusDTO dto = modelMapper.map(trainingSyllabus, TrainingSyllabusDTO.class);
                    if (trainingSyllabus.getSyllabus() != null) {
                        SyllabusDTO syllabusDTO = modelMapper.map(trainingSyllabus.getSyllabus(), SyllabusDTO.class);
                        dto.setSyllabus(syllabusDTO);
                    }
                    return dto;
                })
                .collect(Collectors.toList());

            trainingProgramDTO.setSyllabuses(trainingSyllabusDTOs);

            classDTO.setTrainingProgramDTO(trainingProgramDTO);
        }

        return classDTO;

    }

    public ClassDTO updateClass(String id, String className, Long startTime, Long endTime, Long startDate, String location, String fsu, int updatedBy, String trainingprogramID) {
        Optional<Class> classEntity = classRepository.findById(id);
        if (classEntity.isPresent()) {
            Class classEdit = classEntity.get();

            if (className != null && !className.isEmpty()) {
                classEdit.setClassName(className);
            } else {
                throw new IllegalArgumentException("Class Name cannot be null or empty");
            }

            // Validate and set startTime
            if (startTime != null) {
                classEdit.setStartTime(new Time(startTime));
            } else {
                throw new IllegalArgumentException("Start Time cannot be null");
            }

            // Validate and set endTime
            if (endTime != null) {
                classEdit.setEndTime(new Time(endTime));
            } else {
                throw new IllegalArgumentException("End Time cannot be null");
            }

            // Validate and set startDate
            if (startDate != null) {
                classEdit.setStartDate(LocalDateTime.ofInstant(Instant.ofEpochMilli(startDate), ZoneId.systemDefault()));
            } else {
                throw new IllegalArgumentException("Start Date cannot be null");
            }

            // Validate and set location
            if (location != null && !location.isEmpty()) {
                Location location1 = Location.valueOf(location);
                classEdit.setLocation(location1);
            } else {
                throw new IllegalArgumentException("Location cannot be null or empty");
            }

            // Validate and set fsu
            if (fsu != null && !fsu.isEmpty()) {
                classEdit.setFSU(fsu);
            } else {
                throw new IllegalArgumentException("FSU cannot be null or empty");
            }

            // Validate and set updatedBy
            if (updatedBy != 0) {
                Optional<Account> accountUpdated = accountRepository.findById(Long.valueOf(updatedBy));
                if (accountUpdated.isPresent()) {
                    Account account = accountUpdated.get();
                    classEdit.setUpdatedBy(account);
                }
            } else {
                throw new IllegalArgumentException("Updated By cannot be null");
            }

            LocalDateTime updatedDate = LocalDateTime.ofInstant(new Date().toInstant(), ZoneId.systemDefault());
            classEdit.setUpdatedDate(updatedDate);

            if (trainingprogramID != null) {
                Long trainingProgramId = Long.parseLong(trainingprogramID.trim());
                Optional<TrainingProgram> trainingProgram = trainingProgramRepository.findById((trainingProgramId));
                if (trainingProgram.isPresent()) {
                    TrainingProgram trainingProgram1 = trainingProgram.get();
                    classEdit.setDuration(trainingProgram1.getDuration());
                    LocalDateTime startDate_1 = LocalDateTime.ofInstant(Instant.ofEpochMilli(startDate), ZoneId.systemDefault());
                    LocalDateTime endDate = startDate_1.plusDays(trainingProgram1.getDuration());
                    classEdit.setEndDate(endDate);
                    classEdit.setTrainingProgram(trainingProgram1);
                }
            } else {
                throw new IllegalArgumentException("Updated By cannot be null");
            }

            Class updatedClass = classRepository.save(classEdit);
            return modelMapper.map(updatedClass, ClassDTO.class);
        } else {
            throw new EntityNotFoundException("Class not found");
        }
    }

    public ClassDTO change_status (String id, ClassStatus status) {
        Optional<Class> classEntity = classRepository.findById(id);
        if(classEntity.isPresent()) {
            Class class_1 = classEntity.get();
            class_1.setStatus(status);
            Class updatedClass = classRepository.save(class_1);
            return modelMapper.map(updatedClass, ClassDTO.class);
        }
        else {
            throw new EntityNotFoundException("Class not found");
        }
    }

    public ClassDTO changeStatus(String classID, ClassStatus newStatus) {
        Optional<Class> classOptional = classRepository.findById(classID);
        if (classOptional.isPresent()) {
            Class classEntity = classOptional.get();  // Lấy đối tượng Class từ Optional
            classEntity.setStatus(newStatus);
            classEntity.setUpdatedDate(LocalDateTime.now());  // Cập nhật updatedDate
            Class updatedClass = classRepository.save(classEntity);
            return modelMapper.map(updatedClass, ClassDTO.class);
        } else {
            throw new EntityNotFoundException("Class not found.");
        }
    }

    public void deleteClass(String classID) {
        Optional<Class> classOptional = classRepository.findById(classID);
        if (classOptional.isPresent()) {
            classRepository.deleteById(classID);
        } else {
            throw new EntityNotFoundException("Class not found.");
        }
    }

    public List<ClassDTO> findByTrainingID(Long id) {
        List<Class> classes = classRepository.findByTrainingProgram_TrainingID(id);
        return classes.stream()
                .map(classEntity -> modelMapper.map(classEntity, ClassDTO.class))
                .collect(Collectors.toList());
    }
}
