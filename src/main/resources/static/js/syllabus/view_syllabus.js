
import createToast from "../common/toast_message.js";

let data = []
let searchQueries = [];
let startDateLong = null;
let endDateLong = null;
let filteredData = null;

$(document).ready(function () {
    $("#view-syllabus").addClass("active");
    let current_link = $("#view-syllabus a");
    let current_link_name = current_link.text();
    current_link.text("");
    current_link.append(`<b>${current_link_name}</b>`);

    fetchData();
    $("#search-input").on("input", handleSearch);
    $("#search-input").on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleFilter();
        }
    });

    $("#clearDateRange").on("click", function (event) {
        event.preventDefault();

        $("#dateRange").val('');
        $("#dateRange").datepicker("option", "dateFormat", '');

        startDateLong = null;
        endDateLong = null;

        fetchDataSearch();
    });
    $(".icon-sort").on("click", function (event) {
        event.preventDefault();
        const field = $(this).attr('id');
        const type = $(this).attr('data-sort-order');

        if (type === 'desc') {
            $(".icon-sort").attr('data-sort-order', 'desc');
            $(".icon-sort").attr('src', '/images/vector_desc.svg');
            $(this).attr('data-sort-order', 'asc');
            $(this).attr("src", "/images/vector_desc_active.svg");
            sortData(field, 'desc');
        } else if (type === 'asc') {
            $(this).attr('data-sort-order', 'none');
            $(this).attr("src", "/images/vector_asc.svg");
            sortData(field, 'asc');
        } else {
            $(this).attr('data-sort-order', 'desc');
            $(this).attr("src", "/images/vector_desc.svg");
            fetchData();
        }
    });

    $(document).on('click', '.more-options img', function (event) {
        const topicCode = $(this).closest('tr').find('td').eq(1).text().trim(); // Thay đổi chỗ này để lấy giá trị từ cột `topic_code`
        showContextMenu(event, topicCode);
    });

    $(document).click(function(event) {
        if (!$(event.target).closest('.more-options').length) {
            $('#contextMenu').hide();
        }
    });

    $("#btn-add-new").on("click", function () {
        window.location.href = "/syllabus/add";
    })
});

// Fetch syllabus data từ API
function fetchData() {
    $.ajax({
        type: "GET",
        url: "http://localhost:1999/api/syllabus/all",  // Đảm bảo URL đúng
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

// Hiển thị dữ liệu vào bảng
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
            let statusClass = '';
            let status = '';
            if (row.status === 'ACTIVE') {
                statusClass = 'active';
                status = "Active";
            } else if (row.status === 'INACTIVE') {
                statusClass = 'inactive';
                status = "Inactive";
            } else if (row.status === 'DRAFT') {
                statusClass = 'draft';
                status = "Draft";
            }

            const tr = `
                <tr>
                    <td class="program-name">${row.topicName}</td>
                    <td class="topic-code">${row.topicCode}</td>
                    <td>${row.createdDate ? new Date(row.createdDate).toLocaleDateString() : 'N/A'}</td>
                    <td>${row.createdBy ? row.createdBy.name : 'N/A'}</td>
                    <td>${row.duration ? row.duration : 0} days</td>
                    <td><div class="output-standard" data-topic-code="${row.topicCode}">Loading...</div></td>
                    <td><div class="status-badge ${statusClass}"><span>${status}</span></div></td>
                    <td class="more-options">
                        <img src="/images/more_horizontal1.svg" alt="More">
                    </td>
                </tr>
            `;
            tableContent.append(tr);

            getOutput(row.topicCode).then((outputs) => {
                const outputDiv = $(`div.output-standard[data-topic-code="${row.topicCode}"]`);
                outputDiv.addClass('output-standard');  // Explicitly ensure the class is added
                outputDiv.empty();

                if (outputs && outputs.length > 0) {
                    // Iterate over each output and create a div for it
                    outputs.forEach(output => {
                        const outputItem = $('<div></div>').text(output);
                        outputDiv.append(outputItem);
                    });
                } else {
                    outputDiv.text("No outputs");
                }
            }).catch((error) => {
                const outputDiv = $(`div.output-standard[data-topic-code="${row.topicCode}"]`);
                outputDiv.text("");
            });

        });
    }

    const totalPages = Math.ceil(data.length / rowsPerPage);
    displayPageNumbers(data, totalPages, displayTable);
    bindDetailClickEvents();
}

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

