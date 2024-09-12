package com.example.website_fams.Service;

import com.example.website_fams.DTO.AccountDTO;
import com.example.website_fams.Entity.Account;
import com.example.website_fams.Repository.AccountRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountService implements CRUDService<AccountDTO, Long> {

    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private AccountRepository accountRepository;
    @Override
    public AccountDTO addNew(AccountDTO accountDTO) {
        return null;
    }

    @Override
    public List<AccountDTO> viewAllItems() {
        return null;
    }

    @Override
    public AccountDTO findByID(Long id) {
        Optional<Account> account = accountRepository.findById(id);
        if (account.isPresent()) {
            return modelMapper.map(account.get(), AccountDTO.class);
        }
        return null;
    }

    @Override
    public void deleteById(Long aLong) {

    }
}
