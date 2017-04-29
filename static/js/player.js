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

let audioContext = new Audio();
let playing = -1;
let isListShow = false;
let queueList = [];
let queueIndex = 0;

function audioPlayer() {
    $(".play-btn").on("click", togglePlay);
    const volume = $(".volume-range");
    const volumeIcon = $(".volume-icon");
    volume.on("input change", function () {
        const volume = $(".volume-range").val();
        audioContext.volume = volume / 100;
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
        audioContext.pause();
    });
    seek.on("mouseup", function () {
        if ($(".play-btn").hasClass("pIcon-pause")) {
            audioContext.play();
        }
    });
    seek.on("input change", function () {
        audioContext.currentTime = $(this).val();
    });
    audioContext.addEventListener('timeupdate', function () {
        seek.attr("max", audioContext.duration);
        seek.val(audioContext.currentTime);
    });
    $(".list-btn").on("click", toggleList);
    $(document).on("click", function (event) {
        if (event.target.classList.contains("list-btn")) return;
        if (event.target.id !== "list-window" && isListShow) toggleList();
    });
    $(".forward-btn").on("click", nextQueue);
    $(".backward-btn").on("click", backQueue);
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
    $(".title").text(song.title);
    $(".artist").text(song.artist);
    $(".album").attr("src", song.thumbnail);
    if (song.audio) {
        audioContext.src = song.audio.replace("#", "%23");
        $(".seek-range").val(0);
        if (audioContext.paused) togglePlay();
    } else {
        audioContext.src = undefined;
    }
}

function getPlaying() {
    return playing;
}

function togglePlay() {
    const btn = $(".play-btn");
    if (audioContext.paused) {
        btn.removeClass("pIcon-play");
        btn.addClass("pIcon-pause");
        audioContext.play();
    } else {
        btn.removeClass("pIcon-pause");
        btn.addClass("pIcon-play");
        audioContext.pause();
    }
}

function toggleList() {
    $("#list-window").css("visibility", isListShow ? "hidden" : "visible");
    isListShow = !isListShow;
}

