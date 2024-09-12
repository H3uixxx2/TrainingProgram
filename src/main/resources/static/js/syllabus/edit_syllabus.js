import * as Dialog from "../common/dialog.js"
import createToast from "../common/toast_message.js";
let currentUser = 1
let sequence = 1;
let unitSequence = 1;
let fetchContent = null;
$(document).ready(function() {
    $("#add-syllabus").addClass("active");
    let current_link = $("#add-syllabus a");
    let current_link_name = current_link.text();
    current_link.text("");
    current_link.append(`<b>${current_link_name}</b>`);

    $("#btn-next").on("click", function (){
        changeTab();
    });
    $("#btn-save-as-draft").on("click", btnSaveAsDraftClick);
    setUpTextArea();
    setupSlider();
    $("#btn-add-day").on('click', btnAddDayClick);
    getTrainingContent();

    $("#btn-cancel").on("click", function () {
        Dialog.createPopup("Do you want to cancel?").then((result) => {
            if (result) {
                window.location.reload();
            }
        })
    })
});

function setupSlider() {
    const slider = $('#mySlider');

    const updateSliderFill = () => {
        const value = (slider.val() - slider.attr('min')) / (slider.attr('max') - slider.attr('min')) * 100;
        slider.css('background', `linear-gradient(to right, #2D3748 ${value}%, #ddd ${value}%)`);
    };

    updateSliderFill();
    slider.on('input', updateSliderFill);
}

function setUpTextArea() {
    $(".custom-textarea").on('focus', function () {
        this.setSelectionRange(0, 0);
        this.scrollTop = 0;
    });
}

function btnSaveAsDraftClick() {
    let isValid = validateFields();

    if (isValid) {
        let syllabusName= $("#syllabus-name").val();
        let version = $("#version").val();
        let level = $("#level").val();
        let attendeeNumber = $("#attendee-number").val();
        let requirements = $("#technical-requirements").val();
        let courseName = $("#course-name").val();
        let courseDescription = $("#course-description").val();
        let courseType = $("#object-type").val();
        let status = "DRAFT";

        Dialog.createPopup("Do you want to save this with DRAFT").then((result) => {
            if (result) {
                callApiSave(syllabusName, version, level, attendeeNumber, requirements, courseName, courseType, courseDescription, status);
            }
        });
    }


}

function validateFields() {
    let isValid = true;

    let syllabusName = $("#syllabus-name").val();
    let version = $("#version").val();
    let level = $("#level").val();
    let attendeeNumber = $("#attendee-number").val();
    let requirements = $("#technical-requirements").val();
    let courseName = $("#course-name").val();
    let courseDescription = $("#course-description").val();
    let courseType = $("#object-type").val();

    if (syllabusName === "") {
        $("#syllabus-name-error").show();
        isValid = false;
    } else {
        $("#syllabus-name-error").hide();
    }
    if (version === "") {
        $("#version-error").show();
        isValid = false;
    } else {
        $("#version-error").hide();
    }

    if (level === "") {
        $("#level-error").show();
        isValid = false;
    } else {
        $("#level-error").hide();
    }

    if (attendeeNumber === "") {
        $("#attendee-number-error").show();
        isValid = false;
    } else {
        $("#attendee-number-error").hide();
    }

    if (requirements === "") {
        $("#technical-requirements-error").show();
        isValid = false;
    } else {
        $("#technical-requirements-error").hide();
    }

    if (courseName === "") {
        $("#course-name-error").show();
        isValid = false;
    } else {
        $("#course-name-error").hide();
    }

    if (courseDescription === "") {
        $("#course-description-error").show();
        isValid = false;
    } else {
        $("#course-description-error").hide();
    }

    if (courseType === "") {
        $("#object-type-error").show();
        isValid = false;
    } else {
        $("#object-type-error").hide();
    }

    return isValid;
}

function callApiSave(syllabusName, version, level, attendeeNumber, requirements, courseName, courseType, courseDescription, status) {
    let data = {
        topicName: syllabusName,
        technicalGroup: requirements,
        version: version,
        level: level,
        trainingAudience: attendeeNumber,
        createdBy: currentUser,
        courseName: courseName,
        courseDescription: courseDescription,
        objectiveType: courseType,
        status: status
    }

    $.ajax({
        url: "/api/syllabus/add",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function () {
            localStorage.setItem('showToast', 'true');
            localStorage.setItem('message', 'Content created');
            window.location.href = "/syllabus/view";
        },
        error: function () {
            createToast(false,"Error", "error");
        }
    })
}

