import createToast from "../common/toast_message.js";
import * as Dialog from "../common/dialog.js";
let currentUser = 1
$(document).ready(function() {
    setupTabButtons();
    setupSlider();
    const urlParams = new URLSearchParams(window.location.search);
    const syllabus_code = urlParams.get('code');
    if (syllabus_code) {
        $.ajax({
            url: `/api/syllabus/detail?code=${syllabus_code}`,
            method: 'GET',
            success: function(data) {
                populateSyllabusData(data);
                initializeQuillEditor();
            },
            error: function (error) {
                console.error('Error fetching training program details:', error);
            }
        });
    }

    $('#save-btn').on('click', function(event) {
        event.preventDefault();
        buttonSaveClick();
    });
    $('#btn-cancel').on('click', function(event) {
        event.preventDefault();
        buttonCancelClick(syllabus_code);
    });

});

function setupTabButtons() {
    var tabButtons = $('.tab-button');

    tabButtons.each(function() {
        $(this).on('click', function() {
            var target = $(this).data('target');

            tabButtons.removeClass('active');
            $('.tab-pane').removeClass('active');

            $(this).addClass('active');
            $('#' + target).addClass('active');
        });
    });
}

function setupSlider() {
    const slider = $('#mySlider');

    const updateSliderFill = () => {
        const value = (slider.val() - slider.attr('min')) / (slider.attr('max') - slider.attr('min')) * 100;
        slider.css('background', `linear-gradient(to right, #2D3748 ${value}%, #ddd ${value}%)`);
    };

    updateSliderFill();
    slider.on('input', updateSliderFill);
}

function populateSyllabusData(data) {
    // Set Syllabus Name
    $('input.input-text').eq(0).val(data.topicName);

    // Set Syllabus Code
    $('span.normal-text').eq(0).text(data.topicCode);

    // Set Version
    $('input.input-text').eq(1).val(data.version);

    // Set Level
    if (data.level) {
        $('#level').val(data.level);
    }

    // Set Attendee Number
    $('#attendee-number').val(data.trainingAudience);

    // Set Technical Requirements
    $('#technical-requirements').val(data.technicalGroup);

    $('#course-objective-code').text(data.courseObjective.code);

    // Set Course Objectives Name
    $('#course-objective-name').text(data.courseObjective.name);

    // Populate description in #editor-container
    $('#editor-container').html(data.courseObjective.description);

}

function collectSyllabusData() {
    const data = {
        updatedBy: currentUser,
        topicName: $('input.input-text').eq(0).val(),
        topicCode: $('span.normal-text').eq(0).text(),
        version: $('input.input-text').eq(1).val(),
        level: $('#level').val(),
        trainingAudience: $('#attendee-number').val(),
        technicalGroup: $('#technical-requirements').val(),
        courseObjective: {}
    };

    const $objectiveCode = $('#course-objective-code').text().trim();
    const $objectiveName = $('#course-objective-name').text().trim();
    const $objectiveDescription = $('#editor-container').text().trim();

    if ($objectiveCode || $objectiveName || $objectiveDescription) {
        data.courseObjective = {
            code: $objectiveCode,
            name: $objectiveName,
            description: $objectiveDescription
        };
    }

    return data;
}


function sendSyllabusData(data) {
    if (!data.topicName) {
        createToast(false, "ERROR", "Topic Name is required!");
        return;
    }

    if (!data.version) {
        createToast(false, "ERROR", "Version is required!");
        return;
    }

    if (!data.level) {
        createToast(false, "ERROR", "Level is required!");
        return;
    }

    if (!data.trainingAudience) {
        createToast(false, "ERROR", "Training Audience is required!");
        return;
    }

    if (!data.technicalGroup) {
        createToast(false, "ERROR", "Technical Group is required!");
        return;
    }
    $.ajax({
        url: `/api/syllabus/edit?code=${data.topicCode}`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            localStorage.setItem('showToast', 'true');
            localStorage.setItem('message', 'Content updated');
            window.location.href = `/syllabus/detail?code=${data.topicCode}`;
        },
        error: function(error) {
            localStorage.setItem('showToast', 'false');
            localStorage.setItem('message', 'Content not updated');
        }
    });
}

function buttonSaveClick() {
    let message = "Do you want to save this?"
    Dialog.createPopup(message).then((result) => {
        if (result === true) {
            const updatedData = collectSyllabusData();
            sendSyllabusData(updatedData);
        }
    });
}

function buttonCancelClick(syllabus_code) {
    let message = "Do you want to cancel edit Syllabus ?"
    Dialog.createPopup(message).then((result) => {
        if (result === true) {
            window.location.href = `/syllabus/detail?code=${syllabus_code}`;
        }
    });
}
function initializeQuillEditor() {
    var quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                ['link', 'image'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    });
}
