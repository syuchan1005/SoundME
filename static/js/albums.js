/**
 * Created by syuchan on 2017/03/19.
 */
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
    const albums = $(".album-songs");
    const list = $("#list");
    if (albums.exists() || list.hasClass("loading")) {
        albums.remove();
    } else {
        list.addClass("loading");
        const row = Math.floor(list.width() / 185);
        before_id = id;
        let insert = ((Math.floor(index / row) + 1) * row) - 1;
        insert = Math.min(insert, list.attr("data-count") - 1);
        axios({
            url: `${location.protocol}//${location.host}/albums/${id}`,
            method: "GET"
        }).then(function (response) {
            const find = $(response.data).find(".album-songs");
            find.insertAfter(`[data-index=${insert}]`);
            setSongEvents();
            list.removeClass("loading");
        }).catch(function (error) {
            $(`<div class='album-songs' style='color: red'>${error}</div>`)
                .insertAfter(`[data-index=${insert}]`);
            list.removeClass("loading");
        });
    }
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