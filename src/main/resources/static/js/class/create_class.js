import createToast from "../common/toast_message.js";
import * as Dialog from "../common/dialog.js"

let className = null;
let trainingList = []
let classDuration = 0;
let p_duration = null;
let p_id = null;
$(document).ready(function () {
    $("#add-class").addClass("active");
    let current_link = $("#add-class a");
    let current_link_name = current_link.text();
    current_link.text("");
    current_link.append(`<b>${current_link_name}</b>`);

    let showTrainingList = false;

    $("#btn-create").on("click", function (event) {
        event.preventDefault();
        btnCreateClick();
    });

    $("#btn-save-as-draft").on("click", btnSaveAsCraftClick);
    $("#btn-next").on("click", btnSaveClick)
    $("#btn-cancel").on("click", btnCancelClick);

    populatedTrainingProgram();

    $("#search-input").on("input", handleSearch);

    $(document).on("click", function (event) {
        const $target = $(event.target);
        if (!$target.closest("#search-input").length && !$target.closest(".result-container").length) {
            $(".result-container").addClass("hide");
        }
    });

    $("#FSU").on("change", changeLocation);
});

function btnCreateClick() {
    let inputName = $("#name");
    if (inputName.val() === "") {
        createToast(false, "Error", "Class name is required!");
        return;
    }
    let inforContainer = $(".class-information");
    inforContainer.css("display", "flex");
    let inforName = $(".infor-name span");
    inforName.text(inputName.val());
    inforName.css("font-weight", 700);
    $("#create-new").css("display", "none");
    className = inputName.val();
}

function createSyllabusItem(name, status, days, createdDate, createdBy) {
    let day = createdDate.getDate();
    let month = createdDate.getMonth()+1;
    let year = createdDate.getFullYear();
    if (days === null) {
        days = 0;
    }

    classDuration = classDuration + days;

    return `
    <div class="item-container border-opacity">
        <div class="training-left"><img th:src="../images/class_feature_icon.svg"></div>
        <div class="training-right">
            <div style="display: flex; align-items: center">
                <span class="training-name">${name}</span>
                <div class="training-status">${status}</div>
            </div>

            <div style="margin-top: 20px">
                <span class="training-duration">${days} days</span>
                <span class="created-on" style="border-left: 1px solid rgba(0, 0, 0, 0.5); padding: 0 10px;">on ${day}/${month}/${year}</span>
                <span class="created-by">by ${createdBy}</span>
            </div>
        </div>
    </div>`;
}

function btnSaveAsCraftClick() {
    let from = $("#from").val() || null;
    let to = $("#to").val() || null;
    let startDate = $("#start-date").val() || null;
    let prefix = $("#FSU").val();
    let date =  new Date(startDate);
    let data = {
        name: className,
        location: prefix,
        status: "DRAFT",
        startTime: changeTimeToLong(from),
        endTime: changeTimeToLong(to),
        startDate: date.getTime(),
        createdBy: 1,
        trainingId: p_id,
        FSU: $("#FSU").text()
    };

    Dialog.createPopup("Do you want to save this with status DRAFT").then((result) => {
        if (result) {
            saveClass(data);
        }
    });
}

function saveClass(data) {
    $.ajax({
        url: "/api/class/add",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            localStorage.setItem('showToast', 'true');
            localStorage.setItem('message', "Add new class successfully!");
            window.location.href = "/class/view";
        },
        error: function (xhr) {
            createToast(false,"ERROR", xhr.responseText);
        }
    })
}

function changeTimeToLong(timeValue) {
    if (timeValue) {
        let [hours, minutes] = timeValue.split(':').map(Number);
        let date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.getTime();
    }
    return null;
}

function fetchTrainingPrograms() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/training_program/all",
            type: "GET",
            success: function (response) {
                if (Array.isArray(response)) {
                    resolve(response);
                } else {
                    reject(new Error("No Data"));
                }
            },
            error: function (xhr) {
                reject(new Error(xhr.responseText));
            }
        });
    });
}

function populatedTrainingProgram() {
    fetchTrainingPrograms().then(response => {
        for (const item of response) {
            console.log(item);
            trainingList.push({
                id: item.id,
                name: item.name,
                duration: item.duration,
                status: item.status,
                createdDate: item.createdDate,
                createdBy: item.createdBy.name
            });
        }
    });
    console.log(trainingList);
}

