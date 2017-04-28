/**
 * Created by syuchan on 2017/04/28.
 */
function categoryClick(page, value) {
    axios({
        url: `${location.protocol}//${location.host}/${page}/${value}`,
        method: "GET"
    }).then(function (response) {
        $("#category-album").html($(response.data).filter("div#ctx").html());
        setEvents();
    });
}