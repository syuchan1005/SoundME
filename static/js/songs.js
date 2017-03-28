/**
 * Created by syuchan on 2017/03/22.
 */
$(document).ready(function () {
    $(".songs-data").on("dblclick", function () {
        $(`.songs-icon[data-content=${PlayerIcon.MEDIUM}]`).attr("data-content", "  ");
        $(this).find(".songs-icon").attr("data-content", PlayerIcon.MEDIUM);
        const album = $(this).find(".songs-album");
        playById($(this).attr("data-songid"), `/thumbnail/${album.text()}_${album.attr("data-albumid")}.png`);
    });
});