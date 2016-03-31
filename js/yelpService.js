// http://stackoverflow.com/questions/13149211/yelp-api-google-app-script-oauth
function YelpService() {
    var yelpService = {};

    var SearchApiEndpoint = 'http://api.yelp.com/v2/search';
    var DefaultTimeoutMilliseconds = 5000;

    var auth = {
        consumerKey: "vu0qenpVl7V11Ju6vp1RNg",
        consumerSecret: "T6Z4hRRL3gkuH9gQeHUhhS2bBt4",
        accessToken: "4qWApiXXt6QtM6h62EaybnZr_m_REmqK",
        // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
        // You wouldn't actually want to expose your access token secret like this in a real application.
        accessTokenSecret: "7eCB-eCrTr2uvFied_RXAIp5VtQ",
        serviceProvider: {
            signatureMethod: "HMAC-SHA1"
        }
    };

    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
    };

    var addOauthParameters = function (parameters) {
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
    };

    yelpService.search = function (query, location, country, category) {

        var getAuthRequestWithData = function() {
            //https://www.yelp.com.au/developers/documentation/v2/search_api
            var parameters = [];
            parameters.push(['term', query]);
            parameters.push(['cc', country]);
            parameters.push(['category_filter', category]);
            parameters.push(['location', location]);
            addOauthParameters(parameters);

            var message = {
                'action': SearchApiEndpoint,
                'method': 'GET',
                'parameters': parameters
            };

            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);

            return OAuth.getParameterMap(message.parameters);
        };

        var deferred = $.Deferred();

        var timeoutId = setTimeout(function () {
            deferred.reject('Yelp search request timed out after ' + DefaultTimeoutMilliseconds / 1000 + ' seconds');
        }, DefaultTimeoutMilliseconds);

        // cache must be set to true: https://groups.google.com/forum/#!searchin/yelp-developer-support/jsonp/yelp-developer-support/GK3ciCFo_2U/12KpWhhRzfUJ
        $.ajax({
            url: SearchApiEndpoint,
            data: getAuthRequestWithData(),
            dataType: 'jsonp',
            jsonpCallback: 'cb',
            cache: true,
            success: function (data, textStats, XMLHttpRequest) {
                window.clearTimeout(timeoutId);
                deferred.resolve(data, textStats, XMLHttpRequest);
            }
        });

        return deferred.promise();
    };

    return yelpService;
}
