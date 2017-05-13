/**
 * Created by syuchan on 2017/03/19.
 */
$(window).off("page.albums");
$(window).on("page.albums", function() {
    $(".albums-data img").off("click.albums");
    $(".albums-data img").on("click.albums", function () {
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
    let albums = $(".album-songs");
    const list = $("#list");
    if (albums.exists()) {
        albums.remove();
        if (albums.find(".album-data").attr("data-albumid") === id) return;
    }
    if (!$(".loading").exists()) {
        const row = Math.floor(list.width() / 185);
        let insert = ((Math.floor(index / row) + 1) * row) - 1;
        insert = Math.min(insert, list.attr("data-count") - 1);
        albums = $("<div class='album-songs loading'><div></div><div></div><div></div></div>");
        albums.insertAfter(`[data-index=${insert}]`);
        axios({
            url: `${location.protocol}//${location.host}/albums/${id}`,
            method: "GET"
        }).then(function (response) {
            const find = $(response.data).find(".album-songs");
            albums.removeClass("loading");
            albums.html(find.html());
            setSongEvents();
        }).catch(function (error) {
            albums.removeClass("loading");
            albums.html(`<div class='album-songs' style='color: red'>${error}</div>`);
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