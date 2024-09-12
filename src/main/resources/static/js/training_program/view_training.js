import createToast from "../common/toast_message.js";
let currentUser = 1;
var currentOrder = 1;
$(document).ready(function () {
    $("#view-training").addClass("active");
    let current_link = $("#view-training a");
    let current_link_name = current_link.text();
    current_link.text("");

    current_link.append(`<b>${current_link_name}</b>`);
    //hanh dong click tuong tac voi nut page
    $("#previousPage").on("click", goToPreviousPage);
    $("#nextPage").on("click", goToNextPage);
    $("#lastPage").on("click", goToLastPage);
    $("#firstPage").on("click", goToFirstPage);
    fetchData();

    //click de an bang context
    $(document).click(function(event) {
        if (!$(event.target).closest('.more-options').length) {
            $('#contextMenu').hide();
        }
    });

    //dropdown item panigation page
    $('.dropdown-item').on('click', function() {
        const newValue = $(this).data('value');
        $('#currentSelection').text(newValue);
        rowsPerPage = parseInt(newValue);
        currentPage = 1;
        displayTable(currentPage);
    });

    $("#search-input").on("input", handleSearch);
    $("#btn-filter").on("click", function(event) {
        event.preventDefault();
        handleFilter();
    });

    $("#btn-import").on("click", function(event) {
        event.preventDefault();
        displayModalImport();
    });

    $("#btn-add-new").on('click', function (event) {
        window.location.href = '/training_program/add';
    })

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
});

let data = [];
let filteredData = [];
let rowsPerPage = 5;
let currentPage = 1;
let searchQueries = [];

// Fetch filtered data
function fetchData() {
    $.ajax({
        type: "GET",
        url: "/api/training_program/all",
        dataType: "json",
        success: function(response) {
            if (!Array.isArray(response)) {
                displayNoData();
                return;
            }

            data = response;
            filteredData = data;

            displayTable(currentPage);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', status, error);
            displayNoData();
        }
    });
}

// Data null
function displayNoData() {
    const tableContent = document.getElementById('tableContent');
    if (!tableContent) {
        console.error('Table content element not found');
        return;
    }
    tableContent.innerHTML = '';

    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.setAttribute('colspan', '7');
    td.style.textAlign = 'center';
    td.textContent = 'No data found';
    tr.appendChild(td);
    tableContent.appendChild(tr);
}

// Hiển thị bảng dữ liệu
function displayTable(page) {
    const tableContent = document.getElementById('tableContent');
    if (!tableContent) {
        console.error('Table content element not found');
        return;
    }
    tableContent.innerHTML = '';

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    if (paginatedData.length === 0) {
        displayNoData();
    } else {
        paginatedData.forEach(row => {
            let statusClass = '';
            let status = '';
            if (row.status === 'ACTIVE') {
                statusClass = 'active';
                status = "Active"
            } else if (row.status === 'INACTIVE') {
                statusClass = 'inactive';
                status = "Inactive"
            } else if (row.status === 'DRAFT') {
                statusClass = 'draft';
                status = "Draft"
            }

            const tr = document.createElement('tr');
            tr.setAttribute('data-id', row.id);
            tr.innerHTML = `
                <td>${row.id}</td>
                <td class="program-name" id="program-detail-${row.id}">${row.name}</td>
                <td>${row.createdDate ? new Date(row.createdDate).toLocaleDateString() : 'N/A'}</td>
                <td>${row.createdBy.name ? row.createdBy.name : 'N/A'}</td>
                <td>${row.duration ? row.duration : 0} days</td>
                <td><div class="status-badge ${statusClass}"><span>${status}</span></div></td>
                <td class="more-options">
                    <img class="icon-action" src="/images/more_horizontal1.svg" alt="More">
                </td>
            `;
            tableContent.appendChild(tr);
        });
    }

    $('.icon-action').on('click', function (event) {
        showContextMenu(event);
    })

    displayPageNumbers();
    bindDetailClickEvents();

}

