package com.example.website_fams.Converter;

import org.modelmapper.Converter;
import org.modelmapper.spi.MappingContext;

import java.sql.Time;

public class TimeToLongConverter implements Converter<Time, Long> {

    @Override
    public Long convert(MappingContext<Time, Long> context) {
        Time time = context.getSource();
        return time != null ? time.getTime() : null;
    }
}
