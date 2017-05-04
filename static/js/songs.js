/**
 * Created by syuchan on 2017/03/22.
 */
$(window).on("page", function () {
    $(".songs-data").on("click", function () {
        const id = $(this).attr("data-songid");
        $(`.songs-icon[data-content=${PlayerIcon.MEDIUM}]`).attr("data-content", "  ");
        const $this = $(`[data-songid="${id}"]`);
        $this.find(".songs-icon").attr("data-content", PlayerIcon.MEDIUM);
        const album = $this.find(".songs-album");
        let songs;
        getSongData($this.attr("data-songid")).then(function (song) {
            songs = [song];
            const nextAll = $this.nextAll();
            const promises = [];
            for (let i = 0; i < nextAll.length; i++) {
                promises.push(getSongData($(nextAll.eq(i)).attr("data-songid")));
            }
            return Promise.all(promises);
        }).then(function (values) {
            setQueue(songs.concat(values));
        });
    });
});