function showContextMenu(event) {
    event.stopPropagation();
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;

    let left = event.pageX;
    let top = event.pageY;

    if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 10;
    }
    if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - 10;
    }

    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;

    const row = event.target.closest('tr');
    const status = row.querySelector('.status-badge').textContent.trim();
    const rowId = row.getAttribute('data-id');

    const toggleStatusLi = document.getElementById('toggleStatus');
    const deleteLi = contextMenu.querySelector('li:last-child');
    const editLi = contextMenu.querySelector("li:nth-child(2)")
    const duplicateLi = contextMenu.querySelector('li:nth-child(3)');

    if (status === 'Active') {
        toggleStatusLi.innerHTML = '<img src="/images/deactivate.svg"> De-activate program';
        toggleStatusLi.style.display = 'block';
        toggleStatusLi.onclick = () => changeStatus(rowId, 'INACTIVE');
        deleteLi.classList.remove('disabled');
    } else if (status === 'Draft') {
        toggleStatusLi.style.display = 'none';
        deleteLi.classList.remove('disabled');
    } else if (status === 'Inactive') {
        toggleStatusLi.innerHTML = '<img src="/images/active.svg"> Activate program';
        toggleStatusLi.style.display = 'block';
        toggleStatusLi.onclick = () => changeStatus(rowId, 'ACTIVE');
        deleteLi.classList.add('disabled');
    } else {
        deleteLi.classList.remove('disabled');
    }

    duplicateLi.replaceWith(duplicateLi.cloneNode(true));
    const newDuplicateLi = contextMenu.querySelector('li:nth-child(3)');

    newDuplicateLi.addEventListener('click', function duplicateHandler() {
        createDuplicateProgram(rowId);
    });

    deleteLi.addEventListener('click', function() {
        if (!deleteLi.classList.contains('disabled')) {
            showDeletePopup(rowId);
        }
    });

    editLi.addEventListener('click', function () {
        window.location.href = "/training_program/detail?id="+rowId;
    })
}

//thay đổi Status by id
function changeStatus(rowId, newStatus) {
    $.ajax({
        type: "POST",
        url: `http://localhost:1999/api/training_program/change_status/${rowId}`,
        contentType: "application/json",
        data: JSON.stringify({ status: newStatus }),
        success: function(response) {

            // notification popup
            createToast(true, 'Success', 'status updated');

            const updateStatus = (items) => {
                const item = items.find(item => item.id == rowId);
                if (item) {
                    item.status = newStatus;
                }
            };

            updateStatus(data);
            updateStatus(filteredData);

            displayTable(currentPage);
        },
        error: function(xhr, status, error) {

            // notification popup
            createToast(false,'Error', 'status not updated');

        }
    });
}

// Sao chép training program
function createDuplicateProgram(rowId) {
    $.ajax({
        type: "POST",
        url: `/api/training_program/create_duplicate/${rowId}`,
        success: function(response) {

            // notification popup
            createToast(true,'Success', 'content duplicated');

            const existingProgram = data.find(item => item.id === response.id);
            if (existingProgram) {
                console.warn("Duplicate ID already exists in the data array:", response.id);
                return;
            }

            data.push(response);

            if (searchQueries.length > 0) {
                filteredData = data.filter(row =>
                    searchQueries.some(query =>
                        (row.name ? row.name.toLowerCase() : '').includes(query.toLowerCase()) ||
                        (row.status ? row.status.toLowerCase() : '').startsWith(query.toLowerCase()) ||
                        (row.id ? row.id.toString() : '') === query.toLowerCase() ||
                        (row.duration ? row.duration.toString() : '') === query.toLowerCase() ||
                        (row.createdBy && row.createdBy.name ? row.createdBy.name.toLowerCase() : '').includes(query.toLowerCase()) ||
                        (row.createdDate ? new Date(row.createdDate).toLocaleDateString().toLowerCase() : 'n/a') === (query.toLowerCase())
                    )
                );
            } else {
                filteredData = [...data];
            }

            displayTable(currentPage);
        },
        error: function(xhr, status, error) {

            // notification popup
            createToast(false, 'Error', 'cannot duplicated');
        }
    });
}


function showDeletePopup(rowId) {
    const deleteConfirmPopup = document.getElementById('deleteConfirmPopup');
    deleteConfirmPopup.style.display = 'block';

    var closeBtn = deleteConfirmPopup.querySelector(".close");
    closeBtn.addEventListener("click", function() {
        deleteConfirmPopup.style.display = "none";
    });

    deleteConfirmPopup.setAttribute('data-id', rowId);
}

