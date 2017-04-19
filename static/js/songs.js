/**
 * Created by syuchan on 2017/03/22.
 */
function songClick(index ,id) {
    $(`.songs-icon[data-content=${PlayerIcon.MEDIUM}]`).attr("data-content", "  ");
    const $this = $(`[data-songid="${id}"]`);
    $this.find(".songs-icon").attr("data-content", PlayerIcon.MEDIUM);
    const album = $this.find(".songs-album");
    playById($this.attr("data-songid"), `/thumbnail/${getSHA256(`${album.text()}_${album.attr("data-albumid")}`)}.png`);
}