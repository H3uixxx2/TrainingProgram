import createToast from "../common/toast_message.js"
import * as Dialog from "../common/dialog.js";
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const class_code = urlParams.get('code');
    if (class_code) {
        $.ajax({
            url: `/api/class/detail?code=${class_code}`,
            method: 'GET',
            success: function(data) {
                showInforClass(data);
                showCalendar(data);
            },
            error: function (error) {
                console.error('Error fetching training program details:', error);
            }
        });
    }
    $('.icon-show-general').click(function() {
        const $section = $(this).closest('.general-container').find('.section.border-opacity');
        if ($section.is(':visible')) {
            $section.hide();
        } else {
            $section.show();
        }
    });

    $('.icon-show-time-frame').click(function() {
        const $section = $(this).closest('.time-frame-container').find('.section.border-opacity');
        if ($section.is(':visible')) {
            $section.hide(); // Ẩn phần tử
        } else {
            $section.show(); // Hiển thị phần tử
        }
    });

    let menuActive = false;
    $("#icon-horizontal").on("click", function (event) {
        Dialog.createFormPopupStatusClass("Edit status", "Status: ").then((result) => {
            if (result !== false) {
                editStatus(result);
                const newStatus = result;
                showButtonPane(newStatus, class_code);
            }
        });
    })

});

function editStatus(result) {
    if (result !== null) {
        $(".infor-status").text(result);
    }
}

function showInforClass(data) {
    $('.edit-button').on('click', function(event) {
        event.preventDefault();
        if (data.status === 'PLANNING' || data.status === 'SCHEDULE') {
            window.location.href = `/class/edit?code=${data.classID}`;

        } else {
            createToast(false, "ERROR", "Class not in status PLANNING OR SCHEDULE");
            return;
        }
    });

    $('.infor-name b').text(data.className);
    $('.infor-status').text(data.status);
    $('#infor-code').text(data.classID);
    if (data.duration !== null) {
        const days = data.duration;
        const hours = "...";
        $('#value-day').text(`${days}`);
        $('#value-hour').text(`${hours}`);
    } else {
        $('#value-day').text("0");
        $('#value-hour').text("...");
    }

    const createdDate = data.createdDate !== null ? new Date(data.createdDate) : null;
    const formattedCreatedDate = createdDate ?
        `${String(createdDate.getDate()).padStart(2, '0')}/${String(createdDate.getMonth() + 1).padStart(2, '0')}/${createdDate.getFullYear()}` : "N/A";
    $('#created-date').text(formattedCreatedDate);    $('#review-date').text(data.review !== null ? data.review : "N/A");
    $('#approve-date').text(data.approve !== null ? data.approve : "N/A");

    $('#created-by').text(data.createdBy !== null ? data.createdBy.name : "N/A");
    $('#review-by').text(data.review !== null ? data.review : "N/A");
    $('#approve-by').text(data.approve !== null ? data.approve : "N/A");

    const startDate = data.startDate !== null ? new Date(data.startDate) : null;
    const formattedStartDate = startDate ?
        `${String(startDate.getDate()).padStart(2, '0')}-${startDate.toLocaleString('en-US', { month: 'short' })}-${String(startDate.getFullYear()).slice(-2)}` : "N/A";

    const endDate = data.endDate !== null ? new Date(data.endDate) : null;
    const formattedEndDate = endDate ?
        `${String(endDate.getDate()).padStart(2, '0')}-${endDate.toLocaleString('en-US', { month: 'short' })}-${String(endDate.getFullYear()).slice(-2)}` : "--/--/--";

    // Update the time frame display
    $('#time-frame-dates').text(`${formattedStartDate}  to  ${formattedEndDate}`);

    const offset = 7; // Your timezone offset in hours
    const startTimeMillis = data.startTime; // Milliseconds from UTC
    const endTimeMillis = data.endTime; // Milliseconds from UTC

    const startTime = startTimeMillis !== null ? convertMillisToLocalTime(startTimeMillis, offset) : "N/A";
    const endTime = endTimeMillis !== null ? convertMillisToLocalTime(endTimeMillis, offset) : "N/A";

    $('#time-range').text(`${startTime} - ${endTime}`);

    const location_infor_display = {
        "HCM": "Hồ Chí Minh",
        "DN": "Đà Nẵng",
        "HN": "Hà Nội"
    }
    const location_infor = data.location;
    $('.form-group .second #infor-location').text(location_infor_display[location_infor] || "N/A");

    const cityName = {
        "HCM": "Ftown - Hồ Chí Minh",
        "DN": "FPT Complex - Đà Nẵng",
        "HN": "Fville - Hà Nội"
    };


    const cityValue = data.fsu;
    $('.form-group .second #infor-fsu').text(cityName[cityValue] || "N/A");

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

function convertMillisToLocalTime(millis, offsetHours) {
    const date = new Date(millis);

    const localDate = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);

    const hours = String(localDate.getUTCHours()).padStart(2, '0');
    const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function showCalendar(data) {
    const monthElements = document.querySelectorAll('.month');
    const yearElements = document.querySelectorAll('.year');
    const datesContainers = [document.getElementById('calendar1'), document.getElementById('calendar2')];
    const prevMonthButton = document.querySelector('.prev-month');
    const nextMonthButton = document.querySelector('.next-month');


    const startDate = new Date(data.startDate);

    if (isNaN(startDate.getTime()) || startDate.getTime() === 0) {
        startDate.setTime(Date.now());
    }

    let startMonth = startDate.getMonth();
    let startYear = startDate.getFullYear();

    let currentMonth = startMonth;
    let currentYear = startYear;

    prevMonthButton.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(monthElements, yearElements, datesContainers, currentMonth, currentYear);
    });

    nextMonthButton.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(monthElements, yearElements, datesContainers, currentMonth, currentYear);
    });

    renderCalendar(monthElements, yearElements, datesContainers, currentMonth, currentYear);
}

