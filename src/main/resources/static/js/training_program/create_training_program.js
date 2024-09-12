import * as Dialog from "../common/dialog.js";
import createToast from "../common/toast_message.js";

let currentUser = 1;
let p_duration = 0;
let status;
let p_name;
let createdDate;
let syllabusList = []
let p_syllabus = []

$(document).ready(function () {
    console.log("Welcome to create training program page");
    $("#add-training").addClass("active");
    let current_link = $("#add-training a");
    let current_link_name = current_link.text();
    current_link.text("");
    current_link.append(`<b>${current_link_name}</b>`);
    addButtonListener();


    let showTrainingList = false;

    $(".heading-bar button").on("click", function (event) {
        event.preventDefault();
        let syllabusContainer = $("#list-training-container");


        showTrainingList = showTrainingPane(syllabusContainer, showTrainingList)
    });

    populatedTrainingProgram();

    $(document).on("click", function (event) {
        const $target = $(event.target);
        if ($target.closest("[data-id]").length) {
            $(".result-container").addClass("hide");
        } else if (!$target.closest("#search-input").length && !$target.closest(".result-container").length) {
            $(".result-container").addClass("hide");
        }
    });

    $(document).on("click", ".result-container div", function () {
        var dataId = $(this).attr('data-id');
        console.log('clicked items', dataId);

        var syllabusItem = syllabusList.find(item => item.topicCode == dataId);
        console.log('syllabus item:', syllabusItem);
        if (syllabusItem) {
            createSyllabusCard(
                syllabusItem.topicCode,
                syllabusItem.topicName,
                syllabusItem.status,
                syllabusItem.version,
                syllabusItem.duration,
                syllabusItem.createdDate,
                syllabusItem.updatedBy
            );
        } else {
            createToast(false, "Error", "No matching syllabus item");
        }
    });

    $(document).on("click", ".btn-remove", function (event) {
        event.preventDefault();
        let card = $(this).closest(".syllabus-card")
        let topicCode = card.attr("data-topic-code");
        for (let i = 0; i < p_syllabus.length; i++) {
            let item = p_syllabus[i];
            if (item.topicCode === topicCode) {
                syllabusList.push(item);
                p_syllabus.splice(i, 1);
                p_duration -= item.duration;
                $("#duration-val").attr("data-duration", p_duration);
            }
        }
        card.remove();
    });
})

function showInformationOfTraining(name) {
    let infor_element =
        `<div class="training-information" style="display: flex">
            <div class="infor-left">
                <div class="title infor-name">
                    <span><b>${name}</b></span>
                </div>

                <div class="infor-status">Draft</div>
            </div>

            <div class="infor-right" style="display: flex">
                <img src="../../images/more_horizontal.svg"/>
            </div>
        </div>`

    $(".heading").append(infor_element);
}

function showGeneralInformation(date, name) {
    let generalElement =
        `<div class="general-container">
            <div class="duration">
                <span style="font-size: 16px" id="duration-val" data-duration="0">. . . days</span>
            </div>

            <div class="created-infor" style="font-size: 14px">
                <span>Modified on ${date} by <b>${name}</b></span>
            </div>
        </div>`;
    $(".right-container").append(generalElement);
    // createDatePicker();
    observer();
}

function showButtonPane() {
    let buttonPane =
        `<div id="btn-pane">
        <div class="left-pane">
            <button id="btn-back" class="btn-action text-btn">Back</button>
        </div>

        <div class="right-pane">
            <button id="btn-cancel" class="btn-ghost text-btn">Cancel</button>
            <button id="btn-save" class="btn-action text-btn">Save</button>
        </div>
    </div>`
    $(".right-container").append(buttonPane);

    $("#btn-back").on("click", function (event) {
        buttonBackClick(event);
    });

    $("#btn-cancel").on("click", function (event) {
        buttonCancelClick(event);
    });

    $("#btn-save").on("click", function (event) {
        buttonSaveClick(event);
    })
}

function addButtonListener() {
    $("#btn-create").on("click", function (event) {
        event.preventDefault();
        let training_name = $("#name").val();
        if (training_name !== "") {
            let date =  new Date();
            createdDate = date.getTime();
            let dateString = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
            showInformationOfTraining(training_name);
            showGeneralInformation(dateString, "Warrior Tran.");
            createSearchSyllabus();
            showButtonPane();
            $("#create-new").css("display", "none");

            p_name = training_name;
        }
        else {
            // notification popup
            createToast(false, 'Error', 'Program name required!');
        }
    });
}

function buttonBackClick(event) {
    event.preventDefault();
    $("#create-new").css("display", "flex");
    $(".general-container").remove();
    $("#btn-pane").remove();
    $(".training-information").remove();
    $("#date-picker-group").remove();
    $(".syllabus-field").remove();
    $(".syllabus-container").remove();


}

function buttonCancelClick(event) {
    event.preventDefault();

    Dialog.createPopup("Do you want to cancel save this?").then((result) => {
        if (result === true) {
            window.location.reload();
        }
    })
}

function buttonSaveClick(event) {
    event.preventDefault();
    console.log(p_syllabus);
    let message;
    if (p_duration === 0 || p_syllabus.length === 0) {
        message = "You didn't fulfill all information? Do you want to save with 'Draft'";
    } else {
        message = "Do you want to save this?"
    }


    Dialog.createPopup(message).then((result) => {
        if (result === true) {
           saveTrainingProgram(p_name, currentUser, createdDate, p_duration);
        }
    });
}

