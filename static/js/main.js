/**
 * Created by syuchan on 2017/03/22.
 */
$(document).ready(function () {
    audioPlayer();
    $(`.sIcon-${location.pathname.substring(1, location.pathname.length)}`).addClass("active");
    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.get(0).clientHeight;
    }
});

function getSHA256(str) {
    const shaObj = new jsSHA("SHA-256", "TEXT", 1);
    shaObj.update(str);
    return shaObj.getHash("HEX");
}

function getSongData(id) {
    return new Promise(function(resolve, reject) {
        axios({
            url: `${location.protocol}//${location.host}/songs/${id}`,
            method: "GET"
        }).then(function (response) {
            const data = response.data;
            resolve({
                id :id,
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
    const moveLink = `${location.protocol}//${location.host}${url}`;
    axios({
        url: moveLink,
        method: "GET"
    }).then(function (response) {
        $(".active").removeClass("active");
        history.pushState({}, "SoundME", moveLink);
        $("#ctx").html($(response.data).filter("div#ctx").html());
        $(`.sIcon-${url.substring(1)}`).addClass("active");
        $(window).trigger("load");
    });
}