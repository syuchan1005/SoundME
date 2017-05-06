/**
 * Created by syuchan on 2017/03/24.
 */
$(window).on("page", function () {
    $(".add-user").on("click", function () {
        $("#user-form").css("display", "flex");
    });
    $("#form-add").on("click", function () {
        const name = $("#form-name").val();
        userExec("POST", {
            username: name,
            hash: createHash(name, $("#form-pass").val()),
            role: $("#form-role").val()
        });
        $("#user-form").css("display", "none");
    });
    $("#form-cancel").on("click", function () {
        $("#user-form").css("display", "none");
    });
    $(".delete-user").on("click", function () {
        const parent = $(this).parent();
        const id = parent.attr("data-userid");
        const name = parent.find(".user-name").text();
        const role = parent.find(".user-role").text();
        userExec("DELETE", {
            userid: id,
            username: name,
            role: role
        });
    });
    $("#theme-upload").on("click", function () {
        axios({
            url: `${location.protocol}//${location.host}/setting/theme`,
            method: "POST",
            data: new FormData($("#theme-form").get(0))
        }).then(function (response) {
            location.reload();
        });
    });
    $("#submit").on("click", function () {
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
    });
    $("#update").on("click", function () {
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
    });
    $("#risky").find("button").on("click", function () {
        axios({
            url: `${location.protocol}//${location.host}/setting/reset/${$(this).attr("data-type")}`,
            method: "DELETE"
        });
    });
});

function userExec(type, data) {
    axios({
        url: `${location.protocol}//${location.host}/setting/user`,
        method: type,
        data: data
    }).then(function (response) {
        location.reload();
    }).catch(function (e) {
        alert("can't delete yourself");
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