/* Google maps custom binding */
ko.bindingHandlers.map = (function () {
    var _mapBinding = {},
        _infoWindow,
        _mapMarkers = [],
        _mapBounds,
        _map,
        _getInfoWindowContent,
        _defaultContent,
        _subscribedToMarkers = [],
        _subscriptions = [],
        _defaultAnimation;

    var defaultZoomLevel = 14;
    var maxZoomLevel = 20;

    var clearMarkers = function () {
        for (var i = 0; i < _mapMarkers.length; i++) {
            _mapMarkers[i].setMap(null);
        }

        _mapMarkers = [];
    };

    var selectMapMarker = function (marker) {
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
    };

    var isMarkerInBounds = function (marker) {
        return _map.getBounds().contains(marker.getPosition());
    };

    var allMarkersAreVisible = function () {
        return _mapMarkers.filter(function (m) { return isMarkerInBounds(m); }).length === _mapMarkers.length;
    };

    var resizeMap = function () {
        // prevent zooming too much when fitting bounds
        _map.setOptions({ maxZoom: defaultZoomLevel });
        _map.fitBounds(_mapBounds);
        // revert zoom restriction so user can zoom in more
        _map.setOptions({ maxZoom: maxZoomLevel });
    };

    var showPlaceInfo = function (mapMarker, marker) {
        if (_infoWindow) {
            _infoWindow.close();
        }

        _infoWindow = new google.maps.InfoWindow({
            content: _defaultContent
        });

        _infoWindow.open(_map, mapMarker);

        _getInfoWindowContent(marker, function (content) {
            _infoWindow.setContent(content);
        });
    };

    var selectMarkerViewModel = function (marker, markers) {
        for (var j = 0; j < markers.length; j++) {
            // unselect all markers except selected
            if (marker !== markers[j]) {
                markers[j].selected(false);
            }
        }

        marker.selected(true);
    };

    var removeExistingSubscription = function (marker) {
        var markerIndex = _subscribedToMarkers.indexOf(marker);

        if (markerIndex === -1) {
            return;
        }

        var markerSubscription = _subscriptions[markerIndex];

        if (markerSubscription) {
            markerSubscription.dispose();
        }
    };

    var recordNewSubscription = function (marker, subscription) {

        if (_subscribedToMarkers.indexOf(marker) === -1) {
            _subscribedToMarkers.push(marker);
        }

        var markerIndex = _subscribedToMarkers.indexOf(marker);
        _subscriptions[markerIndex] = subscription;
    };

    var getMarkerClickHandler = function (marker, allMarkers) {
        return function () {
            selectMarkerViewModel(marker, allMarkers);
        };
    };

    var getSelectedStateChangedHandler = function (mapMarker, marker, markers) {
        return function (selected) {
            if (selected) {
                selectMarkerViewModel(marker, markers);
                showPlaceInfo(mapMarker, marker);
                selectMapMarker(mapMarker);
            }

            if (!allMarkersAreVisible()) {
                resizeMap();
            }
        };
    };

    var placeMarkers = function (markers) {

        clearMarkers();

        if (!markers.length) {
            return;
        }

        _mapBounds = new google.maps.LatLngBounds();

        for (var i = 0; i < markers.length; i++) {
            var mapMarker = new google.maps.Marker({
                position: new google.maps.LatLng(markers[i].latitude, markers[i].longitude),
                animation: google.maps.Animation.DROP,
                draggable: false,
                map: _map
            });

            mapMarker.addListener('click', getMarkerClickHandler(markers[i], markers));

            removeExistingSubscription(markers[i]);

            var subscription = markers[i].selected.subscribe(getSelectedStateChangedHandler(mapMarker, markers[i], markers));

            recordNewSubscription(markers[i], subscription);

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

        _defaultAnimation = google.maps.Animation.BOUNCE;
        _getInfoWindowContent = ko.unwrap(mapObject.getInfoWindowContent);
        _defaultContent = ko.unwrap(mapObject.defaultContent);

        _map = new google.maps.Map(element, {
            center: { lat: lat, lng: lng },
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
} ());
