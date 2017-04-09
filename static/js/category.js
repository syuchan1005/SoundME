/**
 * Created by syuchan on 2017/04/09.
 */
function artistClick(artist) {
    $.ajax({
        url: `${location.protocol}//${location.host}/artist/${artist}`,
        type: "GET",
        timeout: 10000,
        success: function (data) {
            $("#category-album").html($(data).filter("div#ctx").html());
            setEvents();
        }
    });
}