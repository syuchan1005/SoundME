/**
 * Created by syuchan on 2017/03/19.
 */
const PlayerIcon = {
    PLAY: "",
    PAUSE: "",
    BACKWARD: "",
    FORWARD: "",
    HIGH: "",
    MEDIUM: "",
    LOW: "",
    MUTE: ""
};

let defaultSongData = {
    id: -1,
    thumbnail: "/no_art.png",
    audio: undefined,
    title: "Title",
    artist: "Artist"
};

document.addEventListener("touchstart", function () {
    togglePlay();
    document.removeEventListener("touchstart", arguments.callee, false);
}, false);

let audio = new Audio();
let playing = defaultSongData;
let isListShow = false;
let queueList = [];
let queueIndex = 0;

function audioPlayer() {
    $(".play-btn").on("click", togglePlay);
    const volume = $(".volume-range");
    const volumeIcon = $(".volume-icon");
    volume.on("input change", function () {
        const volume = $(".volume-range").val();
        audio.volume = volume / 100;
        removeVolIcon();
        if (volume === "0") {
            volumeIcon.addClass("pIcon-volume-mute");
        } else if (volume <= 33) {
            volumeIcon.addClass("pIcon-volume-low");
        } else if (volume <= 66) {
            volumeIcon.addClass("pIcon-volume-medium");
        } else {
            volumeIcon.addClass("pIcon-volume-high");
        }
    });
    volumeIcon.on("click", function () {
        volume.val(0);
        volume.trigger("change");
    });
    const seek = $(".seek-range");
    seek.on("mousedown", function () {
        audio.pause();
    });
    seek.on("mouseup", function () {
        if ($(".play-btn").hasClass("pIcon-pause")) {
            audio.play();
        }
    });
    seek.on("input change", function () {
        audio.currentTime = $(this).val();
    });
    audio.addEventListener('timeupdate', function () {
        seek.attr("max", audio.duration);
        seek.val(audio.currentTime);
    });
    $(".list-btn").on("click", toggleList);
    $(".forward-btn").on("click", nextQueue);
    $(".backward-btn").on("click", backQueue);
    $(".album-mask").on("click", function () {
       window.open("https://twitter.com/intent/tweet?text="+ encodeURIComponent(`#NowPlaying\n${playing.title} - ${playing.artist}\nSoundME - ${location.protocol + "//" + location.host}`));
    });
}

function removeVolIcon() {
    const volumeIcon = $(".volume-icon");
    volumeIcon.removeClass("pIcon-volume-high");
    volumeIcon.removeClass("pIcon-volume-medium");
    volumeIcon.removeClass("pIcon-volume-low");
    volumeIcon.removeClass("pIcon-volume-mute");
}

function setQueue(queues) {
    if (!Array.isArray(queues)) queues = [queues];
    queueList = queues;
    playSound(queueList[0]);
    queueIndex = 0;
    _renderQueue();
}

function _renderQueue() {
    const list = $("#list-ctx");
    list.html("");
    for (let i = queueIndex + 1; i < queueList.length; i++) {
        const e = queueList[i];
        if (e.thumbnail !== "/no_art.png") e.thumbnail = `${e.thumbnail.substring(0, e.thumbnail.length - 4)}_small.png`;
        list.append(`<div class="queue-item">
                <img width="40" height="40" src="${e.thumbnail}">
                <div class="queue-song-data">
                    <span class="queue-title">${e.title}</span>
                    <span class="queue-artist">${e.artist}</span>
                </div>
             </div>`);
    }
}

function nextQueue() {
    if (queueIndex === queueList.length) {
        playSound(defaultSongData);
    } else {
        queueIndex++;
        playSound(queueList[queueIndex]);
    }
    _renderQueue();
}

function backQueue() {
    if (queueIndex === 0) {
        playSound(defaultSongData);
    } else {
        playSound(queueList[queueIndex]);
        queueIndex--;
    }
    _renderQueue();
}

function playSound(song) {
    playing = song;
    $(".player .title").text(song.title);
    $(".player .artist").text(song.artist);
    if (song.thumbnail !== "/no_art.png") song.thumbnail = song.thumbnail.substring(0, song.thumbnail.length - 4) + "_small" + song.thumbnail.substring(song.thumbnail.length - 4);
    $(".player .album").attr("src", song.thumbnail);
    if (song.audio) {
        audio.src = song.audio.replace("#", "%23");
        $(".seek-range").val(0);
        if (audio.paused) togglePlay();
    } else {
        audio.src = undefined;
    }
}

function getPlaying() {
    return playing;
}

function togglePlay() {
    const btn = $(".play-btn");
    if (audio.paused) {
        btn.removeClass("pIcon-play");
        btn.addClass("pIcon-pause");
        audio.play();
    } else {
        btn.removeClass("pIcon-pause");
        btn.addClass("pIcon-play");
        audio.pause();
    }
}

function toggleList() {
    $("#list-window").css("visibility", isListShow ? "hidden" : "visible");
    isListShow = !isListShow;
}