function saveTrainingProgram(name, createdBy, createdDate, duration) {
    let jsonData = {
        name: name,
        createdBy: createdBy,
        createdDate: createdDate,
        duration: null,
        syllabuses: []
    }
    if (p_duration !== 0) {
        jsonData.duration = p_duration;
    }
    if (p_syllabus.length > 0) {
        jsonData.syllabuses = p_syllabus;
    }
    console.log(jsonData);
    $.ajax({
        url: "/api/training_program/add",
        type: "POST",
        data: JSON.stringify(jsonData),
        contentType: "application/json",
        success: function (response){

            localStorage.setItem('showToast', 'true');
            localStorage.setItem('message', 'Content created');
            window.location.href = "/training_program/view";
        },
        error: function (xhr) {
            alert(xhr.responseText);
            localStorage.setItem('showToast', 'false');
            localStorage.setItem('message', 'Content not created');
        }
    });
}

//  create searchSyllabus
function createSearchSyllabus() {
    let searchSyllabusField =
        `<div class="syllabus-field" style="padding: 0 20px 0 20px; gap: 20px; margin-top: 20px">
            <div>
                <span style="font-weight: bold; font-size: 16px">Content</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px">
                <span style="font-weight: bold; font-size: 16px">Select Syllabus</span>
                <div style="position: relative">
                    <input type="text" id="search-input" name="trainingName" class="form-control search-input" placeholder="Syllabus name" aria-label="Search" aria-describedby="basic-addon2" size="40">
                <div class="result-container hide">
                </div>
                </div>
            </div>
            <div class="syllabus-container">
            
            </div>
        </div>`
    $(".right-container").append(searchSyllabusField);
    $("#search-input").on("input", handleSearch);

}

function handleSearch() {
    let val = $(this).val();
    let container = $(".result-container");
    container.removeClass("hide");
    container.empty();

    // Filter items based on the search query
    const filteredItems = syllabusList.filter(item => {
        return item.topicName.toLowerCase().includes(val.toLowerCase());
    });

    if (filteredItems.length > 0) {
        container.removeClass("not-found");
        container.text("");

        for (const item of filteredItems) {
            // Handle null or undefined values with a fallback string
            const topicName = item.topicName || "No Name Available";
            const topicCode = item.topicCode || "No Code Available";

            let element = `<div data-id="${topicCode}">${topicName}</div>`;
            console.log(element);
            container.append(element);
        }
    } else {
        container.addClass("not-found");
        container.text("Not found");
    }
}


function showTrainingPane(element, showTrainingList) {
    if (showTrainingList) {
        element.css("display", "none");
        return false;
    } else {
        element.css({
            "display": "flex",
            "flex-direction": "column"
        });
        return true;
    }
}

function fetchSyllabus() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/syllabus/all",
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
    fetchSyllabus().then(response => {
        for (const item of response) {
            syllabusList.push({
                topicCode: item.topicCode || 'N/A',
                topicName: item.topicName || 'N/A',
                duration: item.duration || 'N/A',
                createdDate: item.createdDate || 'N/A',
                createdBy: item.createdBy ? item.createdBy.name : 'N/A',
                updatedDate: item.updatedDate || 'N/A',
                updatedBy: item.updatedBy ? item.updatedBy.name : 'N/A',
                version: item.version || 'N/A',
                status: item.status || 'N/A'
            });
        }
    }).catch(error => {
        console.error("Error fetching syllabus:", error);
    });

    console.log(syllabusList);
}


function createSyllabusCard(topicCode, topicName, status, version, duration, updatedDate, updatedBy) {
    for (let i = 0; i < syllabusList.length; i++) {
        if (syllabusList[i].topicCode === topicCode) {
            p_syllabus.push(syllabusList[i]);
            syllabusList.splice(i, 1);
        }
    }
    let date = new Date(updatedDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let  newDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    let syllabusContent;
    if (updatedDate === 'N/A') {
        newDate = 'N/A';
    }
    if (duration !== null) {
        p_duration += duration;
        $("#duration-val").attr("data-duration", p_duration)
    }
    syllabusContent = `
    <div class="syllabus-card" data-topic-code = ${topicCode}>
        <div class="training-header" style="display: flex; align-items: center; gap: 15px">
            <span class="training-name" style="font-size: 24px; font-weight: bold">${topicName}</span>
            <div class="status" style="background-color: #2d3748; color: white; padding: 5px 10px; border-radius: 15px; white-space: nowrap">${status}</div>
        </div>
        <div class="training-details" style="display: flex; align-items: center; gap: 10px; font-size: 14px;">
            <span class="training-version">${version}</span>
            <span>|</span>
            <span class="training-duration">${duration} days</span>
            <span>|</span>
            <span> Modified on</span>
            <span class="training-updated">${newDate}</span>
            <span>by</span>
            <span class="training-updated-by" style="font-weight: bold">${updatedBy}</span>
        </div>
        <div class="training-close" style="position: absolute; top: 10px; right: 10px; cursor: pointer;">
            <img class="btn-remove" data-value=${topicCode} src="../../images/cancel_black.svg" alt="Close" style="width: 20px;">
        </div>
    </div>
    `

    $(".syllabus-container").append(syllabusContent);
}

function observer() {
    const $durationSpan = $("#duration-val");

    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-duration') {
                const newDuration = Number($durationSpan.attr('data-duration'));
                if ((newDuration) !== 0) {
                    $durationSpan.text(newDuration + " days");
                } else {
                    $durationSpan.text(". . . days");
                }
            }
        });
    });

    observer.observe($durationSpan[0], {
        attributes: true,
        attributeFilter: ['data-duration']
    });

}