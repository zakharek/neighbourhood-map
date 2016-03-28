/* Google maps custom binding */
ko.bindingHandlers.map = function () {
    var _mapBinding = {},
        _infoWindow,
        _mapMarkers = [],
        _mapBounds,
        _map,
        _defaultAnimation = google.maps.Animation.BOUNCE;

    var defaultZoomLevel = 14;
    var maxZoomLevel = 20;

    var clearMarkers = function () {
        for (var i = 0; i < _mapMarkers.length; i++) {
            _mapMarkers[i].setMap(null);
        }

        _mapMarkers = [];
    };

    var startBouncing = function (marker) {
        // stop animation for all markers except selected
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
        // prevent zooming too much when fitting bounds
        _map.setOptions({ maxZoom: defaultZoomLevel });
        _map.fitBounds(_mapBounds);
        // revert zoom restriction so user can zoom in more
        _map.setOptions({ maxZoom: maxZoomLevel });
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

    var selectMarkerViewModel = function (marker, markers) {
        for (var j = 0; j < markers.length; j++) {
            // unselect all markers except selected
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
                    selectMarkerViewModel(m, markers);
                }
            }(mapMarker, markers[i]));

            markers[i].selected.subscribe(function (mm, m) {
                return function (selected) {
                    if (selected) {
                        selectMarkerViewModel(m, markers);
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
            markers = ko.unwrap(mapObject.markers),
            lat = ko.unwrap(mapObject.lat),
            lng = ko.unwrap(mapObject.lng);

        _map = new google.maps.Map(element, {
            center: {lat: lat, lng: lng},
            zoom: defaultZoomLevel
        });

        placeMarkers(markers);
    };

    _mapBinding.update = function (element, valueAccessor) {
        var mapObject = valueAccessor(),
            markers = mapObject.markers();

        placeMarkers(markers);
    };

    return _mapBinding;
}();

/* Media query custom binding */
ko.bindingHandlers.media = function () {
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
}();