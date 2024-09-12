import createToast from "../common/toast_message.js";
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const syllabus_code = urlParams.get('code');
    if (syllabus_code) {
        $.ajax({
            url: `/api/syllabus/detail?code=${syllabus_code}`,
            method: 'GET',
            success: function(data) {
                showHeadingDetail(data);
                showHeadingBodyDetail(data);
                showTabGeneral(data);
                showTabOutline(syllabus_code);
                showTabOther(data);
            },
            error: function (error) {
                console.error('Error fetching training program details:', error);
            }
        });
    }
    $('.edit-button').on('click', function(event) {
        event.preventDefault();  // Ngăn chặn hành vi mặc định của nút

        window.location.href = `/syllabus/edit?code=${syllabus_code}`;
    });
    setupTabButtons();
});

function showHeadingDetail(data) {
    let heading_element = `
        <div class="title" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <span><b style="color: #2D3748; font-size: 36px; font-weight: 700;">${data.topicName}</b></span>
                <label class="status-badge">${data.status}</label>
            </div>
            <img src="../images/more_horizontal1.svg" style="width: 36px; height: 36px; vertical-align: middle;">
        </div>
        <label style="color: #2D3748; font-size: 24px; font-weight: 700; margin: 0">${data.topicCode} v${data.version}</label>
    `;

    $(".heading").append(heading_element);
}

function showHeadingBodyDetail(data) {
    let modifiedDate = data.updatedDate ? new Date(data.updatedDate).toLocaleDateString() : new Date(data.createdDate).toLocaleDateString();
    let modifiedBy = data.updatedBy ? data.updatedBy.name : data.createdBy.name;
    let heading_body_detail = `
        <span><b style="color: #000000; font-size: 24px; font-weight: 700;">${data.duration ? data.duration : '...'}</b> days <span style="font-style: italic">(... hours)</span></span>
        <span>Modified on <span style="font-style: italic">${modifiedDate}</span> by <b>${modifiedBy}</b></span>
    `;
    $(".heading-body").append(heading_body_detail);
}

function showTabGeneral(data) {
    // Khởi tạo biến để chứa nội dung output standards
    let outputStandards = '';

    // Gọi hàm getOutput và xử lý kết quả
    getOutput(data.topicCode).then((result) => {
        if (result && Array.isArray(result) && result.length > 0) {
            outputStandards = result.map(item => `
                <label class="status-badge" style="margin-bottom: 8px; border-radius: 7px;">${item}</label>
            `).join('');
        }

        // Sau khi xử lý xong output standards, tiếp tục tạo nội dung HTML
        renderTabGeneral(data, outputStandards);
    }).catch((error) => {
        console.error('Lỗi khi lấy dữ liệu:', error);
        // Nếu có lỗi trong quá trình lấy dữ liệu, vẫn tiếp tục tạo nội dung HTML mà không có output standards
        renderTabGeneral(data, outputStandards);
    });
}

function renderTabGeneral(data, outputStandards) {
    let level = data.level === "ALL" ? "All Level" :
        data.level === "ADVANCED" ? "Advanced" :
            data.level === "BEGINNER" ? "Beginner" :
                "Unknown Level";

    let tap_general = ` 
        <div class="container" style="max-width: 100%;">
            <div class="custom-row">
                <div class="col-left">
                    <div class="info-row">
                        <div class="icon-text">
                            <img src="../images/star.svg" class="icon">
                            <b>Level</b>
                        </div>
                        <span class="info">${level}</span>
                    </div>
                    <div class="info-row">
                        <div class="icon-text">
                            <img src="../images/group.svg" class="icon">
                            <b>Attendee number</b>
                        </div>
                        <span class="info">${data.trainingAudience}</span>
                    </div>
                    <div class="info-row">
                        <div class="icon-text" >
                            <img src="../images/verified_user.svg" class="icon">
                            <b>Output standard</b>
                        </div>
                        <div style="display: flex;flex-wrap: wrap; margin-left:20px;">${outputStandards}</div>
                    </div>
                </div>
                <div class="col-right" style="width: 630px;">
                    <div style="margin: 10px;">
                        <img src="../images/settings.svg" class="icon">
                        <b>Technical Requirement(s)</b>
                        <p style="margin-left: 5px;">${data.technicalGroup}</p>
                    </div>
                </div>
            </div>
            <div class="custom-row">
                <div class="col-full" style="width: 1085px;min-height: 200px;">
                    <div style="margin: 20px;">
                        <img src="../images/filter_center_focus.svg" class="icon">
                        <b>Course Objectives</b>
                        <p>Code: ${data.courseObjective.code} - ${data.courseObjective.name}<br>Description: ${data.courseObjective.description}</p>
                    </div>
                </div>
            </div>
        </div>`;
    $("#tab-general").append(tap_general);
}

function showTabOutline(code) {
    $.ajax({
        url: "/api/syllabus/outlines?code="+code,
        success: function (response) {
            populatedOutlines(response);
        },
        error: function (xhr) {
            console.log(xhr.responseText);
        }
    })
}

