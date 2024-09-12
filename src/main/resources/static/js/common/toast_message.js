// function to create toast message, input: type(boolean), title(string), text(string)
function createToast(type, title, text) {
    let $notifications = $('.body-container');

    let icon;
    let typeString;
    if (type === true) {
        icon = "fa-solid fa-circle-check";
        typeString = "success";
    } else {
        icon = "fa-solid fa-circle-exclamation";
        typeString = "error"
    }

    let $newToast = $(`
        <div class="notifications">
            <div class="notify-info ${typeString}">
                <i class="${icon}"></i>
                <div class="content">
                    <div class="title">${title}</div>
                    <span>${text}</span>
                </div>
                <i class="fa-solid fa-xmark"></i>
            </div>
        </div>
    `);

    $notifications.append($newToast);

    // Close the toast when the close icon is clicked
    $newToast.find('.fa-xmark').on('click', function() {
        $(this).closest('.notifications').fadeOut(function() {
            $(this).remove();
        });
    });

    // Automatically fade out and remove the toast after 2 seconds
    setTimeout(() => {
        $newToast.fadeOut(function() {
            $(this).remove();
        });
    }, 2000);
}

export default createToast;