function hideDeletePopup() {
    const deleteConfirmPopup = document.getElementById('deleteConfirmPopup');
    deleteConfirmPopup.style.display = 'none';
}

function confirmDelete() {
    const deleteConfirmPopup = document.getElementById('deleteConfirmPopup');
    const rowId = deleteConfirmPopup.getAttribute('data-id');

    $.ajax({
        type: "DELETE",
        url: `http://localhost:1999/api/training_program/delete/${rowId}`,
        success: function(response) {
            fetchData();
            hideDeletePopup();

            // notification popup
            createToast(true, 'Success', 'content deleted');


        },
        error: function(respond) {

            // notification popup
            createToast(false, 'Error', 'cannot deleted');

            hideDeletePopup();
        }
    });
}

document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
document.getElementById('cancelDeleteBtn').addEventListener('click', hideDeletePopup);

document.addEventListener('click', function(event) {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu.style.display === 'block' && !contextMenu.contains(event.target)) {
        contextMenu.style.display = 'none';
    }
});

function displayPageNumbers() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    if (totalPages <= 1) {
        const span = document.createElement('span');
        span.innerText = 1;
        if (currentPage === 1) {
            span.classList.add('active');
        }
        span.onclick = () => {
            currentPage = 1;
            displayTable(1);
        };
        pageNumbers.appendChild(span);
        return;
    }

    const createPageSpan = (pageNum) => {
        const span = document.createElement('span');
        span.innerText = pageNum;
        if (pageNum === currentPage) {
            span.classList.add('active');
        }
        span.onclick = () => {
            currentPage = pageNum;
            displayTable(pageNum);
        };
        return span;
    };

    const firstPageButton = document.getElementById('firstPage');
    if (currentPage === 1) {
        firstPageButton.style.display = 'none';
    } else {
        firstPageButton.style.display = 'inline-block';
    }

    const lastPageButton = document.getElementById('lastPage');
    if (currentPage === totalPages) {
        lastPageButton.style.display = 'none';
    } else {
        lastPageButton.style.display = 'inline-block';
    }

    pageNumbers.appendChild(createPageSpan(1));

    if (currentPage > 3) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.classList.add('ellipsis');
        pageNumbers.appendChild(ellipsis);
    }

    let startPage = Math.max(currentPage - 1, 2);
    let endPage = Math.min(currentPage + 1, totalPages - 1);

    if (currentPage === 1) {
        endPage = Math.min(3, totalPages - 1);
    } else if (currentPage === totalPages) {
        startPage = Math.max(totalPages - 2, 2);
    } else {
        startPage = Math.max(currentPage - 1, 2);
        endPage = Math.min(currentPage + 1, totalPages - 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.appendChild(createPageSpan(i));
    }

    if (currentPage < totalPages - 2) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.classList.add('ellipsis');
        pageNumbers.appendChild(ellipsis);
    }

    pageNumbers.appendChild(createPageSpan(totalPages));

}

function goToFirstPage() {
    currentPage = 1;
    displayTable(currentPage);
}

function goToLastPage() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    currentPage = totalPages;
    displayTable(currentPage);
}

function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTable(currentPage);
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTable(currentPage);
    }
}

displayTable(currentPage);

// Xử lý auto-completed search
function handleSearch() {
    const query = $("#search-input").val().toLowerCase();
    filteredData = data.filter(row =>
        (row.name ? row.name.toLowerCase() : '').includes(query) ||
        (row.status ? row.status.toLowerCase() : '').startsWith(query) ||
        (row.id ? row.id.toString() : '') === query ||
        (row.duration ? row.duration.toString() : '') === query ||
        (row.createdBy ? row.createdBy.name.toLowerCase() : '').includes(query) ||
        (row.createdDate ? new Date(row.createdDate).toLocaleDateString().toLowerCase() : 'n/a') === (query)
    );
    currentPage = 1;
    displayTable(currentPage);
}

