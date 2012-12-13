// API key for http://openlayers.org. Please get your own at
// http://bingmapsportal.com/ and use that instead.
var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";

// initialize map when page ready
var map,wmsLayer,getFeatures,clickedFeature,selectControl;
var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");
var limit_feature = 20;

var init = function () {

    var vector = new OpenLayers.Layer.Vector("GPS position", {});

    var geolocate = new OpenLayers.Control.Geolocate({
        id: 'locate-control',
        geolocationOptions: {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 20000
        },
        failure:function(e){
		//alert("There was an error obtaining the geo-location: "+e);
	        switch (e.error.code) {
       	     case 0: alert(OpenLayers.i18n("There was an error while retrieving your location: ") + e.error.message); break;
	            case 1: alert(OpenLayers.i18n("The user didn't accept to provide the location: ")); break;
	            case 2: alert(OpenLayers.i18n("The browser was unable to determine your location: ") + e.error.message); break;
	            case 3: alert(OpenLayers.i18n("The browser timed out before retrieving the location.")); break;
 	       }
	}
    });
 
    wmsLayer = new OpenLayers.Layer.WMS("Vacant Land",
 	["http://v3.pozi.com/geoserver/MONASH/ows"],
	{layers: 'MONASH:VACANTLANDLIST',format: 'image/png8', transparent:'true'},
	{isBaseLayer:false,singleTile: true, ratio: 1.5, opacity: '1.0'}
    );
   
    // create map
    map = new OpenLayers.Map({
        div: "map",
        theme: null,
        projection: sm,
        units: "m",
        numZoomLevels: 20,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(
            -20037508.34, -20037508.34, 20037508.34, 20037508.34
        ),
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    interval: 100,
                    enableKinetic: true
                }
            }),
            geolocate
//            selectControl
        ],
        layers: [
            new OpenLayers.Layer.WMS("Monash Map",
 	                        ["http://v3.pozi.com/geoserver/MONASH/ows"],
                     		{layers: 'MONASH:MONMAP31',format: 'image/png8', transparent:'true'},
 				{isBaseLayer:false,singleTile: true, ratio: 1.5, opacity: '0.6'}
                     ),
            wmsLayer,
            new OpenLayers.Layer.WMS("Labels",
 	                        ["http://m1.pozi.com/geoserver/wms","http://m2.pozi.com/geoserver/wms","http://m3.pozi.com/geoserver/wms","http://m4.pozi.com/geoserver/wms"],
                     		{layers: 'LabelClassic',format: 'image/png8',transparent:'true'},
 				{isBaseLayer:false,singleTile: true, ratio: 1.5}
                     ),
            new OpenLayers.Layer.WMS("Vicmap Classic",
 	                        ["http://m1.pozi.com/geoserver/gwc/service/wms","http://m2.pozi.com/geoserver/gwc/service/wms","http://m3.pozi.com/geoserver/gwc/service/wms","http://m4.pozi.com/geoserver/gwc/service/wms"],
                     		{layers: 'VicmapClassic',format: 'image/png8'}
                    ),
            new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                transitionEffect: 'resize'
            }),
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "Road",
                // custom metadata parameter to request the new map style - only useful
                // before May 1st, 2011
                metadataParams: {
                    mapVersion: "v1"
                },
                name: "Bing Road",
                transitionEffect: 'resize'
            }),
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "Aerial",
                name: "Bing Aerial",
                transitionEffect: 'resize'
            }),
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "AerialWithLabels",
                name: "Bing Aerial + Labels",
                transitionEffect: 'resize'
            }),
            vector
        ],
        center: new OpenLayers.LonLat(16159633, -4562803),
        zoom: 19
    });

    var style = {
        fillOpacity: 0.1,
        fillColor: '#000',
        strokeColor: '#f00',
        strokeOpacity: 0.6
    };
    geolocate.events.register("locationupdated", this, function(e) {
	// Logging the event values
	var pt = new OpenLayers.LonLat(e.point.x,e.point.y);	
	var pt_google = pt.transform(gg,sm);
	
	var logMsg = "X="+e.point.x+" ("+pt_google.lon+")";
	logMsg = logMsg + "\n" + "Y="+e.point.y+" ("+pt_google.lat+")";	
	logMsg = logMsg + "\n" + "Accuracy="+e.position.coords.accuracy;
//	alert(logMsg);
	
        vector.removeAllFeatures();
        vector.addFeatures([
            new OpenLayers.Feature.Vector(
                e.point,
                {},
                {
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                }
            ),
            new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy / 2,
                    50,
                    0
                ),
                {},
                style
            )
        ]);
	// Zoom to the disc derived from GPS position and accuracy, with a max zoom level of 17
        var z = map.getZoomForExtent(vector.getDataExtent());
        map.setCenter(pt_google,Math.min(z,18));
    });

   geolocate.events.register("locationfailed", this, function(e) {
        switch (e.error.code) {
            case 0: alert(OpenLayers.i18n("There was an error while retrieving your location: ") + e.error.message); break;
            case 1: alert(OpenLayers.i18n("The user didn't accept to provide the location: ")); break;
            case 2: alert(OpenLayers.i18n("The browser was unable to determine your location: ") + e.error.message); break;
            case 3: alert(OpenLayers.i18n("The browser timed out before retrieving the location.")); break;
        }
    });

};