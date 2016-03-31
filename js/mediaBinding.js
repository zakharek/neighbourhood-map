/* Media query custom binding */
ko.bindingHandlers.media = (function () {
    var _mediaBinding = {};

    _mediaBinding.init = function (element, valueAccessor) {
        var mediaObject = valueAccessor(),
            mediaQuery = mediaObject.query,
            mq = window.matchMedia(mediaQuery);

        // changed event is triggered every time media query is applied or unapplied
        mq.addListener(function () {
            mediaObject.changed(mq.matches);
        });

        // trigger changed event initially to notify of currently applied media query
        mediaObject.changed(mq.matches);
    };

    return _mediaBinding;
} ());
