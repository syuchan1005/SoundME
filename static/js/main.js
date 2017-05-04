/**
 * Created by syuchan on 2017/03/22.
 */
$.fn.hasScrollBar = function () {
    return this.get(0).scrollHeight > this.get(0).clientHeight;
};

$(document).ready(function () {
    audioPlayer();
    $("nav#menu span").on("click", function () {
        movePage($(this).attr("data-link"))
    });
    $(window).trigger("page");
    document.addEventListener("touchmove", function (e) {
        if (!(e.target.classList.contains("scrollable") || $(e.target).parents(".scrollable").length === 1)) {
            e.preventDefault();
        }
    }, false);
});

$(window).on("page", function () {
    $(`.sIcon-${location.pathname.substring(1, location.pathname.length)}`).addClass("active");
});

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
        $(".active").removeClass("active");
        history.pushState({}, "SoundME", moveLink);
        $("#ctx").html($(response.data).filter("div#ctx").html());
        $(`.sIcon-${url.substring(1)}`).addClass("active");
        $(window).trigger("page");
    }).catch(function (e) {
        $("#ctx").html(e);
    });
}