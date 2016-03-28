ko.bindingHandlers.map = function () {
    var _mapBinding = {},
        _infoWindow,
        _mapMarkers = [],
        _mapBounds,
        _map,
        _defaultAnimation = google.maps.Animation.BOUNCE;

    var clearMarkers = function () {
        for (var i = 0; i < _mapMarkers.length; i++) {
            _mapMarkers[i].setMap(null);
        }

        _mapMarkers = [];
    };

    var startBouncing = function (marker) {

        for (var i = 0; i < _mapMarkers.length; i++) {
            if (marker !== _mapMarkers[i]) {
                _mapMarkers[i].setAnimation(null);
            }
        }

        if (!isBouncing(marker)) {
            marker.setAnimation(_defaultAnimation);
        }
    };

    var isBouncing = function (marker) {
        return marker.getAnimation() === _defaultAnimation;
    }

    var isMarkerInBounds = function (marker) {
        return _map.getBounds().contains(marker.getPosition());
    }

    var allMarkersAreVisible = function () {
        return _mapMarkers.filter(function (m) { return isMarkerInBounds(m); }).length === _mapMarkers.length;
    }

    var resizeMap = function () {
        _map.setOptions({ maxZoom: 14 });
        _map.fitBounds(_mapBounds);
        _map.setOptions({ maxZoom: 20 });
    };

    var openInfoWindow = function (mapMarker, marker) {
        if (_infoWindow) _infoWindow.close();

        if (marker.content) {
            _infoWindow = new google.maps.InfoWindow({
                content: marker.content
            });

            _infoWindow.open(_map, mapMarker);
        }
    };

    var updateViewModel = function (markers, marker) {
        for (var j = 0; j < markers.length; j++) {
            if (marker !== markers[j]) {
                markers[j].selected(false);
            }
        }

        marker.selected(true);
    }

    var placeMarkers = function (markers) {

        clearMarkers();

        if (!markers.length) return;

        _mapBounds = new google.maps.LatLngBounds();

        for (var i = 0; i < markers.length; i++) {
            var mapMarker = new google.maps.Marker({
                position: new google.maps.LatLng(markers[i].latitude, markers[i].longitude),
                animation: google.maps.Animation.DROP,
                draggable: false,
                map: _map
            });

            mapMarker.addListener('click', function (mm, m) {
                return function () {
                    updateViewModel(markers, m);
                }
            }(mapMarker, markers[i]));

            markers[i].selected.subscribe(function (mm, m) {
                return function (selected) {
                    if (selected) {
                        updateViewModel(markers, m);
                        openInfoWindow(mm, m);
                        startBouncing(mm);
                    }

                    if (!allMarkersAreVisible()) {
                        resizeMap();
                    }
                }
            }(mapMarker, markers[i]));

            _mapMarkers.push(mapMarker);
            _mapBounds.extend(mapMarker.position);
        }

        resizeMap();
    };

    _mapBinding.init = function (element, valueAccessor) {
        var mapObject = valueAccessor(),
            markers = mapObject.markers();

        _map = new google.maps.Map(element);

        placeMarkers(markers);
    };

    _mapBinding.update = function (element, valueAccessor) {
        var mapObject = valueAccessor(),
            markers = mapObject.markers();

        placeMarkers(markers);
    };

    return _mapBinding;
}();


ko.bindingHandlers.media = function () {
    var _mediaBinding = {};

    _mediaBinding.init = function (element, valueAccessor) {
        var mediaObject = valueAccessor();
        var mediaQuery = mediaObject.query;

        var mq = window.matchMedia(mediaQuery);

        mediaObject.changed(mq.matches);

        mq.addListener(function () {
            mediaObject.changed(mq.matches);
        });
    };

    return _mediaBinding;
}();