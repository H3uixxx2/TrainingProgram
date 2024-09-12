package com.example.website_fams.Converter;

import org.modelmapper.Converter;
import org.modelmapper.spi.MappingContext;

import java.sql.Time;

public class LongToTimeConverter implements Converter<Long, Time> {

    @Override
    public Time convert(MappingContext<Long, Time> context) {
        Long milliseconds = context.getSource();
        return milliseconds != null ? new Time(milliseconds) : null;
    }
}
