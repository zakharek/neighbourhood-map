$(function () {

    var MapCentreLatitude = -33.862856,
        MapCentrelongitude = 151.210482,
        SearchRadiusMetres = 30000,
        SearchQuery = 'dental clinic';

    var GetMarker = function (place) {
        return {
            latitude: place.latitude,
            longitude: place.longitude,
            selected: place.selected,
            content: place.name
        };
    };

    var GetPlaceViewModel = function (placeData) {
        var vm = {};

        vm.name = placeData.name;
        vm.latitude = placeData.geometry.location.lat();
        vm.longitude = placeData.geometry.location.lng();
        vm.selected = ko.observable(false);

        return vm;
    };

    var GetViewModel = function (placesData) {
        var vm = {};

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

        vm.places = ko.observableArray(placesData.map(GetPlaceViewModel));
        vm.currentFilter = ko.observable("");
        vm.filter = ko.observable("");
        vm.isDesktop = ko.observable(false);
        vm.menuHidden = ko.observable(false);

        vm.filterPlaces = ko.computed(function () {
            return vm.currentFilter()
                ? getFilteredPlaces()
                : vm.places();
        });

        vm.markers = ko.computed(function () {
            return vm.filterPlaces().map(GetMarker);
        });

        vm.menuShown = ko.computed(function () {
            return !vm.menuHidden();
        });

        vm.doFilter = function () {
            vm.currentFilter(vm.filter());
            unselectPlaces(vm.filterPlaces());
            // force map binding to rerender map markers
            vm.currentFilter.valueHasMutated();
        };

        vm.selectPlace = function (place) {
            var allPlacesExceptSelected = vm.filterPlaces().filter(function (p) { return p != place });
            unselectPlaces(allPlacesExceptSelected);
            place.selected(true);

            if (!vm.isDesktop()) {
                vm.menuHidden(true);
            }
        };

        vm.layoutChanged = function (desktop) {
            vm.isDesktop(desktop);

            if (desktop) {
                vm.menuHidden(false);
                return;
            }

            vm.menuHidden(true);
        }

        vm.toggleSideMenu = function () {
            var hidden = vm.menuHidden();
            vm.menuHidden(!hidden);
        }

        return vm;
    };

    var placesService = PlaceService();

    placesService.getPlaces(MapCentreLatitude, MapCentrelongitude, SearchRadiusMetres, SearchQuery, function (places) {
        var viewModel = GetViewModel(places);
        ko.applyBindings(viewModel);
    });
});