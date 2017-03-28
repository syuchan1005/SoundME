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

let audio = new Audio();

function audioPlayer() {
    $(".play-btn").on("click", togglePlay);
    const volume = $(".volume-range");
    const volumeIcon = $(".volume-icon");
    volume.on("input change", function () {
        const volume = $(".volume-range").val();
        audio.volume = volume / 100;
        removeVolIcon();
        if (volume == 0) {
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
    audio.addEventListener('timeupdate',function (){
        seek.attr("max", audio.duration);
        seek.val(audio.currentTime);
    });
}

function removeVolIcon() {
    const volumeIcon = $(".volume-icon");
    volumeIcon.removeClass("pIcon-volume-high");
    volumeIcon.removeClass("pIcon-volume-medium");
    volumeIcon.removeClass("pIcon-volume-low");
    volumeIcon.removeClass("pIcon-volume-mute");
}

function playSound(thumbnailURL, audioURL, title, artist) {
    $(".title").text(title);
    $(".artist").text(artist);
    $(".album").attr("src", thumbnailURL);
    audio.src = audioURL;
    $(".seek-range").val(0);
    if (audio.paused) togglePlay();
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
