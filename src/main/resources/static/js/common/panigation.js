let currentPage = 1;
let rowsPerPage = 10;

function setupPagination(data, displayTableCallback) {
    $('.dropdown-item').on('click', function() {
        rowsPerPage = parseInt($(this).data('value'));
        $('#currentSelection').text(rowsPerPage);
        currentPage = 1;
        displayTableCallback(currentPage, data);
    });

    $("#previousPage").on("click", function() { goToPreviousPage(displayTableCallback, data); });
    $("#nextPage").on("click", function() { goToNextPage(displayTableCallback, data); });
    $("#lastPage").on("click", function() { goToLastPage(displayTableCallback, data); });
    $("#firstPage").on("click", function() { goToFirstPage(displayTableCallback, data); });

    displayTableCallback(currentPage, data);
}

function displayPageNumbers(data, totalPages, displayTableCallback) {
    const pageNumbers = $('#pageNumbers');
    pageNumbers.empty();

    if (totalPages <= 1) {
        const span = $('<span>').text(1).addClass('active');
        pageNumbers.append(span);
        return;
    }

    const createPageSpan = (pageNum) => {
        const span = $('<span>').text(pageNum);
        if (pageNum === currentPage) {
            span.addClass('active');
        }
        span.on('click', () => {
            currentPage = pageNum;
            displayTableCallback(pageNum, data);
        });
        return span;
    };

    const firstPageButton = $('#firstPage');
    if (currentPage === 1) {
        firstPageButton.hide();
    } else {
        firstPageButton.show();
    }

    const lastPageButton = $('#lastPage');
    if (currentPage === totalPages) {
        lastPageButton.hide();
    } else {
        lastPageButton.show();
    }

    pageNumbers.append(createPageSpan(1));

    if (currentPage > 3) {
        const ellipsis = $('<span>').text('...').addClass('ellipsis');
        pageNumbers.append(ellipsis);
    }

    let startPage = Math.max(currentPage - 1, 2);
    let endPage = Math.min(currentPage + 1, totalPages - 1);

    if (currentPage === 1) {
        endPage = Math.min(3, totalPages - 1);
    } else if (currentPage === totalPages) {
        startPage = Math.max(totalPages - 2, 2);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.append(createPageSpan(i));
    }

    if (currentPage < totalPages - 2) {
        const ellipsis = $('<span>').text('...').addClass('ellipsis');
        pageNumbers.append(ellipsis);
    }

    pageNumbers.append(createPageSpan(totalPages));
}

function goToFirstPage(displayTableCallback, data) {
    currentPage = 1;
    displayTableCallback(currentPage, data);
}

function goToLastPage(displayTableCallback, data) {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    currentPage = totalPages;
    displayTableCallback(currentPage, data);
}

function goToPreviousPage(displayTableCallback, data) {
    if (currentPage > 1) {
        currentPage--;
        displayTableCallback(currentPage, data);
    }
}

function goToNextPage(displayTableCallback, data) {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTableCallback(currentPage, data);
    }
}