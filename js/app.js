var googleMapError = function () {
    $(".google-maps-load-error").show();
};

var initMap = function () {
        var MapCentreLatitude = -33.862856,
        MapCentrelongitude = 151.210482,
        SearchRadiusMetres = 30000,
        SearchQuery = 'dental clinic',
        Country = 'AU',
        City = 'Sydney',
        Category = 'health';

    var GetPlaceViewModel = function (placeData) {
        return {
            name: placeData.name,
            latitude: placeData.geometry.location.lat(),
            longitude: placeData.geometry.location.lng(),
            selected: ko.observable(false)
        };
    };

    var GetViewModel = function (mapCentreLatitude, mapCentrelongitude, placesData, placeSearchFailed) {
        var vm = {};

        var yelpService = YelpService();

        var unselectPlaces = function (places) {
            for (var i = 0; i < places.length; i++) {
                places[i].selected(false);
            }
        };

        var getFilteredPlaces = function () {
            return ko.utils.arrayFilter(vm.places(), function (object) {
                return object.name.toLowerCase().indexOf(vm.currentFilter().toLowerCase()) !== -1;
            });
        };

        // finding the nearest business using naive implementation
        var getNearestBusiness = function (businesses, markerData) {

            return businesses.slice().sort(function (a, b) {
                var diffA = Math.abs(a.location.coordinate.latitude - markerData.latitude) + Math.abs(a.location.coordinate.longitude - markerData.longitude);
                var diffB = Math.abs(b.location.coordinate.latitude - markerData.latitude) + Math.abs(b.location.coordinate.longitude - markerData.longitude);

                return diffA - diffB;
            })[0];
        };

        var getPlaceDetails = function (data, markerData) {

            var notAvailable = "n/a";

            /* jshint -W069 */
            var phone = (data && data.businesses.length) ? getNearestBusiness(data.businesses, markerData)["display_phone"] || notAvailable : notAvailable;
            /* jshint +W069 */

            return ko.renderTemplateX("placeInfo", { name: markerData.name, phone: phone });
        };

        vm.placeSearchFailed = placeSearchFailed;
        vm.mapCentreLatitude = mapCentreLatitude;
        vm.mapCentrelongitude = mapCentrelongitude;
        vm.places = ko.observableArray(placesData.map(GetPlaceViewModel));
        vm.currentFilter = ko.observable("");
        vm.filter = ko.observable("");
        vm.isDesktop = ko.observable(false);
        vm.menuHidden = ko.observable(!placeSearchFailed);
        vm.defaultContent = ko.renderTemplateX("defaultInfo");

        vm.filteredPlaces = ko.computed(function () {
            return vm.currentFilter() ? getFilteredPlaces() : vm.places();
        });

        vm.menuShown = ko.computed(function () {
            return !vm.menuHidden();
        });

        vm.doFilter = function () {
            vm.currentFilter(vm.filter());
            unselectPlaces(vm.filteredPlaces());
            // force map binding to rerender map markers
            vm.currentFilter.valueHasMutated();
        };

        vm.selectPlace = function (place) {
            var allPlacesExceptSelected = vm.filteredPlaces().filter(function (p) { return p != place; });
            unselectPlaces(allPlacesExceptSelected);
            place.selected(true);

            if (!vm.isDesktop()) {
                vm.menuHidden(true);
            }
        };

        var layoutInitialised = false;

        vm.layoutChanged = function (desktop) {
            // do not hide menu on init if place search failed
            if (!layoutInitialised && placeSearchFailed) {
                vm.menuHidden(false);
                layoutInitialised = true;
                return;
            }

            vm.isDesktop(desktop);

            if (desktop) {
                vm.menuHidden(false);
                return;
            }

            vm.menuHidden(true);
        };

        vm.toggleSideMenu = function () {
            var hidden = vm.menuHidden();
            vm.menuHidden(!hidden);
        };

        vm.getInfoWindowContent = function (markerData, gotContentCallback) {
            yelpService
                .search(markerData.name, City, Country, Category)
                .done(function (data) {
                    var content = getPlaceDetails(data, markerData);
                    gotContentCallback(content);
                })
                .fail(function (error) {
                    var errorContent = ko.renderTemplateX("getPlaceError", { error: error });
                    gotContentCallback(errorContent);
                });
        };

        return vm;
    };

    var placesService = PlaceService();

    placesService.getPlaces(MapCentreLatitude, MapCentrelongitude, SearchRadiusMetres, SearchQuery, function (places, status) {
        var placeSearchFailed = status !== google.maps.places.PlacesServiceStatus.OK;
        var viewModel = GetViewModel(MapCentreLatitude, MapCentrelongitude, places, placeSearchFailed);
        ko.applyBindings(viewModel);
    });
};
