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
        }
    };

    var GetPlaceViewModel = function (placeData) {
        return {
            name: placeData.name,
            latitude: placeData.geometry.location.lat(),
            longitude: placeData.geometry.location.lng(),
            selected: ko.observable(false)
        }
    };

    var GetViewModel = function (mapCentreLatitude, mapCentrelongitude, placesData, placeSearchFailed) {
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

        vm.placeSearchFailed = placeSearchFailed;
        vm.mapCentreLatitude = mapCentreLatitude;
        vm.mapCentrelongitude = mapCentrelongitude;
        vm.places = ko.observableArray(placesData.map(GetPlaceViewModel));
        vm.currentFilter = ko.observable("");
        vm.filter = ko.observable("");
        vm.isDesktop = ko.observable(false);
        vm.menuHidden = ko.observable(!placeSearchFailed);

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
        
        var layoutInitialised = false;

        vm.layoutChanged = function (desktop) {
            // do not hide menu on init if place search failed 
            if(!layoutInitialised && placeSearchFailed){
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

        return vm;
    };

    var placesService = PlaceService();

    placesService.getPlaces(MapCentreLatitude, MapCentrelongitude, SearchRadiusMetres, SearchQuery, function (places, status) {
        var placeSearchFailed = status !== google.maps.places.PlacesServiceStatus.OK;
        var viewModel = GetViewModel(MapCentreLatitude, MapCentrelongitude, places, placeSearchFailed);
        ko.applyBindings(viewModel);
    });
});