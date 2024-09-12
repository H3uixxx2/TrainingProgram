package com.example.website_fams;

import com.example.website_fams.Converter.DateTimeToLongConverter;
import com.example.website_fams.Converter.LongToDateTimeConverter;
import com.example.website_fams.Converter.LongToTimeConverter;
import com.example.website_fams.Converter.TimeToLongConverter;
import com.example.website_fams.Entity.TrainingUnit;
import org.hibernate.collection.spi.PersistentBag;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.spi.MappingContext;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class WebsiteFamsApplication {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(new DateTimeToLongConverter());
        modelMapper.addConverter(new LongToDateTimeConverter());
        modelMapper.addConverter(new TimeToLongConverter());
        modelMapper.addConverter(new LongToTimeConverter());
        modelMapper.addConverter(new Converter<PersistentBag, List<TrainingUnit>>() {
            @Override
            public List<TrainingUnit> convert(MappingContext<PersistentBag, List<TrainingUnit>> context) {
                return new ArrayList<>(context.getSource());
            }
        });


        return  modelMapper;
    }
    public static void main(String[] args) {
        SpringApplication.run(WebsiteFamsApplication.class, args);
    }
}