function btnAddDayClick() {
    if (sequence > 1) {
        let previousDay = $(`.outline-container[data-value=${sequence - 1}]`);
        if (previousDay.find('.unit-content-container').length === 0) {
            createToast(false, "EROR","Cannot add a new day.\n Please add units to the previous day first.");
            return;
        }
    }

    let element =
        `<div class="outline-container" data-value=${sequence}>
            <div class="heading-outline" data-show="true" data-value=${sequence}>
                <span class="day text-1">Day ${sequence}</span>
            </div>
            <div class="day-body">
                <div class="row-unit" data-day="{sequence}"></div>
                <div class="btn-second btn-add-unit" data-day="${sequence}">
                    <span><i class="fa-solid fa-circle-plus"></i></span>
                    <span>Add unit</span>
                </div>
            </div>
        </div>`;

    $('#day-container').append(element);
    $('.heading-outline').on('click', headingDayClick);
    $(`.btn-add-unit[data-day=${sequence}]`).on('click', createUnitElement);

    sequence = sequence + 1;
}

function createUnitElement() {
    if (unitSequence !== 1) {
        let len = $(`.row-content[data-value=${unitSequence-1}]`).children(".list-item").children().length;
        let inputName = $(`.input-name[data-value=${unitSequence-1}]`);
        if (inputName.val() === "") {
            createToast(false, "ERROR", `Unit name is required for Unit ${unitSequence-1}`);
            return;
        }
        if (len === 0) {
            createToast(false, "ERROR", `Pleas input at least one content into Unit ${unitSequence-1}`);
            return;
        }
    }
    let dayContainer = $(this).closest(".outline-container");
    let daySequence = dayContainer.attr("data-value")
    let element = `
    <div class="unit-content-container">
        <div class="col-left">
            <span class="text-1" data-value=${unitSequence}>Unit ${unitSequence}</span>
        </div>

        <div class="col-right">
            <div class="row-1" data-unit=${unitSequence} data-day=${daySequence}>
                <div style="display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between">
                        <input class="text-1 input-name" style="border: none; width: " placeholder="Type unit name" data-value=${unitSequence}>
                    </div>
                    <span class="duration-hour" data-value="0">... hours</span>
                </div>
                <span><i class="fa-solid fa-circle-chevron-down"></i></span>
            </div>

            <div class="row-content" data-value=${unitSequence}>
                <div class="list-item" data-value="${unitSequence}"></div>
                    
                <div style="margin-top: 10px">
                    <span class="add-content" data-value=${unitSequence}><i class="fa-solid fa-circle-plus"></i></span>
                </div>
            </div>
        </div>
    </div>`;

    dayContainer.find('.row-unit').append(element);
    $(`.add-content[data-value=${unitSequence}]`).on("click", createTrainingContent);
    unitSequence = unitSequence + 1;
}
function headingDayClick() {
    let element = $(this);
    let val = element.attr("data-show");
    let bodyElement = element.next(".day-body");
    if (val === "true") {
        bodyElement.addClass("hide");
        element.attr("data-show", "false");
    } else {
        bodyElement.removeClass("hide");
        element.attr("data-show", "true");
    }
}

function createTrainingContent() {
    Dialog.createFormPopupAddUnitItem("Add training content", fetchContent).then((result) => {
        if (result !== false) {
            console.log(result);
            let name = result.content;
            let id = result.id;
            // let syllabusCode = result.syllabusCode;
            let duration = result.duration;
            let status = result.status;
            let type = null;
            if (status === true) {
                type = "OFFLINE";
            } else {
                type = "ONLINE";
            }
            fetchContent = fetchContent.filter(item => item.id !== id);
            let unitSequence = $(this).attr("data-value");
            let element = `
            <div class="item" data-id=${id}>
                <span class="item-name text-1">${name}</span>
                    <div style="display: flex; gap: 20px;">
                        <div class="objective-code" data-value=${id}>
                        
                        </div>
                        <div class="duration-minute">
                            <span>${duration}mins</span>
                        </div>
                        <div class="format">
                            <span class=${type}>${type}</span>
                        </div>
                        <div class="delivery">
                            <img src="../images/workshop.svg">
                        </div>
                    </div>
            </div>`
            let objectives = result.objectives;
            let parent = $(`.row-content[data-value=${unitSequence}]`).children(".list-item");
            let rowDuration = $(`.row-1[data-unit=${unitSequence}]`).find(".duration-hour");
            let currentDuration = Number(rowDuration.attr("data-value"));
            currentDuration = currentDuration + result.duration/60;
            rowDuration.attr("data-value", currentDuration.toFixed(1));
            rowDuration.text(`${currentDuration.toFixed(1)} hours`);
            parent.append(element);
            for (let o of objectives) {
                let element = `<span>${o.code}</span>`;
                $(`.objective-code[data-value=${id}]`).append(element);
            }
        }
    })

}

