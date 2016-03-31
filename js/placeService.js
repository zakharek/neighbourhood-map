function PlaceService() {
    var placeService = {};

    // This is a hack to do place search without having to add map object to the page
    var dummyMapContainer = document.createElement("div");
    var dummyMap = new google.maps.Map(dummyMapContainer);
    var service = new google.maps.places.PlacesService(dummyMap);

    placeService.getPlaces = function (latitude, longitude, radiusMetres, query, callback) {

        var request = {
            location: new google.maps.LatLng(latitude, longitude),
            radius: radiusMetres.toString(),
            query: query
        };

        service.textSearch(request, callback);
    };

    return placeService;
}
