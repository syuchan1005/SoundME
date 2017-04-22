/**
 * Created by syuchan on 2017/03/19.
 */
var before_index = -1;

function artClick(index, id) {
    const list = $("#list");
    const row = Math.floor((list.width() - ((list.hasScrollBar()) ? 17 : 0)) / 185);
    $(".album-songs").remove();
    if (before_index === index) {
        before_index = -1;
        return;
    }
    before_index = index;
    let insert = ((Math.floor(index / row) + 1) * row) - 1;
    insert = Math.min(insert, list.attr("data-albumcount") - 1);
    axios({
        url: `${location.protocol}//${location.host}/albums/${id}`,
        method: "GET"
    }).then(function (response) {
        $(response.data).find(".album-songs")
            .insertAfter(`[data-index=${insert}]`);
        setEvents();
    }).catch(function (error) {
        $(`<div class='album-songs' style='color: red'>${textStatus}</div>`)
            .insertAfter(`[data-index=${insert}]`);
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
    songTrack.on("click", async function () {
        const track = $(this);
        if (track.attr("data-content") === PlayerIcon.PAUSE) {
            track.attr("data-content", PlayerIcon.PLAY);
            togglePlay();
        } else {
            const m = $(`[data-content="${PlayerIcon.MEDIUM}"]`);
            m.attr("data-content", m.attr("data-track"));
            track.attr("data-content", PlayerIcon.PAUSE);
            const songs = [await getSongData(track.parent().attr("data-songid"))];
            const nextAll = track.parent().nextAll();
            for (let i = 0; i < nextAll.length; i++) {
                const e = nextAll.eq(i);
                songs.push(await getSongData($(e).attr("data-songid")));
            }
            setQueue(songs);
        }
    });
}