function displayNoData() {
    const tableContent = $('#tableContent');
    tableContent.empty();
    const tr = $('<tr></tr>');
    const td = $('<td></td>').attr('colspan', '7').css('text-align', 'center').text('No data found');
    tr.append(td);
    tableContent.append(tr);
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

function showContextMenu(event, topicCode) {
    event.stopPropagation();
    const contextMenu = $('#contextMenu'); // Đảm bảo bạn đang chọn contextMenu bằng jQuery

    // Hiển thị menu ngữ cảnh
    contextMenu.show();

    // Tính toán vị trí hiển thị của menu
    let left = event.pageX;
    let top = event.pageY;

    const menuWidth = contextMenu.outerWidth();
    const menuHeight = contextMenu.outerHeight();

    if (left + menuWidth > $(window).width()) {
        left = $(window).width() - menuWidth - 10;
    }
    if (top + menuHeight > $(window).height()) {
        top = $(window).height() - menuHeight - 10;
    }

    contextMenu.css({ left: `${left}px`, top: `${top}px` });

    const currentStatus = $(event.target).closest('tr').find('.status-badge').text().trim();

    const toggleStatusLi = contextMenu.find('li').eq(2); // Lấy mục De-activate syllabus
    const duplicateLi = contextMenu.find('li').eq(1); // Lấy mục Duplicate syllabus
    const deleteLi = contextMenu.find('li').eq(3); // Lấy mục Delete syllabus
    const editLi = contextMenu.find('li').eq(0); // Lấy mục Edit syllabus

    if (currentStatus === 'Active') {
        toggleStatusLi.html('<img src="/images/deactivate.svg"> De-activate syllabus');
        toggleStatusLi.show();
        toggleStatusLi.off('click').on('click', function() {
            changeStatus(topicCode, 'INACTIVE');
            contextMenu.hide();
        });
        deleteLi.removeClass('disabled');
    } else if (currentStatus === 'Draft') {
        toggleStatusLi.html('<img src="/images/active.svg"> Activate syllabus');
        toggleStatusLi.show();
        toggleStatusLi.off('click').on('click', function() {
            changeStatus(topicCode, 'ACTIVE');
            contextMenu.hide();
        });
        deleteLi.removeClass('disabled');
    } else if (currentStatus === 'Inactive') {
        toggleStatusLi.html('<img src="/images/active.svg"> Activate syllabus');
        toggleStatusLi.show();
        toggleStatusLi.off('click').on('click', function() {
            changeStatus(topicCode, 'ACTIVE');
            contextMenu.hide();
        });
        deleteLi.addClass('disabled');
    } else {
        deleteLi.removeClass('disabled');
    }

    duplicateLi.off('click').on('click', function() {
        createDuplicateSyllabus(topicCode);
        contextMenu.hide();
    });

    deleteLi.off('click').on('click', function() {
        showDeletePopup(topicCode);
        contextMenu.hide();
    });

    editLi.off('click').on('click', function() {
        window.location.href = `/syllabus/edit/${topicCode}`;
        contextMenu.hide();
    });
}

function changeStatus(topicCode, newStatus) {
    $.ajax({
        type: "POST",
        url: `http://localhost:1999/api/syllabus/change_status/${topicCode}`,
        contentType: "application/json",
        data: JSON.stringify({ status: newStatus }),
        success: function(response) {
            createToast(true, 'Success', 'Status updated');

            // Thay đổi trạng thái của hàng trực tiếp trên giao diện thay vì tải lại toàn bộ dữ liệu
            const row = $(`#tableContent tr:contains(${topicCode})`);
            const statusBadge = row.find('.status-badge');
            statusBadge.removeClass('active inactive draft'); // Xóa các class cũ
            statusBadge.addClass(newStatus.toLowerCase()); // Thêm class mới tương ứng
            statusBadge.text(newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase()); // Cập nhật văn bản trạng thái
        },
        error: function(xhr, status, error) {
            createToast(false, 'Error', 'Status not updated');
        }
    });
}

function createDuplicateSyllabus(topicCode) {
    $.ajax({
        type: "POST",
        url: `http://localhost:1999/api/syllabus/create_duplicate/${topicCode}`,
        success: function(response) {
            createToast(true, 'Success', 'Syllabus duplicated');
            fetchData(); // Reload data after duplication
        },
        error: function(xhr, status, error) {
            createToast(false, 'Error', 'Cannot duplicate');
        }
    });
}

function showDeletePopup(topicCode) {
    const deleteConfirmPopup = $('#deleteConfirmPopup');
    deleteConfirmPopup.show();
    deleteConfirmPopup.attr('data-id', topicCode);

    $('#confirmDeleteBtn').off('click').on('click', function() {
        confirmDelete(topicCode);
    });

    $('#cancelDeleteBtn').off('click').on('click', function() {
        deleteConfirmPopup.hide();
    });
}

function confirmDelete(topicCode) {
    $.ajax({
        type: "DELETE",
        url: `http://localhost:1999/api/syllabus/delete/${topicCode}`,
        success: function(response) {
            createToast(true, 'Success', 'Syllabus deleted.');
            $('#deleteConfirmPopup').hide();
            fetchData(); // Reload data after deletion
        },
        error: function(xhr, status, error) {
            createToast(false, 'Error', 'Cannot delete');
        }
    });
}

function handleSearch() {
    const query = $("#search-input").val().toLowerCase();

    filteredData = data.filter(row =>
        (row.topicCode ? row.topicCode.toLowerCase() : '').includes(query) ||
        (row.topicName ? row.topicName.toLowerCase() : '').includes(query) ||
        (row.createdBy && row.createdBy.name ? row.createdBy.name.toLowerCase().includes(query) : false)
    );

    currentPage = 1;
    displayTable(currentPage, filteredData);
}

function handleFilter() {
    const query = $("#search-input").val();
    if (query && !searchQueries.includes(query)) {
        searchQueries.push(query);
        fetchDataSearch();
    }
    $("#search-input").val('');
}

function fetchDataSearch() {
    const query = searchQueries.map(q => `query=${encodeURIComponent(q)}`).join('&').toLowerCase();
    let url = `/api/syllabus/search?${query}`;

    // Thêm các tham số ngày vào URL nếu có
    if (startDateLong !== null && endDateLong !== null) {
        url += `&startDate=${startDateLong}&endDate=${endDateLong}`;
    }
    console.log(url);
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (!Array.isArray(response)) {
                data = [];
                filteredData = [];
                displaySearchLabels();
                setupPagination(data, displayTable);
            } else {
                data = response;
                filteredData = data;
                setupPagination(data, displayTable);
                displaySearchLabels();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', status, error);
        }
    });
}

