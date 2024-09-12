package com.example.website_fams.Service;

import com.example.website_fams.DTO.TrainingProgramDTO;

import java.util.List;
import java.util.Optional;

public interface CRUDService<DTO, ID> {
    DTO addNew(DTO newItems);
    List<DTO> viewAllItems(); // Generic DTO type
    DTO findByID(ID id);
    void deleteById(ID id);
}

