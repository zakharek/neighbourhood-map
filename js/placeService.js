function PlaceService() {
    var placeService = {};

    var mapContainer = document.createElement("div");
    var service = new google.maps.places.PlacesService(new google.maps.Map(mapContainer));

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