// Fetch filtered data
function fetchDataSearch() {
    const query = searchQueries.map(q => `query=${encodeURIComponent(q)}`).join('&').toLowerCase();
    $.ajax({
        type: "GET",
        url: `http://localhost:1999/api/training_program/search?${(query)}`,
        dataType: "json",
        success: function(response) {
            if (response.message && response.message === 'No training programs found.') {
                // Xử lý khi không tìm thấy chương trình đào tạo
                data = [];
                filteredData = [];
                displayTable(1);
                displaySearchLabels();
            } else {
                // Xử lý dữ liệu khi có kết quả tìm kiếm
                data = response;
                filteredData = response;
                displayTable(1);
                displaySearchLabels();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', status, error);
        }
    });
}

// Xử lý nhấn nút "Filter"
function handleFilter() {
    const query = $("#search-input").val();
    if (query && !searchQueries.includes(query)) {
        searchQueries.push(query);
        fetchDataSearch();
    }
    $("#search-input").val('');
}

// Hiển thị các nhãn tìm kiếm hiện tại
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
            if (searchQueries.length > 0) {
                fetchDataSearch(); // Cập nhật dữ liệu với các nhãn còn lại
            } else {
                fetchData(); // Gọi fetchData nếu không còn nhãn nào
            }
            displaySearchLabels(); // Cập nhật giao diện nhãn tìm kiếm
        };

        label.appendChild(removeLabel);
        searchLabelsContainer.appendChild(label);
    });
}

function displayModalImport() {
    var modal = document.getElementById("import-modal");
    modal.style.display = "block";

    var closeBtn = modal.querySelector(".close");
    closeBtn.addEventListener("click", function() {
        modal.style.display = "none";
    });

    document.getElementById("btn-cancel").addEventListener("click", function() {
        modal.style.display = "none";
    });


    document.getElementById("btn-select").addEventListener("click", function() {
        document.getElementById("file-input").click();
    });

    let file;

    document.getElementById("file-input").addEventListener("change", function(event) {
        file = event.target.files[0];
        var fileNameElement = document.getElementById("file-name");
        if (file) {
            var maxSize = 25 * 1024 * 1024;
            if (file.size > maxSize) {
                alert("The selected file is too large. Maximum size is 25 MB.");
                fileNameElement.style.display = "none";
                event.target.value = "";
            } else {
                fileNameElement.textContent = file.name;
                fileNameElement.style.display = "inline";
            }
        } else {
            fileNameElement.style.display = "none";
        }
    });

    $('input[name="scanning"]').on("change", function () {
        if ($(this).prop("checked")) {
            $(this).val(true);
        } else{
            $(this).val(false);
        }
    })

    document.getElementById("btn-import-modal").addEventListener("click", function(event) {
        event.preventDefault();
        addNewTrainingProgramByImportFile(file);
    });
}

function bindDetailClickEvents() {
    $(".program-name").on("click", function() {
        const programId = $(this).attr('id').split('-').pop(); // Extract the program ID
        window.location.href = `/training_program/detail?id=${programId}`;
    });
}

function addNewTrainingProgramByImportFile(current_file) {
    let formData = new FormData();
    formData.append('file', current_file);
    formData.append('id', $('#program-id').val());
    formData.append('name', $('#program-name').val());

    let date = new Date().getTime();
    formData.append('createdDate', date);

    let retVal = true;
    let handleType = $('input[name="duplicate-handle"]:checked').val();
    formData.append("handleType", handleType);
    if (handleType === "ALLOW") {
        retVal = confirm("Do you want to allow duplicate?");
    }

    if (retVal === true) {
        $.ajax({
            url: '/api/training_program/import?createdBy='+currentUser,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                localStorage.setItem('showToast', 'true');
                localStorage.setItem('message', 'Content added');
                window.location.reload();
            },
            error: function (error) {

                // notification popup
                createToast(false, 'Error', 'cannot add');

            }
        });
    }
}

function sortData(field, order) {
    $.ajax({
        url: `/api/training_program/sort?sortField=${field}&sortDirection=${order}`,
        method: 'GET',
        success: function(data) {
            filteredData = data;
            displayTable(currentPage);
        },
        error: function(error) {
            console.error('Error sorting data:', error);
        }
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

