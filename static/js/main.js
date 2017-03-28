/**
 * Created by syuchan on 2017/03/22.
 */
$(document).ready(function () {
    audioPlayer();
    $(`.sIcon-${location.pathname.substring(1, location.pathname.length)}`).addClass("active");
});

function playById(id, thumbnailURL) {
    $.ajax({
        url: `${location.protocol}//${location.host}/songs/${id}`,
        type: "GET",
        timeout: 10000,
        success: function (data) {
            playSound(thumbnailURL, data.path, data.title, data.artist);
        }
    });
}