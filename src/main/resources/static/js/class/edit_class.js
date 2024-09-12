import createToast from "../common/toast_message.js";
import * as Dialog from "../common/dialog.js";
let currentUser = 1
let listTraining = []
let p_id = ""
let class_code;
const location_infor_display = {
    "HCM": "Hồ Chí Minh",
    "DN": "Đà Nẵng",
    "HN": "Hà Nội"
}

const location_infor = {
    "Hồ Chí Minh" : "HCM",
    "Đà Nẵng" : "DN" ,
    "Hà Nội" : "HN"
}

$(document).ready(function() {
    findAllTraining();
    const urlParams = new URLSearchParams(window.location.search);
    class_code = urlParams.get('code');
    if (class_code) {
        $.ajax({
            url: `/api/class/detail?code=${class_code}`,
            method: 'GET',
            success: function(data) {
                p_id = `${data.trainingProgramDTO.id}`;
                populateHeader(data);
                populateGeneralInfo(data);
                populateTime(data);
                populateTimeFrame(data);
                populateTrainingProgram(data);
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
        let message = "Do you want to cancel this?"
        Dialog.createPopup(message).then((result) => {
            if (result === true) {
                window.location.href = `/class/detail?code=${class_code}`;
            }
        });
    });
    $("#search-input").on("input", handleSearch);
    $('#btn-next').on('click', function(event) {
        event.preventDefault();
        buttonSaveClick();
    });
    $('#FSU').change(function() {
        var selectedValue = $(this).val();
        $('#infor-location').text(location_infor_display[selectedValue]);
    });
});

function convertMillisTo24HourTime(millis) {
    const offsetHours = 7; // Múi giờ +7
    const date = new Date(millis);

    // Thêm múi giờ vào thời gian
    const localDate = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);

    // Lấy giờ và phút trong múi giờ địa phương
    const hours = String(localDate.getUTCHours()).padStart(2, '0');
    const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

function populateTime(data) {
    const startTime = convertMillisTo24HourTime(data.startTime);
    const endTime = convertMillisTo24HourTime(data.endTime);
    // Đổ dữ liệu vào input
    $('#from').val(startTime);
    $('#to').val(endTime);
}



function populateHeader(data) {
    // Đổ dữ liệu vào phần header
    let inforName = $(".infor-name span");
    inforName.text(data.classID);
    inforName.css("font-weight", 700);    $('#name').val(data.className);
    $('.infor-status').text(data.status);
    $('.value-day').text(data.duration + " days");
    $('.value-hour').text("... hours");
}

function populateGeneralInfo(data) {
    // Đổ dữ liệu vào phần thông tin chung
    $('#infor-location').text(location_infor_display[data.location]);
    $('#FSU').val(data.fsu);
    const createdDate = data.createdDate !== null ? new Date(data.createdDate) : null;
    const formattedCreatedDate = createdDate ?
        `${String(createdDate.getDate()).padStart(2, '0')}/${String(createdDate.getMonth() + 1).padStart(2, '0')}/${createdDate.getFullYear()}` : "N/A";
    $('#created-date').text(formattedCreatedDate);    $('#review-date').text(data.review !== null ? data.review : "N/A");
    $('#created-by').text(data.createdBy !== null ? data.createdBy.name : "N/A");
}

function formatDateToInput(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0, nên cần +1
    let day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function populateTimeFrame(data) {
    // Đổ dữ liệu vào phần time frame
    const startDate = formatDateToInput(new Date(data.startDate));
    $('#start-date').val(startDate);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function populateTrainingProgram(data) {
    if (data.trainingProgramDTO !== null) {
        $('#training-name').text(data.trainingProgramDTO.name);
        const modifiedDate = data.trainingProgramDTO.updatedDate
            ? formatDate(data.trainingProgramDTO.updatedDate)
            : formatDate(data.trainingProgramDTO.createdDate);

        const modifiedBy = data.trainingProgramDTO.updatedBy
            ? data.trainingProgramDTO.updatedBy.name
            : data.trainingProgramDTO.createdBy.name;

        $('#training-info').text(`${data.trainingProgramDTO.duration} days | Modified on ${modifiedDate} by ${modifiedBy}`);

        // Clear existing cards
        $('#training-cards').empty();

        // Loop through the list of training programs and create cards dynamically
        data.trainingProgramDTO.syllabuses.forEach(function (item) {
            const statusClass = item.syllabus.status === 'ACTIVE' ? 'status active' : item.status === 'INACTIVE' ? 'status inactive' : 'status draft';

            const modifiedDate = item.syllabus.updatedDate
                ? formatDate(item.syllabus.updatedDate)
                : formatDate(item.syllabus.createdDate);

            const modifiedBy = item.syllabus.updatedBy
                ? item.syllabus.updatedBy.name
                : item.syllabus.createdBy.name;

            const cardHtml = `
            <div class="training-card">
                <div class="card-content">
                    <div class="profile-images">
                        <img src="/images/image1.svg">
                    </div>
                    <div class="card-details">
                        <div style="display: flex; align-items: center; text-align: center;">
                            <h3>${item.syllabus.topicName}</h3>
                            <div class="${statusClass}">${item.syllabus.status}</div>
                        </div>
                        <p>${item.syllabus.version} | ${item.syllabus.duration} days (... hours) | Modified on <i>${modifiedDate}</i> by <strong>${modifiedBy}</strong></p>
                    </div>
                </div>
            </div>
        `;

            $('#training-cards').append(cardHtml);
        });
    }
}

function findAllTraining() {
    $.ajax({
        url: `/api/training_program/all`,
        method: 'GET',
        success: function(response) {
            if (!Array.isArray(response)) {
                displayNoData();
                return;
            }
            listTraining = response;
        },
        error: function (error) {
            console.error('Error fetching training program details:', error);
        }
    });
}

function handleSearch() {
    let val = $(this).val()

    let container = $('.result-container');
    container.empty();
    container.removeClass("hide");

    const filteredItems = listTraining.filter(item => {
        return item.name.toLowerCase().includes(val.toLowerCase());
    });
    if (filteredItems.length > 0) {
        container.removeClass("not-found");
        container.text("");
        for (const item of filteredItems) {
            let element = `
                <div 
                    data-id="${item.id}" 
                    data-item='${JSON.stringify(item)}' 
                    class="item-training">
                    ${item.name}
                </div>`;
            container.append(element);
        }
        $(".item-training").on("click", chooseTraining);
    } else {
        container.addClass("not-found");
        container.text("Not found");
    }
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

function chooseTraining(){
    let id = $(this).attr("data-id");
    let name = $(this).text();

    $("#training-name").text(name);
    $("#training-cards").empty();

    let itemData = $(this).data('item');
    p_id = id;
    const modifiedDate = itemData.updatedDate
        ? formatDate(itemData.updatedDate)
        : formatDate(itemData.createdDate);

    const modifiedBy = itemData.updatedBy
        ? itemData.updatedBy.name
        : itemData.createdBy.name;
    $('#training-info').text(`${itemData.duration} days | Modified on ${modifiedDate} by ${modifiedBy}`);
    $(".result-container").addClass("hide");
    showSyllabusesOfTraining(id).then((result) => {

        let syllabuses = result.syllabuses;
        let syllabusItemList = [];

        // Xử lý và sắp xếp syllabus
        for (let item of syllabuses) {
            let sequence = item.sequence;
            let s_name = item.name;
            let s_updatedBy = item.updatedBy;
            let s_updatedDate = item.updatedDate;
            let s_status = item.status;
            let s_version = item.version;
            let s_duration = item.duration;

            syllabusItemList.push({
                sequence: sequence,
                name: s_name,
                duration: s_duration,
                updatedBy: s_updatedBy,
                version: s_version,
                status: s_status,
                updatedDate: s_updatedDate
            });
        }

        syllabusItemList.sort((a, b) => a.sequence - b.sequence);

        // Hiển thị các syllabus dưới dạng thẻ
        for (let item of syllabusItemList) {
            // Chuẩn bị các biến cần thiết
            const statusClass = item.status === 'ACTIVE' ? 'status active' : item.status === 'INACTIVE' ? 'status inactive' : 'status draft';
            const modifiedDate = new Date(item.updatedDate).toLocaleDateString(); // Định dạng ngày cập nhật
            const modifiedBy = item.updatedBy; // Người cập nhật

            // Tạo nội dung HTML cho từng syllabus card
            const cardHtml = `
        <div class="training-card">
            <div class="card-content">
                <div class="profile-images">
                    <img src="/images/image1.svg">
                </div>
                <div class="card-details">
                    <div style="display: flex; align-items: center; text-align: center;">
                        <h3>${item.name}</h3>
                        <div class="${statusClass}">${item.status}</div>
                    </div>
                    <p>${item.version} | ${item.duration} days (... hours) | Modified on <i>${modifiedDate}</i> by <strong>${modifiedBy}</strong></p>
                </div>
            </div>
        </div>
    `;

            // Thêm thẻ HTML vừa tạo vào container có ID là "training-cards"
            $("#training-cards").append(cardHtml);
        }

    });

    // Làm mới kết quả tìm kiếm
    $("#search-input").val(''); // Xóa nội dung tìm kiếm
}

function getUpdateData() {
    // Lấy dữ liệu từ các trường nhập
    const className = $('#name').val();
    const startTime = timeToMillis($('#from').val());
    const endTime = timeToMillis($('#to').val());
    const location = location_infor[$('#infor-location').text()];
    const fsu = $('#FSU').val();
    const startDate = dateToMillis($('#start-date').val());


    // Tạo đối tượng dữ liệu để gửi
    const updateData = {
        updatedBy: currentUser,
        className: className,
        startTime: startTime,
        endTime: endTime,
        startDate: startDate,
        location: location,
        fsu: fsu,
        trainingProgramId: p_id
        // Thêm các thuộc tính khác nếu cần
    };

    return updateData;
}

function timeToMillis(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
}

function dateToMillis(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getTime();
}

function buttonSaveClick() {
    let message = "Do you want to save this?"
    Dialog.createPopup(message).then((result) => {
        if (result === true) {
            const updatedData = getUpdateData();
            saveClass(updatedData);
        }
    });
}

function saveClass(updateData) {
    if (!updateData.className) {
        createToast(false, "ERROR", "Class Name is required!");
        return;
    }

    if (!updateData.startTime) {
        createToast(false, "ERROR", "Start Time is required!");
        return;
    }

    if (!updateData.endTime) {
        createToast(false, "ERROR", "End Time is required!");
        return;
    }

    if (updateData.endTime <= updateData.startTime) {
        createToast(false, "ERROR", "End Time must be greater than Start Time!");
        return;
    }

    if (!updateData.startDate) {
        createToast(false, "ERROR", "Start Date is required!");
        return;
    }

    if (!updateData.fsu) {
        createToast(false, "ERROR", "FSU is required!");
        return;
    }

    if (!updateData.trainingProgramId) {
        createToast(false, "ERROR", "Training Program is required!");
        return;
    }

    $.ajax({
        url: `/api/class/edit?id=${class_code}`,  // Thay đổi URL tùy thuộc vào API của bạn
        method: 'POST',  // Hoặc 'POST' nếu bạn đang tạo mới dữ liệu
        contentType: 'application/json',
        data: JSON.stringify(updateData),
        success: function(response) {
            localStorage.setItem('showToast', 'true');
            localStorage.setItem('message', 'Content updated');
            window.location.href = `/class/detail?code=${class_code}`;
        },
        error: function(error) {
            // Xử lý lỗi
            localStorage.setItem('showToast', 'false');
            localStorage.setItem('message', 'Content not updated');
        }
    });
}