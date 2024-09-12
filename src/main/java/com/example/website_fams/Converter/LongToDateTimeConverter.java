package com.example.website_fams.Converter;

import org.modelmapper.Converter;
import org.modelmapper.spi.MappingContext;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class LongToDateTimeConverter implements Converter<Long, LocalDateTime> {

    @Override
    public LocalDateTime convert(MappingContext<Long, LocalDateTime> context) {
        Long source = context.getSource();
        if (source == null) {
            return null;
        }
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(source), ZoneId.systemDefault());
    }
}
