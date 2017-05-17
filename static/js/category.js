/**
 * Created by syuchan on 2017/04/28.
 */
$(window).off("page.category");
$(window).on("page.category", function () {
    $(".category-item")
        .off("click.category")
        .on("click.category", function () {
        const item = $(this);
        axios({
            url: `${location.protocol}//${location.host}${location.pathname}/${item.find("div").text()}`,
            method: "GET"
        }).then(function (response) {
            const album = $("#category-album");
            album.find(".scrollable").html($(response.data).filter("div#ctx").html());
            const backButton = $(".back-btn");
            if (backButton.css("display") !== "none") {
                album.css("display", "inline");
                $("#category-list").css("display", "none");
                $(window).trigger("page");
            }
            setSongEvents();
            backButton.on("click.category", function () {
                $("#category-album").css("display", "none");
                $("#category-list").css("display", "block");
            });
        });
    });
});

$(window).off("resize.category");
$(window).on("resize.category", function () {
    const list = $("#category-list");
    const btn = $(".back-btn");
    if (btn.css("display") === "none" && list.css("display") === "none") {
        list.css("display", "block");
    } else if (btn.css("display") === "inline" && list.css("display") === "block") {
        list.css("display", "none");
    }
});