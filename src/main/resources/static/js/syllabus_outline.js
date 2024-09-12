$(document).ready(function() {
    $('.toggle-day').on('click', function(event) {
        event.preventDefault();
        let unitContainer = $(this).next('.unit-container');
        unitContainer.toggleClass('active inactive');
        $(this).next('.unit-container').css('border-radius', '0px');
    });

    $('.unit-header').on('click', function(event) {
        event.preventDefault();
        let unitContent = $(this).next('.unit-content');
        unitContent.toggleClass('active inactive');
    });
});
