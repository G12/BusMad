/// <reference path="startup.js" />
/// <reference path="statusPage.js" />
/// <reference path="SurrealRanch_Controller.js" />


/**
 * IM RJ TW
 */

var google_map; //google.maps.Map
var lat_in = 45.3469;
var lng_in = -75.7598;
var city_code = "oc";
var mode = "dynamic";
var zoom_level = 17;

var zoom_dbl_click = 15;
var zoom_after_dbl_click = 16;

var map_initialized = false;
var g_url = null;
var g_platform = "UNKNOWN";

var IS_DEBUG = false;

$(document).ready(function ()
{
    $.support.cors = true;

    //alert("Set Breakpoints Now");

    $(document).bind('deviceready', function ()
    {
        g_platform = device.platform; // look for "Android"
        startUpPage.init("start_up_page", "map_canvas", "bus_list", "status_page");
        startUpPage.checkConnection();
        //Status page initialization
        statusPage.init("status_page", "status_list", "refresh_btn", "map_btn");
        busListPage.init("bus_list");
        startUpPage.setAppStatus("Platform: " + g_platform);

        google.maps.event.addListener(statusPage, 'make_status_done', function (status) {
            if (status == "SUCCESS") {
                startUpPage.openPage(STATUS_PAGE);
            }
            else {
                alert(status);
            }
        });
        //Open Home Page
        document.getElementById("home_btn").addEventListener('click', function ()
        {
            if(startUpPage.getCurrentPage() == STATUS_PAGE)
            {
                //TODO improve this HACK
                //Parse the url to get current stop and bus numbers
                var arr0 = g_url.split("trips=");
                var arr1 = arr0[1].split("b");
                var stop_number = arr1[0];
                var arr = arr1[1].split("_");
                startUpPage.setStopNumber(stop_number);
                if (arr1.length == 2)
                {
                    startUpPage.setBusNumber(arr[0]);
                }
                else
                {
                    //TODO add comma seperated list
                    startUpPage.setBusNumber("");
                }
            }
            else {
                startUpPage.setStopNumber(controller.getStopCodeFor(0));
                if (controller.bus_list.getLength() == 1)
                {
                    startUpPage.setBusNumber(controller.getBusNumberFor(0));
                }
            }
            startUpPage.openPage(HOME_PAGE);
        });
        //Open Status Page using current url
        document.getElementById("status_btn").addEventListener('click', function ()
        {
            if (startUpPage.getCurrentPage() == HOME_PAGE)
            {
                var stop = document.getElementById("stop_number").value;
                var bus = document.getElementById("bus_number").value;
                if (stop.length > 0 && bus.length > 0)
                {
                    var trips = stop + "b" + bus;
                    g_url = "http://geopad.ca/js/get_json_for.php?trips=" + trips;
                }
                if(g_url)
                {
                    statusPage.makeList(g_url);
                }
            }
            else
            {
                if (controller.bus_list.getLength() > 0)
                {
                    var trips = controller.bus_list.makeTripString();
                    g_url = "http://geopad.ca/js/get_json_for.php?trips=" + trips;
                    statusPage.makeList(g_url);
                    startUpPage.setStopNumber(controller.getStopCodeFor(0));
                    if(controller.bus_list.getLength() == 1)
                    {
                        startUpPage.setBusNumber(controller.getBusNumberFor(0));
                    }
                }
            }
        });
        document.getElementById("map_btn").addEventListener('click', function ()
        {
            if (startUpPage.getCurrentPage() == MAP_PAGE)
            {
                LatLngBounds = google_map.getBounds();
                ne = LatLngBounds.getNorthEast();
                sw = LatLngBounds.getSouthWest();
                //alert("NE lat-lng: " + ne.lat() + "-" + ne.lng() + " SW lat-lng: " + sw.lat() + "-" + sw.lng())
                controller.drawStops(sw.lat(), ne.lat(), sw.lng(), ne.lng(), true, true);
                //var zoomLevel = google_map.getZoom();
                //controller.forceZoomUpdate();
            }
            else if (map_initialized)
            {
                startUpPage.openPage(MAP_PAGE);
            }
            else
            {
                startUpPage.setAppStatus("Getting Geographic information. Please wait.")
                controller = new SurrealRanch_Controller.Controller(lat_in, lng_in, city_code, mode, zoom_level);
                controller.startGeoLocation(IS_DEBUG);
                controller.document_width = $(document).width();
                controller.document_height = $(document).height();

                google.maps.event.addListener(controller.peg_marker, 'geolocation_error', function (errMsg) {
                    startUpPage.setAppStatus(errMsg);
                    startUpPage.openPage(MAP_PAGE);
                });

                google.maps.event.addListener(controller.peg_marker, 'geolocation_done', function (result)
                {
                    google_map = controller.initialize(result, 'map_canvas'); //, 'wait_window');
                    google.maps.event.addListener(controller, 'draw_routes_error', function (errMsg) {
                        controller.hideWaitWindow();
                        alert(errMsg);
                    });
                    map_initialized = true;
                    startUpPage.setAppStatus("");
                    startUpPage.openPage(MAP_PAGE);

                    google.maps.event.addListener(google_map, 'dblclick', function (event) {
                        controller.allowZoomUpdate = false;
                        google_map.setCenter(event.latLng);
                        google_map.setZoom(zoom_dbl_click);
                        LatLngBounds = google_map.getBounds();
                        ne = LatLngBounds.getNorthEast();
                        sw = LatLngBounds.getSouthWest();
                        controller.drawStops(sw.lat(), ne.lat(), sw.lng(), ne.lng(), true, false);
                        controller.allowZoomUpdate = true;
                        google_map.setZoom(zoom_after_dbl_click);
                    });
                });
            }
        });
    });
});

