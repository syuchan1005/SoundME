/**
 * Created by syuchan on 2017/04/09.
 */
function artistClick(artist) {
    axios({
        url: `${location.protocol}//${location.host}/artist/${artist}`,
        method: "GET"
    }).then(function (response) {
        $("#category-album").html($(response.data).filter("div#ctx").html());
        setEvents();
    });
}