function showTabOther(data) {
    let tap_other = `<h2>Other</h2>`;
    $("#tab-other").append(tap_other);
}
function setupTabButtons(){
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
window.addEventListener('load', function () {
    if (localStorage.getItem('showToast') === 'true') {
        let msg = localStorage.getItem('message');
        createToast(true, 'Success', msg);
        localStorage.removeItem('showToast');
    } else if (localStorage.getItem('showToast') === 'false'){
        let msg = localStorage.getItem('message');
        createToast(false,'Error', msg);
        localStorage.removeItem('showToast');
    }
});

function getOutput(topicCode) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/syllabus/output/' + encodeURIComponent(topicCode),  // Ensure topicCode is correctly encoded
            type: 'GET',
            success: function (response) {
                resolve(response);
            },
            error: function (xhr) {
                console.error('Error fetching output for topicCode:', topicCode, xhr);  // Debugging line
                reject(xhr);
            }
        });
    });
}
window.addEventListener('load', function () {
    if (localStorage.getItem('showToast') === 'true') {
        let msg = localStorage.getItem('message');
        createToast(true, 'Success', msg);
        localStorage.removeItem('showToast');
    } else if (localStorage.getItem('showToast') === 'false'){
        let msg = localStorage.getItem('message');
        createToast(false,'Error', msg);
        localStorage.removeItem('showToast');
    }
});

function populatedOutlines(data) {
    let unitSequence = 0;
    if (Array.isArray(data)) {
        data.sort((a, b) => {
            // Sắp xếp theo dayNumber trước
            if (a.dayNumber !== b.dayNumber) {
                return a.dayNumber - b.dayNumber;
            }

            // Nếu dayNumber bằng nhau, sắp xếp theo item.id
            const aItemId = a.contents[0].item.id;
            const bItemId = b.contents[0].item.id;
            return aItemId - bItemId;
        });
        console.log(data.length);
        for (let outline of data) {
            console.log(outline);
            unitSequence += 1;
            let dayNumber = outline.dayNumber;
            let unitName = outline.unitName;
            let contents = outline.contents;
            let duration = outline.duration;
            populatedDayNumber(dayNumber);
            populatedUnitOfDayNumber(dayNumber, unitSequence, unitName, duration);
            for (let i of contents) {
                populatedContentOfUnit(unitSequence, i);
            }
        }
    }
}



function populatedDayNumber(dayNumber) {
    let checked = $(`.heading-outline[data-value=${dayNumber}]`).length;
    if (checked > 0) {
        return;
    }
    let $parent = $("#day-container");
    let $dayElement = `
        <div class="outline-container" data-value=${dayNumber}>
            <div class="heading-outline" data-show="true" data-value=${dayNumber}>
                <span class="day text-1">Day ${dayNumber}</span>
            </div>
            <div class="day-body" data-value=${dayNumber} style="padding-bottom: 0">
                <div class="row-unit" data-day="{sequence}"></div>
            </div>
        </div>`;
    $parent.append($dayElement);
}

function populatedUnitOfDayNumber(dayNumber, unitSequence, unitName, duration) {
    let $unitElement = `
        <div class="unit-content-container">
            <div class="col-left-outline">
                <span class="text-1" data-value=${unitSequence}>Unit ${unitSequence}</span>
            </div>
    
            <div class="col-right-outline">
                <div class="row-1" data-unit=${unitSequence} data-day=${dayNumber}>
                    <div style="display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between">
                            <input class="text-1 input-name" style="border: none;" placeholder="Type unit name" value=${unitName} disabled>
                        </div>
                        <span class="duration-hour" data-value=${duration}>${duration} hours</span>
                    </div>
                </div>
    
                <div class="row-content" data-value=${unitSequence}>
                    <div class="list-item" data-value="${unitSequence}"></div>
                </div>
            </div>
        </div>`
    let $parent = $(`.day-body[data-value=${dayNumber}]`);
    $parent.append($unitElement);
}

function populatedContentOfUnit(unitSequence, content) {
    let contentItem = content.item;
    let id = contentItem.id;
    let duration = contentItem.duration;
    let name = contentItem.content;
    let deliveryType = contentItem.deliveryType;
    let trainingFormat;
    if (contentItem.trainingFormat === true) {
        trainingFormat = "OFFLINE";
    } else {
        trainingFormat = "ONLINE";
    }
    let src = getSource(deliveryType);
    let $contentElement = `
        <div class="item" data-id=${id}>
            <span class="item-name text-1">${name}</span>
                <div style="display: flex; gap: 20px;">
                    <div class="objective-code" data-value=${id}>
                    
                    </div>
                    <div class="duration-minute">
                        <span>${duration}mins</span>
                    </div>
                    <div class="format">
                        <span class=${trainingFormat}>${trainingFormat}</span>
                    </div>
                    <div class="delivery">
                        <img src=${src}>
                    </div>
                </div>
        </div>`
    let $parent = $(`.list-item[data-value=${unitSequence}]`)
    $parent.append($contentElement);
    let objectives = content.objectiveCode;
    let $objectiveContainer = $(`.objective-code[data-value=${id}]`);
    for (let obj of objectives) {
        let objElement = `<span>${obj}</span>`;
        $objectiveContainer.append(objElement);
    }
}

function getSource(deliveryType) {
    if (deliveryType === "ASSIGNMENT") {
        return "../images/assignment.svg";
    }
    if (deliveryType === "CONCEPT") {
        return "../images/concept.svg";
    }
    if (deliveryType === "GUIDE") {
        return "../images/guide.svg";
    }
    if (deliveryType === "TEST") {
        return "../images/quiz.svg";
    }
    if (deliveryType === "EXAM") {
        return "../images/exam.svg";
    }
    return "../images/workshop.svg";
}
