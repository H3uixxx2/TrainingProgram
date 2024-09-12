package com.example.website_fams.Service;

import com.example.website_fams.DTO.SyllabusDTO;
import com.example.website_fams.DTO.TrainingProgramDTO;
import com.example.website_fams.DTO.TrainingSyllabusDTO;
import com.example.website_fams.Entity.Account;
import com.example.website_fams.Entity.Syllabus;
import com.example.website_fams.Entity.TrainingProgram;
import com.example.website_fams.Entity.TrainingSyllabus;
import com.example.website_fams.Enum.DuplicateHandleType;
import com.example.website_fams.Enum.TrainingProgramStatus;
import com.example.website_fams.Repository.AccountRepository;
import com.example.website_fams.Repository.SyllabusRepository;
import com.example.website_fams.Repository.TrainingProgramRepository;
import com.example.website_fams.Repository.TrainingSyllabusRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.time.ZoneId;
import java.util.stream.Collectors;

@Service
public class TrainingProgramService implements CRUDService<TrainingProgramDTO, Long>{
    @Autowired
    private TrainingProgramRepository trainingProgramRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private SyllabusRepository syllabusRepository;
    @Autowired
    private TrainingSyllabusRepository trainingSyllabusRepository;
    @Autowired
    private ModelMapper modelMapper;

    public List<TrainingProgramDTO> searchTrainingPrograms(List<String> inputs) {

        List<TrainingProgramDTO> result = new ArrayList<>();
        List<TrainingProgram> trainingPrograms = new ArrayList<>();
        int index = 0;
        for (String input : inputs) {
            TrainingProgramStatus status = findClosestStatus(input);

            Long id = null;
            Long duration = null;

            try {
                id = Long.parseLong(input);
            } catch (NumberFormatException e) {

            }

            try {
                duration = Long.parseLong(input);
            } catch (NumberFormatException e) {

            }
            SimpleDateFormat dateFormat = new SimpleDateFormat("d/M/yyyy");
            Date createdDate;
            try {
                createdDate = (Date) dateFormat.parse(input);
            } catch (ParseException e) {
                Calendar calendar = Calendar.getInstance();
                calendar.set(1, Calendar.JANUARY, 1, 0, 0, 0);
                calendar.set(Calendar.MILLISECOND, 0);
                createdDate = (Date) calendar.getTime();
            }
            List<TrainingProgram> searchResult = trainingProgramRepository.searchTrainingPrograms(id, duration, createdDate, input, status, input);
            if (index == 0) {
                for (TrainingProgram program : searchResult) {
                    if (!trainingPrograms.contains(program)) {
                        trainingPrograms.add(program);
                    }
                }
            } else {
                trainingPrograms.retainAll(searchResult);
            }
            index++;
        }
        for (TrainingProgram trainingProgram : trainingPrograms){
            TrainingProgramDTO trainingProgramDTO = modelMapper.map(trainingProgram, TrainingProgramDTO.class);
            result.add(trainingProgramDTO);
        }
        return result;
    }