function renderCalendar(monthElements, yearElements, datesContainers, currentMonth, currentYear) {
    for (let i = 0; i < 2; i++) {
        const month = currentMonth + i;
        const year = currentYear;

        monthElements[i].textContent = new Date(year, month).toLocaleString('en-US', { month: 'long' });
        yearElements[i].textContent = year;

        datesContainers[i].innerHTML = ''; // Xóa các ngày cũ

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

        // Thêm các ô trống cho các ngày trước ngày 1 của tháng
        for (let j = 0; j < firstDayOfMonth; j++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('date');
            datesContainers[i].appendChild(emptyDiv);
        }

        // Tạo các ngày trong tháng
        for (let date = 1; date <= lastDateOfMonth; date++) {
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('date');
            dateDiv.textContent = date;
            dateDiv.addEventListener('click', function() {
                document.querySelectorAll('.date.selected').forEach(el => el.classList.remove('selected'));
                dateDiv.classList.add('selected');
            });
            datesContainers[i].appendChild(dateDiv);
        }
    }
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

function showButtonPane(newStatus, class_code) {
    $(".edit-button").addClass("hide");

    $(".btn-pane").removeClass("hide");

    $("#btn-cancel").on("click", function (event) {
        buttonCancelClick(event);
    });

    $("#btn-save").on("click", function (event) {
        buttonSaveClick(event, newStatus, class_code);
    })
}

function buttonCancelClick() {
    Dialog.createPopup("Do you want to cancel editing?").then((result) => {
        if (result) {
            window.location.reload();
        }
    })
}

function buttonSaveClick(event, newStatus, class_code) {
    event.preventDefault();
    Dialog.createPopup("Do you want to save this?").then((result) => {
        if (result) {
            let jsonData = {
                status : newStatus
            };
            $.ajax({
                url: `/api/class/change-status?id=${class_code}`,
                type: "POST",
                data: JSON.stringify(jsonData),
                contentType: "application/json",
                success: function (response){

                    localStorage.setItem('showToast', 'true');
                    localStorage.setItem('message', 'Content updated');
                    window.location.href = `/class/detail?code=${class_code}`;
                },
                error: function (response) {
                    localStorage.setItem('showToast', 'false');
                    localStorage.setItem('message', 'Content not updated');
                }
            });
        }
    })
}