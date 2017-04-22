/**
 * Created by syuchan on 2017/04/09.
 */
function genreClick(genre) {
    axios({
        url: `${location.protocol}//${location.host}/genre/${genre}`,
        method: "GET"
    }).then(function (response) {
        $("#category-album").html($(response.data).filter("div#ctx").html());
        setEvents();
    });
}