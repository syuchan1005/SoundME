/**
 * Created by syuchan on 2017/03/24.
 */

function submitClick() {
    let src_format = [];
    $(".src-input-setting")
        .find("[data-format]")
        .each((i, val) => {
            if ($(val).prop("checked")) {
                src_format.push($(val).attr("data-format"));
            }
        });
    let data = {
        music_path: $("#music-path").val(),
        theme_name: $("#theme-name").val(),
        src: src_format
    };
    $.ajax({
        url: `${location.protocol}//${location.host}/setting/`,
        type: "POST",
        timeout: 10000,
        data: data,
        success: function () {
            location.reload();
        }
    })
}

function updateClick() {
    const socket = new WebSocket(((location.protocol === "http:") ? "ws:" : "wss:") + "//" + location.host + "/setting/load");
    socket.onopen = function (event) {
        $("#update-progress").css("display", "block");
    };
    socket.onclose = function (event) {
        $("#update-progress").css("display", "none");
    };
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        $("#progress").attr("value", data.progress);
        $("#process-file").text(data.process_file + " - " + data.process);
        $("#file-progress").attr("value", data.progress_file);
        if (data.progress >= 100 && data.progress_file >= 100) {
            socket.close();
        }
    };
}

function deleteAjax(path) {
    $.ajax({
        url: `${location.protocol}//${location.host}/setting/reset/${path}`,
        type: "DELETE",
        timeout: 10000
    });
}

function userExec(type, data) {
    $.ajax({
        url: `${location.protocol}//${location.host}/setting/user`,
        type: type,
        data: data,
        timeout: 10000,
        success: function () {
            location.reload();
        }
    });
}

function createHash(username, password) {
    const salt = getSHA256(username);
    let hash = "";
    for (let i = 0; i < 10000; i++) {
        hash = getSHA256(hash + salt + password);
    }
    return hash;
}

function getSHA256(str) {
    const shaObj = new jsSHA("SHA-256", "TEXT", 1);
    shaObj.update(str);
    return shaObj.getHash("HEX");
}

function addUserClick() {
    $("#user-form").dialog({
        buttons: {
            '追加': function () {
                const name = $("#form-name").val();
                const pass = $("#form-pass").val();
                const hash = createHash(name, pass);
                const role = $("#form-role").val();
                userExec("POST", {
                    username: name,
                    hash: hash,
                    role: role
                });
                $(this).dialog('close');
            },
            'キャンセル': function () {
                $(this).dialog('close');
            },
        }
    });
}

function deleteUserClick() {
    const id = $(this).parent().attr("data-userid");
    const name = $(this).parent().find(".user-name").text();
    const role = $(this).parent().find(".user-role").text();
    userExec("DELETE", {
        userid: id,
        username: name,
        role: role
    });
}