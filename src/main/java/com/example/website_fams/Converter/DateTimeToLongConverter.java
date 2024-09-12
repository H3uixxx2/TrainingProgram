package com.example.website_fams.Converter;

import org.modelmapper.Converter;
import org.modelmapper.spi.MappingContext;

import java.time.LocalDateTime;
import java.time.ZoneId;

public class DateTimeToLongConverter implements Converter<LocalDateTime, Long> {
    @Override
    public Long convert(MappingContext<LocalDateTime, Long> context) {
        LocalDateTime source = context.getSource();
        if (source != null) {
            return source.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
        }
        return null;
    }
}
