function createPopup(body) {
    let popup =
        `<div class="popup">
            <div class="popup-content">                                                                                                                                                                                                                               
                <div class="dialog-header">
                        <h2 class="dialog-title" style="margin-left: 35px">Message</h2>
                        <span class="close"><img src="../../images/cancel.svg" width="24" height="24"></span>
                </div>
                <p style="margin: 16px; font-family: 'Inter', sans-serif; font-weight: 500; font-size: 20px;">${body}</p>
                <button class="btn-cancel">Cancel</button>
                <button class="btn-OK"">OK</button>
            </div>
        </div>`

    $(".body-container").append(popup);

    return new Promise((resolve) => {
        $(".btn-cancel").on("click", function () {
            $(".popup").remove();
            resolve(false);
        });

        $(`.btn-OK`).on("click", function () {
            $(".popup").remove();
            resolve(true);
        });

        $(`.close`).on("click", function () {
            $(".popup").remove();
            resolve(false);
        })
    });
}

function createFormPopup(title, labelName, type) {
    let popup =
        `<div class="popup">
            <div class="popup-content">                                                                                                                                                                                                                               
                <div class="dialog-header">
                        <h2 class="dialog-title" style="margin-left: 35px">${title}</h2>
                        <span class="close"><img src="../../images/cancel.svg" width="24" height="24"></span>
                </div>
                <div class="content-container">
                    
                </div>
                
                <button class="btn-cancel">Cancel</button>
                <button class="btn-OK"">OK</button>
            </div>
        </div>`

    let content;
    if (type === "INPUT") {
        content = `
            <form style="display: grid;gap: 10px;grid-template-columns: 1fr 4fr; padding: 20px 40px;">
                <label style="display: flex; height: 100%; justify-content: right; align-items: center;" for="new-${labelName}">${labelName}</label>
                <input id="new-name" type="text" style="margin: 0; font-family: 'Inter', 'sans-serif'; border-radius: 10px;">
            </form>`
    } else {
        content = `
            <form style="display: grid;gap: 10px;grid-template-columns: 1fr 4fr; padding: 20px 40px;">
                <label style="display: flex; height: 100%; justify-content: right; align-items: center;" for="new-${labelName}">${labelName}</label>
                <select id="new-status" style="margin: 0; font-family: 'Inter', 'sans-serif'; border-radius: 10px;">
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                </select>
            </form>`
    }

    $(".body-container").append(popup);
    $(".content-container").append(content);

    return new Promise((resolve) => {
        let popup = $('.popup');
        $(".btn-cancel").on("click", function () {
            resolve(false);
            popup.remove();
        });

        $(`.btn-OK`).on("click", function () {
            let inputValue;
            if (type === "INPUT") {
                resolve($("#new-name").val()); // Get the value from the input field
            } else {
                inputValue = $(`#new-status`).val(); // Get the value from the select element
            }
            resolve(inputValue);
            popup.remove();
        });

        $(`.close`).on("click", function () {
            resolve(false);
            popup.remove();
        })
    });
}
let active = false;
function createFormPopupAddUnitItem(title) {

    let popup =
        `<div class="popup">
            <div class="popup-content">                                                                                                                                                                                                                               
                <div class="dialog-header">
                        <h2 class="dialog-title" style="margin-left: 35px">${title}</h2>
                        <span class="close"><img src="../../images/cancel.svg" width="24" height="24"></span>
                </div>
                <div class="content-container">
                    <form id="addLessonForm" class="form-display">
                        <label for="content">Training content</label>
                        <div class="validate-container" style="display: block;">
                            <div class="search-container" style="position: relative;">
                                <input type="text" class="form-control" id="content" placeholder="Find Training Content name" style="background-image: url('../../images/search_icon.svg'); background-repeat: no-repeat; padding-left: 40px">
                                <div class="result-container hide">
                                   
                                </div>
                            </div>
                            <span id="contentError" class="error hide">is required!</span>
                        </div>
                        
                        
                        
                        <label for="contentName">Syllabus Name</label>
                        <input type="text" class="form-control" id="contentName" placeholder="Content name" disabled>
                        
                        <label for="objectiveCode">Objectives</label>
                        <div class="input-wrapper" style="position: relative; width: 100%;">
                            <input type="text" class="form-control" id="objectiveCode" disabled>  
                            <div class="input-addon">
                            
                            </div>
                        </div>
                        
                        <label for="duration">Duration</label>
                        <input type="number" class="form-control" id="duration" placeholder="Enter duration (e.g., 30mins)" min="1" max="480" disabled>
                         
                        <label for="status">Status</label>
                        <select class="form-control" id="status" disabled>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                      
                    </form>
                </div>
                
                <button class="btn-cancel">Cancel</button>
                <button class="btn-OK"  formaction="addLessonForm">OK</button>
            </div>
        </div>`

    $(".body-container").append(popup);
    let data = null;
    $("#content").on("input", function () {
        const keyword = $(this).val().toLowerCase();
        const filteredSources = source.filter(source => source.content.toLowerCase().includes(keyword));

        const $resultContainer = $('.result-container');
        $resultContainer.empty(); // Clear previous results
        if (filteredSources.length > 0) {
            filteredSources.forEach(source => {
                $resultContainer.append(`<div class="result-item" data-id=${source.id}>${source.content}</div>`);
                $resultContainer.children(`.result-item[data-id=${source.id}]`).on("click", function () {
                    $("#content").val("");
                    $('.result-container').addClass("hide");
                    const $resultContainer = $('.result-container');
                    data = {
                        id: source.id,
                        content: source.content,
                        objectives: source.objectives,
                        duration: source.duration,
                        status: source.status
                    };
                    $('#contentName').val(data.content);
                    $('#duration').val(data.duration);
                    if (data.status === true) {
                        $("#status").val("offline");
                    } else {
                        $("#status").val("online");
                    }
                    $('#objectiveCode').next(".input-addon").empty();
                    for (let o of data.objectives) {
                        let element = `<div class="input-addon-item">${o.code}</div>`
                        $('#objectiveCode').next(".input-addon").append(element);
                    }
                })
            });
            $resultContainer.removeClass('hide');
        } else {
            $resultContainer.addClass('hide');
        }
        $(document).on("click", function (event) {
            if (!$(event.target).closest('.search-container').length && !$(event.target).is('#content')) {
                $resultContainer.addClass('hide');
            }
        });
    })

    return new Promise((resolve) => {
        let popup = $('.popup');
        $(".btn-cancel").on("click", function () {
            resolve(false);
            popup.remove();
        });

        $(`.btn-OK`).on("click", function () {
            if (data !== null) {
                resolve(data);
            }
            popup.remove();
        });

        $(`.close`).on("click", function () {
            resolve(false);
            popup.remove();
        })
    });
}

