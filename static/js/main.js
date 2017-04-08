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
            playSound(id, thumbnailURL, data.path, data.title, data.artist);
        }
    });
}

function movePage(url) {
    const moveLink = `${location.protocol}//${location.host}${url}`;
    $.ajax({
        url: moveLink,
        type: "GET",
        timeout: 10000,
        success: function (data) {
            $(".active").removeClass("active");
            history.pushState({}, "SoundME", moveLink);
            $("#ctx").html($(data).filter("div#ctx").html());
            $(`.sIcon-${url.substring(1)}`).addClass("active");
        }
    });
}