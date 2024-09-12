package com.example.website_fams.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/")
public class ApplicationController {

    @GetMapping("/training_program/view")
    public String viewTrainingProgram() {
        return "training_program/view_training_program";
    }

    @GetMapping("/training_program/add")
    public String addTrainingProgram() {
        return "training_program/edit_training_program";
    }

    @GetMapping("/training_program/detail")
    public String viewTrainingProgramDetail(@RequestParam("id") Long programId) {
        return "training_program/detail_training_program";
    }

    @GetMapping("/training_program/edit")
    public String editTrainingProgram(@RequestParam("id") Long id) {
        return "training_program/detail_training_program";
    }

    @GetMapping("/syllabus/view")
    public String viewSyllabus() {
        return "syllabus/view_syllabus";
    }

    @GetMapping("/syllabus/add")
    public String addSyllabus() {
        return "syllabus/edit_syllabus";

    }

    @GetMapping("/syllabus/detail")
    public String detailSyllabus() {
        return "syllabus/detail_syllabus";
    }

    @GetMapping("/syllabus/edit")
    public String editSyllabus() {
        return "syllabus/create_syllabus";

    }

    @GetMapping("/class/view")
    public String viewClass() {
        return "class/view_class";
    }

    @GetMapping("/class/add")
    public String addClass() {
        return "class/add_class";
    }

    @GetMapping("/class/detail")
    public String detailClass() {
        return "class/detail_class";
    }
    @GetMapping("/class/edit")
    public String editClass() {
        return "class/edit_class";
    }
}
