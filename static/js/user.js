/**
 * Created by syuchan on 2017/03/24.
 */
$(document).ready(function () {
    /*$('body').on('focus', '[contenteditable]', function () {
        const $this = $(this);
        $this.data('before', $this.html());
        return $this;
    })
        .on('blur keyup paste input', '[contenteditable]', function () {
            const $this = $(this);
            if ($this.data('before') !== $this.html()) {
                $this.data('before', $this.html());
                $this.trigger('change');
            }
            return $this;
        });

    $('.user-table [contenteditable="true"]').on("change focusout", function () {
        const id = $(this).parent().attr("data-userid");
        const name = $(this).parent().find(".user-name").text();
        const role = $(this).text();
        userExec("PUT", {
            userid: id,
            username: name,
            role: role
        });
    });*/

    $(".add-user").on("click", function () {
        $("#user-form").dialog({
            buttons: {
                '追加': function () {
                    const name = $("#form-name").val();
                    const pass = $("#form-pass").val();
                    const hash = createHash(name, pass);
                    const role = $("#form-role").val();
                    userExec("POST", {
                        username: name,
                        hash: hash,
                        role: role
                    });
                    $(this).dialog('close');
                },
                'キャンセル': function () {
                    $(this).dialog('close');
                },
            }
        });
    });

    $(".delete-user").on("click", function () {
        const id = $(this).parent().attr("data-userid");
        const name = $(this).parent().find(".user-name").text();
        const role = $(this).parent().find(".user-role").text();
        userExec("DELETE", {
            userid: id,
            username: name,
            role: role
        });
    });
});

function userExec(type, data) {
    $.ajax({
        url: `${location.protocol}//${location.host}/setting/user`,
        type: type,
        data: data,
        timeout: 10000,
        success: function () {
            location.reload();
        }
    });
}

function createHash(username, password) {
    const salt = getSHA256(username);
    let hash = "";
    for (let i = 0; i < 10000; i++) {
        hash = getSHA256(hash + salt + password);
    }
    return hash;
}

function getSHA256(str) {
    const shaObj = new jsSHA("SHA-256", "TEXT", 1);
    shaObj.update(str);
    return shaObj.getHash("HEX");
}