/**
 * Created by syuchan on 2017/03/24.
 */
$(document).ready(function () {
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
    $("#clear-cache").on("click", function () {
        deleteAjax("clear");
    });
    $("#reset-db").on("click", function () {
        deleteAjax("reset");
    });
    $("#reset-all").on("click", function () {
        deleteAjax("resetall");
    });
});

function deleteAjax(path) {
    $.ajax({
        url: `${location.protocol}//${location.host}/setting/reset/${path}`,
        type: "DELETE",
        timeout: 10000
    });
}