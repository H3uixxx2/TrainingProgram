import * as Dialog from "../common/dialog.js";
import createToast from "../common/toast_message.js";
let newProgramName = null;
let newStatus;
let change = false;
let syllabusList = []
let p_syllabus = []
let p_duration = 0;

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const programId = urlParams.get('id');
    if (programId) {

        $.ajax({

            url: `/api/training_program/detail?id=${programId}`,
            method: 'GET',
            success: function(data) {
                showHeadingDetail(data.training.name, data.training.status, data.training.duration,
                    data.training.createdDate, data.training.createdBy.name);
                let syllabuses = data.syllabuses
                newProgramName = data.training.name;
                newStatus = data.training.status;
                if (Array.isArray(syllabuses) && syllabuses.length > 0) {
                    for (let item of syllabuses) {
                        addSyllabusCard(item.code,
                            item.name || 'N/A',
                            item.status || 'N/A',
                            item.version || 'N/A',
                            item.duration || '0',
                            item.updatedDate || 0,
                            item.updatedBy || 'N/A');

                    }
                    console.log(syllabuses);
                }
            },
            error: function (error) {
                console.error('Error fetching training program details:', error);
            }
        });
    }
    $(document).on("click", ".btn-remove", function (event) {
        event.preventDefault();
        console.log(p_syllabus);
        let card = $(this).closest(".syllabus-card")
        let topicCode = card.attr("data-topic-code");
        for (let i = 0; i < p_syllabus.length; i++) {
            let item = p_syllabus[i];
            if (item.topicCode === topicCode) {
                p_syllabus.splice(i, 1);
                p_duration -= item.duration;
                $("#duration-val").text(p_duration);
            }
        }
        card.remove();
    });
    fetchData();
    $("#button-edit").on("click", function(event) {
        event.preventDefault();
        showButtonPane();
        createSearchSyllabus();
    });
    populatedTrainingProgram();
});
function editName(newName) {
    if (newName !== null) {
        $(".infor-name span b").text(newName);
    }
}

function editStatus(result) {
    if (result !== null) {
        $(".infor-status").text(result);
    }
}

function showHeadingDetail(name, status, duration, createdDate, createdBy) {

    let infor_element = `<div class="training-information" style="display: flex; justify-content: space-between">
            <div class="infor-left">
                <div class="title infor-name">
                    <span><b>${name}</b></span>
                </div>

                <div class="infor-status">${status}</div>
            </div>

            <div class="infor-right" style="display: flex; position: relative;">
                <div class="menu-container">
                    <img src="../../images/more_horizontal.svg" id="icon-horizontal" style="cursor: pointer; width: 40px; height: 40px;" />
                    
                    <div class="menu-edit menu-inactive" style="width: 150px; border-radius: 7px">
                        <div class="menu-item" id="edit-name">Edit name</div>
                        <div class="menu-item" id="edit-status">Edit status</div>
                    </div>
                </div>
            </div>
        </div>`

    $(".heading").append(infor_element);

    let menuActive = false;

    $("#icon-horizontal").on("click", function (event) {
        menuActive = openMenuEdit(event, menuActive);
    })

    if (duration === null) {
        duration = "...";
    }

    let date = new Date(createdDate);

    let general_element =
        `<div class="general-container">
            <div class="duration">
                <span style="font-size: 16px" >
                    <span id="duration-val"> days</span>
                    <i style="font-size: 14px">(... hours)</i></span>
            </div>

            <div class="created-infor" style="font-size: 14px">
                <span>Modified on ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} by <b>${createdBy}</b></span>
            </div>
            
        </div>
        
        <div class="syllabus-content-container" style="padding: 20px">
            <div class="syllabus-search" style="display:flex;">
            <span style="font-size: 24px; font-weight: bold">Content</span>
            </div>
            <div class="training-program-content">
                
            </div>
        </div>`

    $(".table-container").before(general_element);
    $(".menu-item").on("click", function (event){
        event.preventDefault();
        $(".menu-edit").css("display", "none");
        menuActive = false;

        let type = $(this).attr("id");

        if (type === "edit-name") {
           Dialog.createFormPopup("Edit name", "Name: ", "INPUT").then((result) => {
               if (result !== false) {

                   if (result === null || result === "") {
                       createToast(false, 'Error', 'Program name required!');
                       return;
                   }
                   editName(result);
                   newProgramName = result;
                   if (change !== true) {
                       change = true;
                   }
               }
           });
        } else if (type === "edit-status") {
            Dialog.createFormPopup("Edit status", "Status: ", "COMBOBOX").then((result) => {
                if (result !== false) {
                    editStatus(result);
                    newStatus = result;
                    if (change !== true) {
                        change = true;
                    }
                }
            });
        }
    })
}

