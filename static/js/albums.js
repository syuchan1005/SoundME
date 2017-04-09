/**
 * Created by syuchan on 2017/03/19.
 */
var before_index = -1;

function artClick(index, id) {
    const list = $("#list");
    const row = Math.floor(list.width() / 175);
    $(".album-songs").remove();
    if (before_index === index) {
        before_index = -1;
        return;
    }
    before_index = index;
    let insert = ((Math.floor(index / row) + 1) * row) - 1;
    const albumCount = list.attr("data-albumcount");
    if (albumCount < insert) insert = albumCount - 1;
    $.ajax({
        url: `${location.protocol}//${location.host}/albums/${id}`,
        type: "GET",
        timeout: 10000,
        success: function (data) {
            $(data).find(".album-songs")
                .insertAfter(`[data-index=${insert}]`);
            setEvents();
        },
        error: function (xhr, textStatus, errorThrown) {
            $(`<div class='album-songs' style='color: red'>${textStatus}</div>`)
                .insertAfter(`[data-index=${insert}]`);
        }
    });
}

function setEvents() {
    const songData = $(".song-data");
    const songTrack = $(".song-track");
    songData.on("mouseenter", function () {
        const songTrack = $(this).find(".song-track");
        if (songTrack.attr("data-content") === PlayerIcon.MEDIUM) {
            songTrack.attr("data-content", PlayerIcon.PAUSE);
        } else {
            songTrack.attr("data-content", PlayerIcon.PLAY);
        }
    });
    songData.on("mouseleave", function () {
        const songTrack = $(this).find(".song-track");
        if (songTrack.attr("data-content") === PlayerIcon.PAUSE) {
            songTrack.attr("data-content", PlayerIcon.MEDIUM);
        } else {
            songTrack.attr("data-content", songTrack.attr("data-track"));
        }
    });
    songTrack.on("click", function () {
        const track = $(this);
        if (track.attr("data-content") === PlayerIcon.PAUSE) {
            track.attr("data-content", PlayerIcon.PLAY);
            togglePlay();
        } else {
            const m = $(`[data-content="${PlayerIcon.MEDIUM}"]`);
            m.attr("data-content", m.attr("data-track"));
            track.attr("data-content", PlayerIcon.PAUSE);
            playById(track.parent().attr("data-songid"), $(".album-thumbnail").attr("src"));
        }
    });
}