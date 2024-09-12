let active = true;
$(document).ready(function () {
    $(".training-toggle").on("click", function (event) {
        event.preventDefault();
        if (active === true) {
            $(this).next(".dropdown-content").css("display", "none");
            active = false;
        }  else {
            $(this).next(".dropdown-content").css("display", "block");
            active = true;
        }
    });
});