function getTrainingContent() {
    $.ajax({
        url: "/api/training_content/unit-empty",
        type: "GET",
        success: function (response) {
            fetchContent = response;
        },
        error: function (xhr) {
            console.log(xhr.responseText);
        }
    })
}

function createTrainingUnit(topicCode) {
    let elements = $(`.row-1`);
    if (elements.length <= 0) {
        createToast(false, "ERROR", "Please input at least one unit.");
        return;
    }
    elements.each(function () {
        let sequence = $(this).attr("data-day");
        let unitSequence = $(this).attr("data-unit");
        let name = $(this).find(".input-name").val();
        console.log(sequence, unitSequence, name);

        let rowContents = $(`.list-item[data-value=${unitSequence}]`).children(".item");

        console.log(rowContents.length); // Check if any items are found

        let allContentId = [];
        rowContents.each(function() {
            let contentId = $(this).attr("data-id");
            allContentId.push(contentId);
        });
        let data = {
            topicCode: topicCode,
            dayNumber: sequence,
            unitName: name
        }
        $.ajax({
            url: "/api/training_unit/add",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                setUnitToContent(response.unitCode, allContentId);
            },
            error: function (xhr) {
                alert(xhr.responseText);
            }
        })
    })
}

function setUnitToContent(unitCode, allContentId) {
    for (let id of allContentId) {
        let data = {
            unitCode: unitCode,
            id: id
        }
        $.ajax({
            url: "/api/training_content/update",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                localStorage.setItem('showToast', 'true');
                localStorage.setItem('message', "Add new syllabus successfully!");
                window.location.href = "/syllabus/view";
            },
            error: function (xhr) {
                console.log(xhr.responseText);
            }
        })
    }
}

function validate() {
    let dayElements = $(`.heading-outline`);
    if (dayElements <= 0) {
        createToast(false, "ERROR", "Please input at least one day.");
        return;
    }
    let elements = $(`.row-1`);
    if (elements.length <= 0) {
        createToast(false, "ERROR", "Please input at least one unit.");
        return false;
    }
    let len = $(`.row-content[data-value=${unitSequence-1}]`).children(".list-item").children().length;
    let inputName = $(`.input-name[data-value=${unitSequence-1}]`);
    if (inputName.val() === "") {
        createToast(false, "ERROR", `Name of Unit ${unitSequence-1} is required`);
        return false;
    }
    if (len === 0) {
        createToast(false, "ERROR", `Please input at least one content into unit ${unitSequence-1}`);
        return false;
    }
    return true;
}

function changeTab() {
    let $tabPane = $(".tab-content");
    let currentTab = $tabPane.attr("data-value");
    if (currentTab === "tab-general") {
        let isValid = validateFields();
        if (isValid) {
            let nextTarget = "tab-outline";
            $tabPane.attr("data-value", nextTarget);
            $("."+currentTab).removeClass("active");
            $(`.`+nextTarget).addClass("active");
            $("#"+nextTarget).addClass("active");
            $("#"+currentTab).removeClass("active");
        }
    } else if (currentTab === "tab-outline") {
        let isValid = validate();
        if (isValid) {
            let nextTarget = "tab-other";
            $tabPane.attr("data-value", nextTarget);
            $("."+currentTab).removeClass("active");
            $(`.`+nextTarget).addClass("active");
            $("#"+nextTarget).addClass("active");
            $("#"+currentTab).removeClass("active");
            $("#btn-next").text("Save");
        }
    } else {
        saveNewSyllabus();
    }
}

function saveNewSyllabus() {
    Dialog.createPopup("Do you want to save this?").then((result) => {
        if (result) {
            let syllabusName= $("#syllabus-name").val();
            let version = $("#version").val();
            let level = $("#level").val();
            let attendeeNumber = $("#attendee-number").val();
            let requirements = $("#technical-requirements").val();
            let courseName = $("#course-name").val();
            let courseDescription = $("#course-description").val();
            let courseType = $("#object-type").val();
            let status = "INACTIVE";
            let data = {
                topicName: syllabusName,
                technicalGroup: requirements,
                version: version,
                level: level,
                trainingAudience: attendeeNumber,
                createdBy: currentUser,
                courseName: courseName,
                courseDescription: courseDescription,
                objectiveType: courseType,
                status: status,
                duration: sequence - 1
            }
            $.ajax({
                url: "/api/syllabus/add",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (response) {
                    createTrainingUnit(response.topicCode);
                },
                error: function () {
                    createToast(false,"Error", "error");
                }
            })
        }
    });
}