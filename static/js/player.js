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

let audioContext = new Audio();
let playingId = -1;

function audioPlayer() {
    $(".play-btn").on("click", togglePlay);
    const volume = $(".volume-range");
    const volumeIcon = $(".volume-icon");
    volume.on("input change", function () {
        const volume = $(".volume-range").val();
        audioContext.volume = volume / 100;
        removeVolIcon();
        if (volume === 0) {
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
    audioContext.addEventListener('timeupdate',function (){
        seek.attr("max", audioContext.duration);
        seek.val(audioContext.currentTime);
    });
}

function removeVolIcon() {
    const volumeIcon = $(".volume-icon");
    volumeIcon.removeClass("pIcon-volume-high");
    volumeIcon.removeClass("pIcon-volume-medium");
    volumeIcon.removeClass("pIcon-volume-low");
    volumeIcon.removeClass("pIcon-volume-mute");
}

function playSound(songId, thumbnailURL, audioURL, title, artist) {
    playingId = songId;
    $(".title").text(title);
    $(".artist").text(artist);
    $(".album").attr("src", thumbnailURL);
    audioContext.src = audioURL.replace("#", "%23");
    $(".seek-range").val(0);
    if (audioContext.paused) togglePlay();
}

function getPlayingID() {
    return playingId;
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