function handleSearch() {
    let val = $(this).val()
    let container = $(".result-container");
    container.removeClass("hide");
    container.empty();
    const filteredItems = trainingList.filter(item => {
        return item.name.toLowerCase().includes(val.toLowerCase());
    });
    console.log(filteredItems);
    if (filteredItems.length > 0) {
        container.removeClass("not-found");
        container.text("");
        for (const item of filteredItems) {
            $('<div>', {
                'data-id': item.id,
                'data-name': item.name,
                'data-duration': item.duration,
                'data-status': item.status,
                'data-createdDate': item.createdDate,
                'data-createdBy': item.createdBy,
                'class': 'item-training',
                'text': item.name
            }).appendTo(container);
        }
        $(".item-training").on("click", chooseTraining);
    } else {
        container.addClass("not-found");
        container.text("Not found");
    }
}

function changeLocation() {
    let locationField = $("#location");
    let val = $(this).val();
    if (val === "HN") {
        locationField.text("Fville – Khu công nghệ cao Hòa Lạc, Thạch Thất");
    } else if (val === "HCM") {
        locationField.text("Ftown - Lô số 2, đường D1, khu Công nghệ cao TP. Thủ Đức");
    } else if (val === "DN") {
        locationField.text("FPT Complex - Đường Nam Kỳ Khởi Nghĩa, Quận Ngũ Hành Sơn")
    }
}

function chooseTraining() {
    let id = $(this).attr("data-id");
    let name = $(this).text();
    let duration = $(this).attr("data-duration");
    let status = $(this).attr("data-status");
    let createdDate = Number($(this).attr("data-createdDate"));
    let createdBy = $(this).attr("data-createdBy");

    let date = new Date(createdDate);
    let day = date.getDate();
    let month = date.getMonth()+1;
    let year = date.getFullYear();

    let trainingName = $(".training-name");
    trainingName.removeAttr("id");
    trainingName.text(name);

    $("#status").text(status).removeClass("hide");

    $(".duration").text(duration + " days");

    $(".created").text(`on ${day}/${month}/${year} by ${createdBy}`);

    $(".infor-status, .information").removeClass("hide");
    $(".result-container").addClass("hide");

    p_id = id;
    if (duration !== null) {
        p_duration = duration;
    }

    let syllabusItemList = [];
    showSyllabusesOfTraining(id).then((result) => {
        $("#list-syllabus-container").empty();
        let syllabuses = result.syllabuses;
        console.log(syllabuses);
        for (let item of syllabuses) {
            let sequence = item.sequence;
            let syllabus = item.syllabus;
            let s_name = syllabus.topicName;
            let s_createdBy = syllabus.createdBy.name;
            let s_createdDate = syllabus.createdDate;
            let s_status = syllabus.status;
            let s_version = syllabus.version;
            let s_duration = syllabus.duration;
            syllabusItemList.push({
                sequence: sequence,
                name: s_name,
                duration: s_duration,
                createdBy: s_createdBy,
                version: s_version,
                status: s_status,
                createdDate: s_createdDate
            });
        }
        syllabusItemList.sort((a, b) => a.sequence - b.sequence);
        for (let item of syllabusItemList) {
            let element = createSyllabusItem(item.name, item.status, item.duration, new Date(item.createdDate), item.createdBy);
            $("#list-syllabus-container").append(element);
            $("#list-syllabus-container").removeClass("hide");
        }
        $(".value-day").text(p_duration+" days");
    });
 }

function showSyllabusesOfTraining(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/training_program/detail?id="+id,
            type: "GET",
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                reject(new xhr.responseText)
            }
        });
    });
}

function btnSaveClick() {
    let from = $("#from").val() || null;
    let to = $("#to").val() || null;
    let startDate = $("#start-date").val() || null;
    let prefix = $("#FSU").val();
    let date =  new Date(startDate);
    let endDate = new Date(date);
    if (classDuration !== null) {
        endDate.setDate(date.getDate() + classDuration)
    }

    let endDateObject = new Date(endDate);
    if (from === null || to === null) {
        createToast(false, "ERROR", "Time is required!");
        return;
    }
    if (startDate === null) {
        createToast(false, "ERROR", "Start date is required!");
        return;
    }
    if (p_id === null) {
        createToast(false, "ERROR", "Training program is required!");
        return;
    }
    let data = {
        name: className,
        location: prefix,
        status: "DRAFT",
        startTime: changeTimeToLong(from),
        endTime: changeTimeToLong(to),
        startDate: date.getTime(),
        endDate: endDate.getTime(),
        createdBy: 1,
        trainingId: p_id,
        duration: p_duration,
        FSU: $("#FSU").text()
    };
    saveClass(data);
}

function btnCancelClick() {
    Dialog.createPopup("Do you want to cancel create this class?").then((result) => {
        if (result) {
            window.location.reload();
        }
    })
}