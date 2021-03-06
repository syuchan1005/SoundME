/**
 * Created by syuchan on 2017/03/22.
 */
$(window).off("page.songs");
$(window).on("page.songs", function () {
    $(".songs-data").off("click.songs").on("click.songs", function (e) {
        const $this = $(this);
        const id = $this.attr("data-songid");
        $(`.songs-icon[data-content=${PlayerIcon.MEDIUM}]`).attr("data-content", "  ");
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
    $(".th-perm").off("contextmenu.songs").on("contextmenu.songs", function () {
        const $this = $(this);
        const perm = $this.find("span").html();
        const input = window.prompt('Permission(default ["*"](json array))', perm);
        try {
            if (!(input === null || input === "") && perm !== input && Array.isArray(JSON.parse(input))) {
                axios({
                    url: `${location.protocol}//${location.host}/setting/songperm`,
                    method: "PUT",
                    data: {
                        songId: $this.parent().attr("data-songid"),
                        perm: input,
                        beforePerm: perm
                    }
                }).then(function (response) {
                    location.reload();
                });
            }
        } catch (e) {
            alert(e);
        }
        return false;
    });
});