function createFormPopupStatusClass(title, labelName) {
    let popup =
        `<div class="popup">
            <div class="popup-content">                                                                                                                                                                                                                               
                <div class="dialog-header">
                        <h2 class="dialog-title" style="margin-left: 35px">${title}</h2>
                        <span class="close"><img src="../../images/cancel.svg" width="24" height="24"></span>
                </div>
                <div class="content-container">
                    
                </div>
                
                <button class="btn-cancel">Cancel</button>
                <button class="btn-OK"">OK</button>
            </div>
        </div>`

    let content;

    content = `
        <form style="display: grid;gap: 10px;grid-template-columns: 1fr 4fr; padding: 20px 40px;">
            <label style="display: flex; height: 100%; justify-content: right; align-items: center;" for="new-${labelName}">${labelName}</label>
            <select id="new-status" style="margin: 0; font-family: 'Inter', 'sans-serif'; border-radius: 10px;">
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="PLANNING">PLANNING</option>
                <option value="SCHEDULE">SCHEDULE</option>
                <option value="PENDING">PENDING</option>
            </select>
        </form>`

    $(".body-container").append(popup);
    $(".content-container").append(content);

    return new Promise((resolve) => {
        let popup = $('.popup');
        $(".btn-cancel").on("click", function () {
            resolve(false);
            popup.remove();
        });

        $(`.btn-OK`).on("click", function () {
            let inputValue;

            inputValue = $(`#new-status`).val(); // Get the value from the select element
            resolve(inputValue);
            popup.remove();
        });

        $(`.close`).on("click", function () {
            resolve(false);
            popup.remove();
        })
    });
}

export {createPopup, createFormPopup, createFormPopupAddUnitItem, createFormPopupStatusClass}