function displaySearchLabels() {
    const searchLabelsContainer = document.getElementById('search-labels');
    searchLabelsContainer.innerHTML = ''; // Xóa các nhãn hiện tại

    searchQueries.forEach((query, index) => {
        const label = document.createElement('span');
        label.className = 'search-label';
        label.innerText = query;

        const removeLabel = document.createElement('span');
        removeLabel.className = 'remove-label';
        removeLabel.innerText = ' x';
        removeLabel.onclick = () => {
            searchQueries = searchQueries.filter((_, i) => i !== index);
            fetchDataSearch();
            displaySearchLabels();
        };

        label.appendChild(removeLabel);
        searchLabelsContainer.appendChild(label);
    });
}

flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "d-m-Y",
    onChange: function(selectedDates, dateStr, instance) {
        const [startDate, endDate] = selectedDates;
        if (startDate && endDate) {
            startDateLong = startDate.getTime();
            endDateLong = endDate.getTime();

            fetchDataSearch();
        }
    }
});

function bindDetailClickEvents() {
    $(".program-name").on("click", function() {
        const topicCode = $(this).closest('tr').find('.topic-code').text().trim();
        window.location.href = `/syllabus/detail?code=${topicCode}`;
    });
}

function sortData(field, order) {
    $.ajax({
        url: `/api/syllabus/sort?sortField=${field}&sortDirection=${order}`,
        method: 'GET',
        success: function(data) {
            filteredData = data;
            currentPage = 1
            displayTable(currentPage, data);
        },
        error: function(error) {
            console.error('Error sorting data:', error);
        }
    });
}