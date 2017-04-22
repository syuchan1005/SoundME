/**
 * Created by syuchan on 2017/03/22.
 */
async function songClick(index ,id) {
    $(`.songs-icon[data-content=${PlayerIcon.MEDIUM}]`).attr("data-content", "  ");
    const $this = $(`[data-songid="${id}"]`);
    $this.find(".songs-icon").attr("data-content", PlayerIcon.MEDIUM);
    const album = $this.find(".songs-album");
    const songs = [await getSongData($this.attr("data-songid"), `/thumbnail/${getSHA256(`${album.text()}_${album.attr("data-albumid")}`)}.png`)];
    const nextAll = $this.nextAll();
    for (let i = 0; i < nextAll.length; i++) {
        const e = nextAll.eq(i);
        const album = e.find(".songs-album");
        songs.push(await getSongData($(e).attr("data-songid"), `/thumbnail/${getSHA256(`${album.text()}_${album.attr("data-albumid")}`)}.png`));
    }
    setQueue(songs);
}