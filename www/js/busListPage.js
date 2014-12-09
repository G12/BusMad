////////////////////////////////////// Button Handler //////////////////////////////////////
//
//		Called when a button on the info window is pushed
//
////////////////////////////////////////////////////////////////////////////////////////////
function buttonHandler(id)
{
    switch (id) {
        case 1: //Compiles all selected routes into a query string param opens status page 
            var trips = controller.bus_list.makeTripString();
            var url = "http://geopad.ca/js/get_json_for.php?trips=" + trips;
            statusPage.makeList(url);
            break;
        case 2: //Close bus list
            document.getElementById("bus_list").className = "hide";
            document.getElementById("map_canvas").className = "show";
            break;
        case 3: //Draws Routes and Shows incoming Buses for current selection
            controller.showWaitWindow();
            controller.drawBusRoutes();
            document.getElementById("bus_list").className = "hide";
            document.getElementById("map_canvas").className = "show";
            break;
        default:
            var url = "#";
            break;
    }
}

/////////////////////////////////////////// Click Route ////////////////////////////////////////////
//
//		Called when a Bus Route Selection is made from the info window
//		Adds and Removes bus route selections from the SurrealRanch_Collections.BusList object
//
////////////////////////////////////////////////////////////////////////////////////////////////////
function clickRoute(route_number, stop_id, stop_code, headsign_id) {
    if (controller.bus_list.Add(route_number, stop_id, stop_code, headsign_id)) {
        document.getElementById(route_number + '_' + stop_id + '_' + headsign_id).style.backgroundColor = '#FF9933';
    }
    else {
        document.getElementById(route_number + '_' + stop_id + '_' + headsign_id).style.backgroundColor = '#FFFFFF';
    }
    if (controller.bus_list.buses.length) {
        var btn1 = document.getElementById('ok1')
        btn1.style.color = 'black';
        btn1.disabled = false;
    }
    else {
        var btn1 = document.getElementById('ok1')
        btn1.style.color = 'white';
        btn1.disabled = true;
    }
}

var busListPage = {
    bus_list_page: null,
    errMsg: null,
    init: function (bus_list_id) {
        this.bus_list_page = document.getElementById(bus_list_id);
    },
    showPage: function ()
    {

    },
    /////////////////////////////////// Make Route Table(list) ////////////////////////////////////
    //
    //		Called when a Stop Marker is clicked
    //		Draws the list of Bus Routes for the selected Bus Stop
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////
    makeRouteTable: function (marker_index)
    {
        //Clear any previous selection (only allow monitoring from one stop for now)
        controller.bus_list.buses = [];
        controller.stop_list.CloseCurrentInfoWindow();
        var marker = controller.stop_list.getAt(marker_index);
        marker.setInfoWindowContent("");
        var url = "http://geopad.ca/js/get_json_bus_list.php?stop_id=" + marker.stop_id + "&city_code=" + city_code;
        $.get(url, {}, function (obj)
        {
            var my_marker = controller.stop_list.getAtCurrent();
            var str = '<div class="header"><input style="color:white" id="ok1" disabled="disabled" type="button" value="Show Arrivals for Selected Routes" onclick="buttonHandler(1)"/>&nbsp;&nbsp;&nbsp;';
            str += '<input style="color:white" id="ok2" type="button" value="Close" onclick="buttonHandler(2)"/><br/>';
            str += '<small><i>Click on the Routes you wish to Monitor</i></small><br/></div>';

            str += '<div class="stop">';
            //var obj = eval('(' + json + ')');
            var routes = obj.routes;
            var button = 'img/stop_button.png';
            for (var i = 0; i < routes.length; i++) {
                var num = routes[i].route_number;
                var trip_headsign = routes[i].trip_headsign;
                var headsign_id = routes[i].headsign_id;
                //TODO Split the number off headsign
                var id = num + '_' + my_marker.stop_id + '_' + headsign_id;
                var click = "javascript:clickRoute('" + num + "','" + my_marker.stop_id + "','" + my_marker.stop_code + "','" + headsign_id + "')";
                str += '<div id="' + id + '" class="button_bar" onclick="' + click + '"><span class="pic_button" ></span><span class="text_button" ><b>' + num + '</b><br/>' + trip_headsign + '</span></div>'

            }
            str += '</div>';

            document.getElementById("status_page").className = "hide";
            document.getElementById("map_canvas").className = "hide";

            //TODO fix wait_window
            document.getElementById("wait_window").className = "hide";

            document.getElementById("bus_list").className = "show";
            document.getElementById("bus_list").innerHTML = str;

        }).error(function (e)
        {
            alert("Ajax Error: " + e.responseText);
        });
    }

};