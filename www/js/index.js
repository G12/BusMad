/**
 * IM RJ TW
 */

var google_map; //google.maps.Map
var lat_in = 45.3469;
var lng_in = -75.7598;
var city_code = "oc";
var mode = "dynamic";
var zoom_level = 17;
var wait_widow = "wait_window"

var IS_QUIK = false;
var IS_DEBUG = false;

$(document).ready(function ()
{
    $.support.cors = true;

    //alert("Set Breakpoints Now");

    $(document).bind('deviceready', function ()
    {

        startUpPage.init("start_up_page", "map_canvas", "bus_list", "status_page");
        startUpPage.checkConnection();
        //Status page initialization
        statusPage.init("status_page", "status_list", "refresh_btn", "map_btn");
        busListPage.init("bus_list");

        //Restart
        document.getElementById("cancel_wait").addEventListener('click', function ()
        {
            controller.startGeoLocation(IS_DEBUG);
        }, false);

        if (IS_QUIK)
        {
            controller = new SurrealRanch_Controller.Controller(lat_in, lng_in, city_code, mode, zoom_level, wait_widow);
            controller.document_width = $(document).width();
            controller.document_height = $(document).height();
            controller.quickInit('map_canvas', 'wait_window');

            var url = "http://geopad.ca/js/get_json_for.php?trips=3017b77_560b94_468b95_112";
            statusPage.makeList(url);
            google.maps.event.addListener(statusPage, 'make_status_done', function (status) {
                controller.hideWaitWindow();
                if (status == "SUCCESS") {
                    //alert(status);
                    controller.hideMap();
                    statusPage.showPage();
                }
                else {
                    alert(status);
                }
            });
        }
        else
        {
            controller = new SurrealRanch_Controller.Controller(lat_in, lng_in, city_code, mode, zoom_level, wait_widow);
            controller.startGeoLocation(IS_DEBUG);
            controller.document_width = $(document).width();
            controller.document_height = $(document).height();

            google.maps.event.addListener(controller.peg_marker, 'geolocation_error', function (errMsg) {
                document.getElementById("wait_msg").innerHTML = errMsg;
                document.getElementById("refresh_btn").className = "show";
            });

            google.maps.event.addListener(controller.peg_marker, 'geolocation_done', function(result)
            {
                google_map = controller.initialize(result, 'map_canvas', 'wait_window');

                google.maps.event.addListener(controller, 'draw_routes_error', function(errMsg)
                {
                    controller.hideWaitWindow();
                    alert(errMsg);
                });

                google.maps.event.addListener(statusPage, 'make_status_done', function (status) {
                    controller.hideWaitWindow();
                    if (status == "SUCCESS") {
                        controller.hideMap();
                        statusPage.showPage();
                        document.getElementById("bus_list").className = "hide";
                    }
                    else {
                        alert(status);
                    }
                });
            });
        }
    });
});

