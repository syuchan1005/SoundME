/**
 * Created by syuchan on 2017/03/19.
 */
var before_id = -1;

$(window).on("page", function() {
    $(".albums-data img").on("click", function () {
        const img = $(this);
        artClick(img.parent().prevAll().length, img.attr("id").substring(6));
    });
    alignAlbum();
});

var timer = false;
$(window).resize(function() {
    if (timer !== false) clearTimeout(timer);
    timer = setTimeout(alignAlbum, 200);
});

function artClick(index, id) {
    console.log(`${index}:${id}`);
    $(".album-songs").remove();
    if (before_id === id) {
        before_id = -1;
    } else {
        const list = $("#list");
        const row = Math.floor(list.width() / 185);
        before_id = id;
        let insert = ((Math.floor(index / row) + 1) * row) - 1;
        insert = Math.min(insert, list.attr("data-count") - 1);
        axios({
            url: `${location.protocol}//${location.host}/albums/${id}`,
            method: "GET"
        }).then(function (response) {
            $(response.data).find(".album-songs")
                .insertAfter(`[data-index=${insert}]`);
            setEvents();
        }).catch(function (error) {
            $(`<div class='album-songs' style='color: red'>${error}</div>`)
                .insertAfter(`[data-index=${insert}]`);
        });
    }
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
            let songs;
            getSongData(track.parent().attr("data-songid")).then(function (song) {
                songs = [song];
                const nextAll = track.parent().nextAll();
                const promises = [];
                for (let i = 0; i < nextAll.length; i++) {
                    promises.push(getSongData($(nextAll.eq(i)).attr("data-songid")));
                }
                return Promise.all(promises);
            }).then(function (values) {
                setQueue(songs.concat(values));
            });
        }
    });
}

function alignAlbum() {
    const list = $("#list");
    const row = Math.floor(list.width() / 185);
    const count = parseInt(list.attr("data-albumcount"));
    if (row !== 1) {
        const add = row - count % row;
        if (add !== row) {
            $(".dummy_album").remove();
            for (let i = 0; i < add; i++) {
                list.append(`<div class="dummy_album" data-index="${count + i}"></div>`);
            }
        }
        list.attr("data-count", count + add);
    } else {
        list.attr("data-count", count);
    }
}