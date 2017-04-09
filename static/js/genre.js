/**
 * Created by syuchan on 2017/04/09.
 */
function genreClick(genre) {
    $.ajax({
        url: `${location.protocol}//${location.host}/genre/${genre}`,
        type: "GET",
        timeout: 10000,
        success: function (data) {
            $("#category-album").html($(data).filter("div#ctx").html());
            setEvents();
        }
    });
}