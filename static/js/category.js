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
            const album = $("#category-album");
            album.html($(response.data).filter("div#ctx").html());
            if ($(".back-btn").css("display") !== "none") {
                album.css("display", "inline");
                $("#category-list").css("display", "none");
                $(window).trigger("page");
            }
            setEvents();
        });
    });
    $(".back-btn").on("click", function () {
        $("#category-album").css("display", "none");
        $("#category-list").css("display", "inline");
    });
});