/**
 * Created by syuchan on 2017/03/22.
 */
$.fn.hasScrollBar = function () {
    return this.get(0).scrollHeight > this.get(0).clientHeight;
};
$.fn.exists = function () {
    return Boolean(this.length > 0);
};
$.fn.hasAttribute = function (attr) {
    return this[0].hasAttribute(attr);
};

$(document).ready(function () {
    audioPlayer();
    $("nav#menu span").on("click", function () {
        movePage($(this).attr("data-link"))
    });
    $(window).trigger("page");
    document.addEventListener("touchmove", function (e) {
        if (!(hasClass("scrollable", e.target) || hasClass("seekbar", e.target))) {
            e.preventDefault();
        }
    }, {passive: false});
});

$(window).off("page.main");
$(window).on("page.main", function () {
    const split = location.pathname.split("/");
    $(`.sIcon-${split[split.length - 1]}`).addClass("active");
});

function hasClass(className, elem) {
    return elem.classList.contains(className) || $(elem).parents("." + className).length === 1;
}

function getSHA256(str) {
    const shaObj = new jsSHA("SHA-256", "TEXT", 1);
    shaObj.update(str);
    return shaObj.getHash("HEX");
}

function getSongData(id) {
    return new Promise(function (resolve, reject) {
        axios({
            url: `${location.protocol}//${location.host}/songs/${id}`,
            method: "GET"
        }).then(function (response) {
            const data = response.data;
            resolve({
                id: id,
                thumbnail: data.thumbnail,
                audio: data.path,
                title: data.title,
                artist: data.artist
            });
        }).catch(function (error) {
            reject(error);
        });
    });
}

function setSongEvents() {
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

function movePage(url) {
    if (isListShow) toggleList();
    const moveLink = `${location.protocol}//${location.host}${url}`;
    axios({
        url: moveLink,
        method: "GET"
    }).then(function (response) {
        const parser = document.createElement('a');
        parser.href = response.request.responseURL;
        if (parser.pathname === "/" || response.data === "OK") {
            location.href = `${location.protocol}//${location.host}/`;
            return;
        }
        parser.href = url;
        $(".active").removeClass("active");
        history.pushState({}, "SoundME", moveLink);
        $("#ctx").html($(response.data).filter("div#ctx").html());
        const split = parser.pathname.split("\/");
        $(`.sIcon-${split[split.length - 1]}`).addClass("active");
        $(window).trigger("page");
    }).catch(function (e) {
        $("#ctx").html(e);
    });
}