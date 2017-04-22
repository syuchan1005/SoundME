/**
 * Created by syuchan on 2017/03/24.
 */

function themeUpload() {
    axios({
        url: `${location.protocol}//${location.host}/setting/theme`,
        method: "POST",
        data: new FormData($("#theme-form").get(0))
    }).then(function (response) {
        location.reload();
    });
}

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
    axios({
        url: `${location.protocol}//${location.host}/setting/`,
        method: "POST",
        data: data
    }).then(function (response) {
        location.reload();
    });
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

function sendDelete(path) {
    axios({
        url: `${location.protocol}//${location.host}/setting/reset/${path}`,
        method: "DELETE"
    });
}

function userExec(type, data) {
    axios({
        url: `${location.protocol}//${location.host}/setting/reset/${path}`,
        method: type,
        data: data
    }).then(function (response) {
        location.reload();
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

function deleteUserClick(self) {
    const parent = $(self).parent();
    const id = parent.attr("data-userid");
    const name = parent.find(".user-name").text();
    const role = parent.find(".user-role").text();
    userExec("DELETE", {
        userid: id,
        username: name,
        role: role
    });
}