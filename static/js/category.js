/**
 * Created by syuchan on 2017/04/28.
 */
$(window).on("page", function () {
    $(".category-item").on("click", function () {
        const item = $(this);
        axios({
            url: `${location.protocol}//${location.host}/${item.parent().attr("data-type")}/${item.find("div").text()}`,
            method: "GET"
        }).then(function (response) {
            $("#category-album").html($(response.data).filter("div#ctx").html());
            setEvents();
        });
    });
});