function openMenuEdit(event, menuActive) {
    event.preventDefault();
    let menuEdit = $(".menu-edit");
    if (menuActive) {
        menuEdit.css("display", "none");
        return false;
    } else {
        menuEdit.css("display", "block");
        return true;
    }
}


function showButtonPane() {
    let buttonPane =
        `<div id="btn-pane" style="justify-content: right"> 
        <div class="right-pane">
            <button id="btn-cancel" class="btn-ghost text-btn">Cancel</button>
            <button id="btn-save" class="btn-action text-btn">Save</button>
        </div>`
    $(".table-container").after(buttonPane);
    $(".btn-remove").removeClass('hide');
    $("#button-edit").addClass('hide');

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

function buttonBackClick(){}

function buttonCancelClick() {
    Dialog.createPopup("Do you want to cancel editing?").then((result) => {
        if (result) {
            window.location.href = `/training_program/detail?id=${id}`;
        }
    })
}

function buttonSaveClick() {
    Dialog.createPopup("Do you want to save this?").then((result) => {
        if (result) {
            let jsonData = {
                "name": newProgramName,
                "status": newStatus,
                "duration": p_duration,
                "syllabuses" : p_syllabus,
            };
            console.log(jsonData);
            $.ajax({
                url: "/api/training_program/update/"+id,
                type: "POST",
                data: JSON.stringify(jsonData),
                contentType: "application/json",
                success: function (response){

                    localStorage.setItem('showToast', 'true');
                    localStorage.setItem('message', 'Content udpated');
                    window.location.href = `/training_program/detail?id=${id}`;
                },
                error: function (response) {
                    localStorage.setItem('showToast', 'false');
                    localStorage.setItem('message', 'Content not created');
                }
            });
        }
    })
}

function addSyllabusCard(topicCode, topicName, status, version, duration, updatedDate, updatedBy) {
    const exists = p_syllabus.some(syllabus => syllabus.topicCode === topicCode);

    if (!exists) {
        // Nếu chưa tồn tại, thêm syllabus mới vào mảng
        const syllabusCard = {
            topicCode: topicCode,
            topicName: topicName,
            duration: duration
        };
        p_syllabus.push(syllabusCard);
    } else {
        return
    }
    p_duration += duration;
    $("#duration-val").text(p_duration);
    let date = new Date(updatedDate);
    let newDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

    let syllabusContent = `
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
            <img class="btn-remove hide" data-value=${topicCode} src="../../images/cancel_black.svg" alt="Close" style="width: 20px;">
        </div>
    </div>
    `
    $(".training-program-content").append(syllabusContent);
    console.log("a");

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

//  create searchSyllabus
function createSearchSyllabus() {
    let searchSyllabusField =
        `<div class="syllabus-field" style="padding: 0 20px 0 20px;">
            <div style="display: flex; align-items: center; gap: 10px">
                <div style="position: relative">
                    <input type="text" id="search-input" name="trainingName" class="form-control search-input" placeholder="Syllabus name" aria-label="Search" aria-describedby="basic-addon2" size="40">
                <div class="result-container hide">
                </div>
                </div>
            </div>
            <div class="syllabus-container">
            
            </div>
        </div>`
    $(".syllabus-search").append(searchSyllabusField);
    $("#search-input").on("input", handleSearch);

}
let data = []
let filteredData = []
function fetchData() {
    $.ajax({
        type: "GET",
        url: `/api/class/allByTraining?id=${id}`,  // Đảm bảo URL đúng
        dataType: "json",
        success: function (response) {
            if (!Array.isArray(response)) {
                displayNoData();
                return;
            }
            data = response;
            filteredData = data;
            setupPagination(data, displayTable); // Khởi tạo pagination và hiển thị bảng
        },
        error: function (xhr, status, error) {
            console.error('Error fetching data:', status, error);
            displayNoData();
        }
    });
}


function displayTable(page, data) {
    const tableContent = $('#tableContent');
    tableContent.empty();

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    if (paginatedData.length === 0) {
        displayNoData();
    } else {
        paginatedData.forEach(row => {
            const classID = row.classID ? row.classID : 'N/A';
            let statusClass = '';  // Biến để giữ tên lớp CSS
            let statusText = '';   // Biến để giữ nội dung văn bản

            // Kiểm tra và gán giá trị lớp CSS và văn bản tương ứng
            if (row.status) {
                statusClass = row.status.toLowerCase();  // Chuyển trạng thái thành chữ thường
                statusText = row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase();  // Định dạng văn bản
            }

            const tr = `
                <tr>
                    <td class="program-name">${row.className}</td>
                    <td class="class-id">${classID}</td>
                    <td>${row.createdDate ? new Date(row.createdDate).toLocaleDateString() : 'N/A'}</td>
                    <td>${row.createdBy ? row.createdBy.name : 'N/A'}</td>
                    <td>${row.duration ? row.duration : 0} days</td>
                    <td><div class="status-badge ${statusClass}">${statusText}</div></td>
                    <td>${row.location}</td>
                    <td>${row.fsu ? row.fsu : 'FMH'}</td>
                    <td class="more-options">
                        <img src="/images/more_horizontal1.svg" alt="More">
                    </td>
                </tr>
            `;
            tableContent.append(tr);
        });
    }
    bindDetailClickEvents();
    const totalPages = Math.ceil(data.length / rowsPerPage);
    displayPageNumbers(data, totalPages, displayTable);
}

function displayNoData() {
    const tableContent = $('#tableContent');
    tableContent.empty();
    const tr = $('<tr></tr>');
    const td = $('<td></td>').attr('colspan', '9').css('text-align', 'center').text('No data found');
    tr.append(td);
    tableContent.append(tr);
}
function bindDetailClickEvents() {
    $(".program-name").on("click", function() {
        const classID = $(this).closest('tr').find('.class-id').text().trim();
        window.location.href = `/class/detail?code=${classID}`;
    });
}

function handleSearch () {
    let val = $(this).val()
    let container = $(".result-container");
    container.removeClass("hide");
    container.empty();
    const filteredItems = syllabusList.filter(item => {
        return item.topicName.toLowerCase().includes(val.toLowerCase());
    });
    if (filteredItems.length > 0) {
        container.removeClass("not-found");
        container.text("");
        for (const item of filteredItems) {
            let element = `
                <div 
                    data-id="${item.topicCode}" 
                    data-item='${JSON.stringify(item)}' 
                    class="item-training">
                    ${item.topicName}
                </div>`;
            container.append(element);
        }
        $(".item-training").on("click", chooseSyllabus);
    } else {
        container.addClass("not-found");
        container.text("Not found");
    }
}

function chooseSyllabus(){
    let itemData = $(this).data('item');

    addSyllabusCard(itemData.topicCode, itemData.topicName, itemData.status, itemData.version, itemData.duration, itemData.updatedDate, itemData.updatedBy)
    $(".result-container").addClass("hide");

    $("#search-input").val('');
}

window.addEventListener('load', function () {
    if (localStorage.getItem('showToast') === 'true') {
        let msg = localStorage.getItem('message');
        createToast(true, 'Success', msg);
        localStorage.removeItem('showToast');
    } else if (localStorage.getItem('showToast') === 'false'){
        let msg = localStorage.getItem('message');
        createToast(false, 'Error', msg);
        localStorage.removeItem('showToast');
    }
});