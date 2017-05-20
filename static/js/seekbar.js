/**
 * Created by syuchan on 2017/05/09.
 */
function SeekBar() {
    const instance = this;
    const $document = $(document);
    const $thumb = $(".seekbar .thumb");
    const $seekbar = $(".seekbar");
    $thumb.on("mousedown touchstart", function (e) {
        if (e.which === 1 || e.originalEvent.touches) {
            instance.thumbSeeking = true;
            instance._trigger('mousedown');
        }
        return false;
    });
    $seekbar.on("mousedown", function (e) {
        if (e.which === 1) {
            instance.setSeekValue(e.offsetX / $seekbar.width() * instance.maxValue);
            instance.thumbSeeking = true;
            instance._trigger('mousedown');
            instance._trigger('input');
        }
    });
    $document.on("mousemove touchmove", function (e) {
        if (instance.thumbSeeking) {
            const x = Math.min(Math.max((e.pageX || e.originalEvent.touches[0].pageX) - $seekbar.offset().left, 0), $seekbar.width() - $thumb.width());
            instance.setSeekValue(x / $seekbar.width() * instance.maxValue);
            instance._trigger('input');
        }
    });
    $document.on("mouseup touchend", function () {
        if (instance.thumbSeeking) {
            instance.thumbSeeking = false;
            instance._trigger('mouseup');
        }
    });
}

SeekBar.prototype = {
    thumbSeeking : false,
    maxValue : 100,
    value : 0,
    events : {},
    setBufferedAudio : function (buffered) {
        const $buffered = $(".buffered-tracks");
        $buffered.html("");
        for (let i = 0; i < buffered.length; i++) {
            const margin = buffered.start(i) / this.maxValue * 100;
            const width = buffered.end(i) / this.maxValue * 100;
            const div = $(`<div style='margin-left: ${margin}%;width: ${width - margin}%'></div>`);
            if (margin === 0) {
                div.css("border-top-left-radius", "8px");
                div.css("border-bottom-left-radius", "8px");
            }
            if (width === 100) {
                div.css("border-top-right-radius", "8px");
                div.css("border-bottom-right-radius", "8px");
            }
            $buffered.append(div);
        }
    },
    setSeekMaxValue : function (setValue) {
        this.maxValue = setValue;
        this._renderSeekBar();
    },
    setSeekValue : function (setValue) {
        this.value = setValue;
        this._renderSeekBar();
    },
    getSeekValue : function () {
        return this.value;
    },
    addEvent : function (eventname, func) {
        this.events[eventname] = func;
    },
    _trigger : function (eventname) {
        if (this.events[eventname]) this.events[eventname]();
    },
    _renderSeekBar : function () {
        $(".seekbar .thumb").css("margin-left", this.value / this.maxValue * $(".seekbar").width());
    }
};