    private TrainingProgramStatus findClosestStatus(String input) {
        String upperInput = input.toUpperCase();

        return Arrays.stream(TrainingProgramStatus.values())
                .filter(status -> status.name().startsWith(upperInput))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<TrainingProgramDTO> viewAllItems() {
        List<TrainingProgramDTO> result = new ArrayList<>();
        for (TrainingProgram trainingProgram : trainingProgramRepository.findAllByCreatedDateDesc()) {
            // Initialize the syllabuses collection
            trainingProgram.getSyllabuses().size();
            TrainingProgramDTO dto = modelMapper.map(trainingProgram, TrainingProgramDTO.class);
            result.add(dto);
        }
        return result;
    }

    public Map<String, Object> findByIDWithSyllabus(Long id) {
        Optional<TrainingProgram> trainingProgram = trainingProgramRepository.findById(id);
        Map<String, Object> result = new HashMap<>();
        if (trainingProgram.isPresent()) {
            List<TrainingSyllabus> trainingSyllabusList = trainingProgram.get().getSyllabuses();
            trainingSyllabusList.size();
            result.put("training", modelMapper.map(trainingProgram, TrainingProgramDTO.class));
            List<Map<String, Object>> syllabusList = new ArrayList<>();
            for (TrainingSyllabus t: trainingSyllabusList) {

                String code = t.getSyllabus().getTopicCode();
                String name = t.getSyllabus().getTopicName();
                String status = String.valueOf(t.getSyllabus().getStatus());
                Long duration = t.getSyllabus().getDuration();
                String version = t.getSyllabus().getVersion();

                LocalDateTime createdDate = t.getSyllabus().getCreatedDate();
                Instant instant = createdDate.atZone(ZoneId.systemDefault()).toInstant();
                Long updatedDate = instant.toEpochMilli();

                String updatedBy = t.getSyllabus().getCreatedBy().getName();

                Map<String, Object> map = new HashMap<>();
                map.put("code", code);
                map.put("name", name);
                map.put("status", status);
                map.put("duration", duration);
                map.put("version", version);
                map.put("updatedDate", updatedDate);
                map.put("updatedBy", updatedBy);
                syllabusList.add(map);
            }
            result.put("syllabuses", syllabusList);
            return result;
        }
        return null;
    }

    @Override
    public TrainingProgramDTO findByID(Long id) {
        Optional<TrainingProgram> trainingProgram = trainingProgramRepository.findById(id);
        if (trainingProgram.isPresent()) {
            TrainingProgramDTO trainingProgramDTO = modelMapper.map(trainingProgram.get(), TrainingProgramDTO.class);

            List<TrainingSyllabusDTO> trainingSyllabusDTOs = trainingProgram.get().getSyllabuses().stream()
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

            return trainingProgramDTO;
        }
        return null;
    }


    @Override
    public void deleteById(Long id) {
        Optional<TrainingProgram> trainingProgram = trainingProgramRepository.findById(id);
        if (trainingProgram.isPresent()) {
            trainingProgramRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("Training program not found.");
        }
    }

    // Thay đổi trạng thái (Status)
    public TrainingProgramDTO changeStatus(Long id, TrainingProgramStatus newStatus) {
        Optional<TrainingProgram> trainingProgram = trainingProgramRepository.findById(id);
        if (trainingProgram.isPresent()) {
            TrainingProgram program = trainingProgram.get();
            program.setStatus(newStatus);
            TrainingProgram updatedProgram = trainingProgramRepository.save(program);
            return modelMapper.map(updatedProgram, TrainingProgramDTO.class);
        } else {
            throw new EntityNotFoundException("Training program not found.");
        }
    }

    // Duplicate dữ liệu
    public TrainingProgramDTO createDuplicateTrainingProgram(Long id) {
        Optional<TrainingProgram> trainingProgramOptional = trainingProgramRepository.findById(id);
        if (trainingProgramOptional.isPresent()) {
            TrainingProgram originalProgram = trainingProgramOptional.get();

            // Duplicate TrainingProgram
            TrainingProgram duplicatedProgram = new TrainingProgram();
            duplicatedProgram.setName(originalProgram.getName());
            duplicatedProgram.setStatus(originalProgram.getStatus());
            duplicatedProgram.setCreatedDate(originalProgram.getCreatedDate());
            duplicatedProgram.setCreatedBy(originalProgram.getCreatedBy());
            duplicatedProgram.setUpdatedDate(originalProgram.getUpdatedDate());
            duplicatedProgram.setUpdatedBy(originalProgram.getUpdatedBy());
            duplicatedProgram.setDuration(originalProgram.getDuration());
            duplicatedProgram.setGeneralInformation(originalProgram.getGeneralInformation());

            TrainingProgram savedProgram = trainingProgramRepository.save(duplicatedProgram);

            // Duplicate associated TrainingSyllabus entries
            List<TrainingSyllabus> duplicatedSyllabuses = new ArrayList<>();
            for (TrainingSyllabus originalSyllabus : originalProgram.getSyllabuses()) {
                TrainingSyllabus duplicatedSyllabus = new TrainingSyllabus();
                duplicatedSyllabus.setId(null); // Set ID to null so it will be auto-generated
                duplicatedSyllabus.setSequence(originalSyllabus.getSequence());
                duplicatedSyllabus.setTrainingProgram(savedProgram); // Associate with the new TrainingProgram
                duplicatedSyllabus.setSyllabus(originalSyllabus.getSyllabus()); // Copy the same Syllabus
                duplicatedSyllabuses.add(duplicatedSyllabus);
            }

            // Save duplicated syllabuses
            trainingSyllabusRepository.saveAll(duplicatedSyllabuses);

            // Update the saved program with the duplicated syllabuses
            savedProgram.setSyllabuses(duplicatedSyllabuses);
            trainingProgramRepository.save(savedProgram);

            return modelMapper.map(savedProgram, TrainingProgramDTO.class);
        } else {
            throw new EntityNotFoundException("Training program not found.");
        }
    }


    @Override
    public TrainingProgramDTO addNew(TrainingProgramDTO newItems) {
        TrainingProgram trainingProgram = modelMapper.map(newItems, TrainingProgram.class);
        System.out.println(trainingProgram.getDuration());
        if (trainingProgram.getDuration() == 0) {
           trainingProgram.setStatus(TrainingProgramStatus.DRAFT);
        } else {
           trainingProgram.setStatus(TrainingProgramStatus.INACTIVE);
        }

       TrainingProgram savedTrainingProgram = trainingProgramRepository.save(trainingProgram);
       return modelMapper.map(savedTrainingProgram, TrainingProgramDTO.class);
    }

    public List<TrainingProgramDTO> sortTrainingPrograms(String sortField, String sortDirection) {

        List<TrainingProgram> trainingProgramEntity = new ArrayList<>();
        if ("id".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                trainingProgramEntity = trainingProgramRepository.findAllByIdAsc();
            } else
                trainingProgramEntity = trainingProgramRepository.findAllByIdDesc();
        }
        if ("name".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                trainingProgramEntity = trainingProgramRepository.findAllByNameAsc();
            } else
                trainingProgramEntity = trainingProgramRepository.findAllByNameDesc();
        }
        if ("duration".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                trainingProgramEntity = trainingProgramRepository.findAllByDurationAsc();
            } else
                trainingProgramEntity = trainingProgramRepository.findAllByDurationDesc();
        }

        if ("createdDate".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                trainingProgramEntity = trainingProgramRepository.findAllByCreatedDateAsc();
            } else
                trainingProgramEntity = trainingProgramRepository.findAllByCreatedDateDesc();
        }

        if ("status".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                trainingProgramEntity = trainingProgramRepository.findAllByStatusAsc();
            } else
                trainingProgramEntity = trainingProgramRepository.findAllByStatusDesc();
        }

        if("createdBy".equalsIgnoreCase(sortField)) {
            if ("asc".equalsIgnoreCase(sortDirection)) {
                trainingProgramEntity = trainingProgramRepository.findAllByCreatedByAsc();
            } else
                trainingProgramEntity = trainingProgramRepository.findAllByCreatedByDesc();

        }

        List<TrainingProgramDTO> result = new ArrayList<>();
        for (TrainingProgram trainingProgram : trainingProgramEntity){
            TrainingProgramDTO trainingProgramDTO = modelMapper.map(trainingProgram, TrainingProgramDTO.class);
            result.add(trainingProgramDTO);
        }
        return result;
    }

     public TrainingProgramDTO userCreateNewTrainingProgram(Long accountId, TrainingProgramDTO trainingProgramDTO) {
        Optional<Account> createdBy = accountRepository.findById(accountId);
        if (createdBy.isPresent()) {
            trainingProgramDTO.setCreatedBy(createdBy.get());
            return addNew(trainingProgramDTO);
        }
        return null;
    }
    public int createTrainingProgramByImportFile(MultipartFile file, Map<String, Boolean> duplicateScanning, DuplicateHandleType handleType, Long createdBy, Long createdDate) throws IOException, InvalidFormatException {
        int success = 0;
        InputStream inputStream = file.getInputStream();
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        XSSFSheet sheet = workbook.getSheetAt(0);
        Iterator<Row> rowIterator = sheet.rowIterator();
        Row firstRow = rowIterator.next();
        List<String> heading = new ArrayList<>();
        for (Cell cell: firstRow) {
            heading.add(cell.getStringCellValue());
        }
        while (rowIterator.hasNext()) {
            Row currentRow = rowIterator.next();
            Map<String, Object> data = new HashMap<>();
            for (int i = 0; i < heading.size(); i++) {
                Cell cell = currentRow.getCell(i);
                Object value = null;
                if (cell != null) {
                    value = addValue(cell);
                }
                data.put(heading.get(i), value);
            }
            boolean checked = addDataFromFile(data, duplicateScanning, handleType, createdBy, createdDate);
            if (checked) {
                success += 1;
            }
            System.out.println(data);
        }
        return success;
    }

    private Object addValue(Cell cell) {
        if (cell != null) {
            if (cell.getCellType() == CellType.STRING) {
                return cell.getStringCellValue();
            } else if (cell.getCellType() == CellType.NUMERIC) {
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                } else {
                    return (long) cell.getNumericCellValue();
                }
            } else if (cell.getCellType() == CellType.BOOLEAN) {
                return String.valueOf(cell.getBooleanCellValue());
            } else if (cell.getCellType() == CellType.FORMULA) {
                return cell.getCellFormula();
            }
        }
        return null;
    }
    private boolean addDataFromFile(Map<String, Object> data, Map<String, Boolean> duplicateScanning, DuplicateHandleType handleType, Long createdBy, Long createdDate) {
        boolean sId = duplicateScanning.get("id");
        boolean sName = duplicateScanning.get("name");
        Long id = (Long) data.get("id");
        String name = (String) data.get("name");

        Date startDate = (Date) data.get("startDate");
        Date endDate = (Date) data.get("endDate");

        Long duration;

        if (startDate==null || endDate==null || !endDate.after(startDate)) {
            duration = null;
        } else {
            Long diffInMillis = endDate.getTime() - startDate.getTime();
            duration = TimeUnit.MILLISECONDS.toDays(diffInMillis);
        }

        TrainingProgramDTO newDTO = new TrainingProgramDTO();
        newDTO.setName(name);
        newDTO.setDuration(duration);
        newDTO.setId(id);
        newDTO.setStatus(TrainingProgramStatus.DRAFT);

        Optional<Account> account = accountRepository.findById(createdBy);
        newDTO.setCreatedBy(account.get());
        newDTO.setCreatedDate(createdDate);

        if (sId == true) {
            TrainingProgramDTO oldDTO = new TrainingProgramDTO();
            if (sName == false) {
                oldDTO = findByID(newDTO.getId());
            } else {
                oldDTO = findAllByIdAndName(newDTO.getId(), newDTO.getName());
            }
            TrainingProgramDTO savedDTO = handleDuplicate(handleType, oldDTO, newDTO);
            if (savedDTO != null) {
                return true;
            }
        } else {
            List<TrainingProgramDTO> trainingProgramDTOList = findTrainingProgramByName(newDTO.getName());
            if (trainingProgramDTOList != null && handleType == DuplicateHandleType.REPLACE) {
                for (TrainingProgramDTO dto: trainingProgramDTOList) {
                    TrainingProgramDTO savedDTO = handleDuplicate(DuplicateHandleType.REPLACE, dto, newDTO);
                }
            } else {
                handleDuplicate(handleType, null, newDTO);
            }
            return true;
        }
        return false;
    }

    public TrainingProgramDTO handleDuplicate(DuplicateHandleType type, TrainingProgramDTO oldDTO, TrainingProgramDTO newDTO) {
        if (type == DuplicateHandleType.ALLOW) {
            newDTO.setId(null);
        } else if (type == DuplicateHandleType.REPLACE) {
            if (oldDTO != null) {
                oldDTO.setId(newDTO.getId());
                oldDTO.setName(newDTO.getName());
                oldDTO.setCreatedBy(newDTO.getCreatedBy());
                oldDTO.setCreatedDate(newDTO.getCreatedDate());
                oldDTO.setDuration(newDTO.getDuration());
                oldDTO.setStatus(newDTO.getStatus());
                TrainingProgram trainingProgram = modelMapper.map(oldDTO, TrainingProgram.class);
                TrainingProgram savedTrainingProgram = trainingProgramRepository.save(trainingProgram);
                return modelMapper.map(savedTrainingProgram, TrainingProgramDTO.class);
            }
        } else {
            if (oldDTO != null) {
                return null;
            }
        }
        return addNew(newDTO);
    }


    public List<TrainingProgramDTO> findTrainingProgramByName(String name) {
        List<TrainingProgram> trainingPrograms = trainingProgramRepository.findAllByNameAsc();
        List<TrainingProgramDTO> trainingProgramDTOList = new ArrayList<>();
        for (TrainingProgram trainingProgram: trainingPrograms) {
            trainingProgramDTOList.add(modelMapper.map(trainingProgram, TrainingProgramDTO.class));
        }
        return trainingProgramDTOList;
    }

    public TrainingProgramDTO findAllByIdAndName(Long id, String name) {
        Optional<TrainingProgram> trainingProgram = trainingProgramRepository.findAllByIdAndName(id, name);
        if (trainingProgram.isPresent()) {
            return modelMapper.map(trainingProgram.get(), TrainingProgramDTO.class);
        }
        return null;
    }

    public TrainingProgramDTO updateTrainingProgram(Long id, String name, Long duration, TrainingProgramStatus status, List<String> syllabuses) {
        Optional<TrainingProgram> trainingProgramOptional = trainingProgramRepository.findById(id);

        if (trainingProgramOptional.isPresent()) {
            TrainingProgram trainingProgram = trainingProgramOptional.get();

            if (name != null && !name.isEmpty()) {
                trainingProgram.setName(name);
            } else {
                throw new IllegalArgumentException("Name cannot be null or empty");
            }

            trainingProgram.setDuration(duration);

            if (status != null) {
                trainingProgram.setStatus(status);
            }

            LocalDateTime updatedDate = LocalDateTime.ofInstant(new Date().toInstant(), ZoneId.systemDefault());
            trainingProgram.setUpdatedDate(updatedDate);



            TrainingProgram updatedProgram = trainingProgramRepository.save(trainingProgram);
            TrainingProgramDTO trainingProgramDTO = modelMapper.map(updatedProgram, TrainingProgramDTO.class);
            List<TrainingSyllabus> trainingSyllabusList = trainingSyllabusRepository.findAllByTrainingProgramId(id);
            for (TrainingSyllabus trainingSyllabus : trainingSyllabusList){
                trainingSyllabusRepository.delete(trainingSyllabus);
            }
            setSyllabus(trainingProgramDTO, syllabuses);
            return modelMapper.map(updatedProgram, TrainingProgramDTO.class);
        } else {
            throw new EntityNotFoundException("Training program not found");
        }
    }


    public void setSyllabus(TrainingProgramDTO trainingProgramDTO, List<String> syllabusCodes) {
        int sequence = 0;
        for (String code: syllabusCodes) {
            Optional<Syllabus> syllabus = syllabusRepository.findById(code);
            if (syllabus.isPresent()) {
                TrainingSyllabus trainingSyllabus = new TrainingSyllabus();
                TrainingProgram trainingProgram = modelMapper.map(trainingProgramDTO, TrainingProgram.class);
                trainingSyllabus.setTrainingProgram(trainingProgram);
                trainingSyllabus.setSyllabus(syllabus.get());
                trainingSyllabus.setSequence(0);
                sequence++;
                trainingSyllabusRepository.save(trainingSyllabus);
            }
        }
    }
}
