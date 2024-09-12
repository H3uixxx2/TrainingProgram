import createToast from "../common/toast_message.js";

let data = []
let filteredData = []
let searchQueries = [];
let searchFilter = {
    locationSearch: [],
    fromDate: null,
    toDate: null,
    status: []
};

$(document).ready(function () {
    $("#view-class").addClass("active");
    let current_link = $("#view-class a");
    let current_link_name = current_link.text();
    current_link.text("");
    current_link.append(`<b>${current_link_name}</b>`);

    fetchData();
    $("#search-input-1").on("input", handleSearch);
    $("#search-input-1").on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleFilter();
        }
    });
    $("#btn-filter").on("click", function(event) {
        event.preventDefault();
        createPopupFilter();
    });

    $(document).on('click', '.more-options img', function (event) {
        const classID = $(this).closest('tr').find('td:nth-child(2)').text().trim();
        const status = $(this).closest('tr').find('.status-badge').text().trim();
        showContextMenu(event, classID, status);
    });

    $(document).click(function(event) {
        if (!$(event.target).closest('.more-options').length) {
            $('#contextMenu').hide();
        }
    });

    $("#btn-add-new-class").on("click", function () {
        window.location.href = "/class/add";
    })
});

// Fetch class data từ API
function fetchData() {
    $.ajax({
        type: "GET",
        url: "http://localhost:1999/api/class/all",  // Đảm bảo URL đúng
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

            // When assigning the status text, check for 'Inactive' and change it to 'Deactivate'
            if (row.status) {
                statusClass = row.status.toLowerCase();
                statusText = row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase();
                if (statusText === "Inactive") {
                    statusText = "Deactivate";
                }
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

function showContextMenu(event, classID, status) {
    event.stopPropagation();
    const contextMenu = $('#contextMenu');

    // Hide context menu if it's already shown
    if (contextMenu.is(':visible')) {
        contextMenu.hide();
    }

    // Recalculate position of context menu
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

    // Clear existing listeners
    contextMenu.off('click', '#toggleStatus');
    contextMenu.off('click', '#deleteClass');

    // Update context menu based on status
    const toggleStatusLi = contextMenu.find('#toggleStatus');
    const deleteLi = contextMenu.find('#deleteClass');

    if (status === 'Completed') {
        toggleStatusLi.hide();
        deleteLi.addClass('disabled');
    } else if (status === 'Draft') {
        toggleStatusLi.html('<img src="/images/active.svg"> Activate Class');
        toggleStatusLi.show().on('click', function() {
            showStatusChangePopup(classID, 'PLANNING');
            contextMenu.hide();
        });
        deleteLi.removeClass('disabled');
    } else if (status === 'Planning' || status === 'Schedule') {
        toggleStatusLi.html('<img src="/images/deactivate.svg"> De-activate Class');
        toggleStatusLi.show().on('click', function() {
            showStatusChangePopup(classID, 'INACTIVE');
            contextMenu.hide();
        });
        deleteLi.removeClass('disabled');
    } else {
        toggleStatusLi.hide();
        deleteLi.removeClass('disabled');
    }

    deleteLi.on('click', function() {
        showDeletePopup(classID);
        contextMenu.hide();
    });

    // Show the context menu
    contextMenu.show();
}

// Show the status change confirmation popup
function showStatusChangePopup(classID, newStatus) {
    const statusChangePopup = $('#statusChangeConfirmPopup');
    statusChangePopup.hide();  // Đảm bảo popup ẩn khi trang tải

    const className = $(`tr:has(td.class-id:contains(${classID})) .program-name`).text().trim();

    $('#classNamePlaceholder').text(className);

    statusChangePopup.attr('data-id', classID);
    statusChangePopup.attr('data-new-status', newStatus);

    $('#confirmStatusChangeBtn').off('click').on('click', function() {
        confirmStatusChange(classID, newStatus);
    });

    $('#cancelStatusChangeBtn').off('click').on('click', function() {
        statusChangePopup.hide();
    });

    statusChangePopup.show();  // Hiển thị popup khi cần thiết
}

// Function to confirm status change
function confirmStatusChange(classID, newStatus) {
    $.ajax({
        type: "POST",
        url: `http://localhost:1999/api/class/change_status/${classID}`,
        contentType: "application/json",
        data: JSON.stringify({ status: newStatus }),
        success: function(response) {
            createToast(true, 'Success', 'Class status updated successfully.');
            fetchData();  // Refresh the data after status change
            $('#statusChangeConfirmPopup').hide();  // Close the status change confirmation popup
        },
        error: function(xhr, status, error) {
            createToast(false, 'Error', 'Failed to update class status.');
            $('#statusChangeConfirmPopup').hide();  // Close the status change confirmation popup
        }
    });
}

// Show the delete confirmation popup
function showDeletePopup(classID) {
    const deleteConfirmPopup = $('#deleteConfirmPopup');
    deleteConfirmPopup.hide();  // Đảm bảo popup ẩn khi trang tải
    deleteConfirmPopup.attr('data-id', classID);

    $('#confirmDeleteBtn').off('click').on('click', function() {
        confirmDelete(classID);
    });

    $('#cancelDeleteBtn').off('click').on('click', function() {
        deleteConfirmPopup.hide();
    });

    deleteConfirmPopup.show();  // Hiển thị popup khi cần thiết
}

// Function to confirm deletion
function confirmDelete(classID) {
    $.ajax({
        type: "DELETE",
        url: `http://localhost:1999/api/class/delete/${classID}`,
        success: function(response) {
            createToast(true, 'Success', 'Class deleted successfully.');
            fetchData();  // Refresh the data after deletion
            $('#deleteConfirmPopup').hide();  // Close the delete confirmation popup
        },
        error: function(xhr, status, error) {
            createToast(false, 'Error', 'Failed to delete class.');
            $('#deleteConfirmPopup').hide();  // Close the delete confirmation popup
        }
    });
}

function handleSearch() {
    const query = $("#search-input-1").val().toLowerCase();
    filteredData = data.filter(row =>
        (row.classID ? row.classID.toLowerCase() : '').includes(query) ||
        (row.className ? row.className.toLowerCase() : '').includes(query) ||
        (row.createdBy && row.createdBy.name ? row.createdBy.name.toLowerCase().includes(query) : false) ||
        (row.status ? row.status.toLowerCase() : '').startsWith(query)
    );

    currentPage = 1;
    displayTable(currentPage, filteredData);
}

function handleFilter() {
    const query = $("#search-input-1").val();
    if (query && !searchQueries.includes(query)) {
        searchQueries.push(query);
        fetchDataSearch();
    }
    $("#search-input-1").val('');
}

function fetchDataSearch() {
    const query = searchQueries.map(q => `query=${encodeURIComponent(q)}`).join('&').toLowerCase();
    let url = `/api/class/search?${query}`;

    const formattedFromDate = searchFilter.fromDate ? new Date(searchFilter.fromDate).getTime() : null;
    const formattedToDate = searchFilter.toDate ? new Date(searchFilter.toDate).getTime() : null;

    if (searchFilter.locationSearch.length > 0) {
        searchFilter.locationSearch.forEach(loca => {
            url += `&location=${encodeURIComponent(loca)}`;
        });
    }
    if (formattedFromDate) {
        url += `&fromDate=${formattedFromDate}`;
    }
    if (formattedToDate) {
        url += `&toDate=${formattedToDate}`;
    }
    if (searchFilter.status.length > 0) {
        searchFilter.status.forEach(stat => {
            url += `&status=${encodeURIComponent(stat)}`;
        });
    }

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

function createPopupFilter() {
    let popup = `
                <div class="popup-filter">
                   <div class="popup-content-filter">
                      <div class="popup-header-filter">
                        <span class="popup-title-filter">Filter Options</span>
                        <button class="popup-close-filter">&times;</button>
                      </div>
                      <div class="popup-body-filter">
                        <div class="filter-location-date">
                            <div class="filter-section">
                              <label for="location" class="title-content">Location</label>
                              <div id="location-input" style="display: flex; margin-top: 10px;">
                                <div class="checkbox-group">
                                  <input type="checkbox" id="HCM" /> 
                                  <label for="HCM" style="margin: 0 20px 0 0;">HCM</label>
                                </div>
                                <div class="checkbox-group">
                                  <input type="checkbox" id="HN" /> 
                                  <label for="HN" style="margin: 0 20px 0 0;">HN</label>
                                </div>
                                <div class="checkbox-group">
                                  <input type="checkbox" id="DN" /> 
                                  <label for="DN" style="margin: 0 20px 0 0;">DN</label>
                                </div>
                              </div>
                            </div>
                            <div class="filter-section">
                              <label for="class-time-frame" class="title-content">Class time frame</label>
                              <div id="class-time-frame" style="display: flex; align-items: center; gap: 10px;height: 36px;">
                                <label for="from-date">from</label>
                                <input type="date" id="from-date" placeholder="From" />
                                
                                <label for="to-date">To</label>
                                <input type="date" id="to-date" placeholder="To" />
                              </div>
                            </div>
                        </div>
                        <div class="filter-time-status" style="margin-top: 20px;">
                            <div class="filter-section">
                                <label for="status" class="title-content">Status</label>
                                <div id="status" style="display: flex;">
                                    <div class="status-first">
                                        <div class="checkbox-group">
                                            <input type="checkbox" id="PENDING" /> 
                                            <label for="PENDING" style="margin: 0 20px 0 0;">PENDING</label>
                                        </div>
                                        <div class="checkbox-group">
                                            <input type="checkbox" id="PLANNING" /> 
                                            <label for="PLANNING" style="margin: 0 20px 0 0;">PLANNING</label>
                                        </div>
                                        <div class="checkbox-group">
                                            <input type="checkbox" id="ACTIVE" /> 
                                            <label for="ACTIVE" style="margin: 0 20px 0 0;">ACTIVE</label>
                                        </div>
                                        <div class="checkbox-group">
                                            <input type="checkbox" id="COMPLETED" /> 
                                            <label for="COMPLETED" style="margin: 0 20px 0 0;">COMPLETED</label>
                                        </div>
                                    </div>
                                    <div class="status-second">
                                        <div class="checkbox-group">
                                            <input type="checkbox" id="DRAFT" /> 
                                            <label for="DRAFT" style="margin: 0 20px 0 0;">DRAFT</label>
                                        </div>
                                        <div class="checkbox-group">
                                            <input type="checkbox" id="SCHEDULE" /> 
                                            <label for="SCHEDULE" style="margin: 0 20px 0 0;">SCHEDULE</label>
                                        </div>
                                        <div class="checkbox-group">
                                            <input type="checkbox" id="INACTIVE" /> 
                                            <label for="INACTIVE" style="margin: 0 20px 0 0;">INACTIVE</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>
                      <div class="popup-footer-filter">
                        <button class="btn-clear">Clear</button>
                        <button class="btn-search">Search</button>
                      </div>
                  </div>
                </div>`
    $(".right-container"). append(popup);
    populatePopup();
    $(".popup-close-filter").click(function() {
        $(".popup-filter").remove();
    });
    $(".btn-clear").click(function() {
        $("#location-input input[type='checkbox']").prop('checked', false);
        $("#from-date").val('');
        $("#to-date").val('');
        $("#status input[type='checkbox']").prop('checked', false);
        searchFilter = {
            locationSearch: [],
            fromDate: null,
            toDate: null,
            status: []
        };
        populatePopup();
    });

    $(".btn-search").click(function() {
        updateSearchFilter();
        fetchDataSearch();
        $(".popup-filter").remove();
    });
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

function updateSearchFilter() {
    // Cập nhật locationSearch
    searchFilter.locationSearch = Array.from(document.querySelectorAll('#location-input input:checked'))
        .map(checkbox => checkbox.id);

    // Cập nhật từ ngày và đến ngày
    searchFilter.fromDate = document.getElementById('from-date').value || null;
    searchFilter.toDate = document.getElementById('to-date').value || null;

    // Cập nhật status
    searchFilter.status = Array.from(document.querySelectorAll('#status input:checked'))
        .map(checkbox => checkbox.id);
}

function populatePopup() {
    // Điền locationSearch
    searchFilter.locationSearch.forEach(location => {
        const checkbox = document.getElementById(location);
        if (checkbox) checkbox.checked = true;
    });

    // Điền từ ngày và đến ngày
    document.getElementById('from-date').value = searchFilter.fromDate || '';
    document.getElementById('to-date').value = searchFilter.toDate || '';

    // Điền status
    searchFilter.status.forEach(status => {
        const checkbox = document.getElementById(status);
        if (checkbox) checkbox.checked = true;
    });
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

function bindDetailClickEvents() {
    $(".program-name").on("click", function() {
        const classID = $(this).closest('tr').find('.class-id').text().trim();
        window.location.href = `/class/detail?code=${classID}`;
    });
}