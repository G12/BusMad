/// <reference path="startup.js" />

var busListPage = {
    bus_list_page: null,
    errMsg: null,
    isSimple: false,
    busList: "",
    busArray: null,
    init: function (bus_list_id) {
        this.bus_list_page = document.getElementById(bus_list_id);
    },
    showPage: function ()
    {

    },
    openBusListUsing: function (stop_id, stop_code, citycode) {
        this.isSimple = true;
        this.busList = stop_code;
        this.busArray = [];
        var url = "http://geopad.ca/js/get_json_bus_list.php?stop_id=" + stop_id + "&city_code=" + citycode;
        $.get(url, {}, function (obj) {
            var routes = obj.routes;
            str = '<div class="stop">';
            var button = 'img/stop_button.png';
            for (var i = 0; i < routes.length; i++) {
                var num = routes[i].route_number;
                var trip_headsign = routes[i].trip_headsign;
                var headsign_id = routes[i].headsign_id;
                //TODO Split the number off headsign
                var id = num + '_' + stop_id + '_' + headsign_id;
                var click = "javascript:busListPage.clickRoute('" + num + "','" + stop_id + "','" + stop_code + "','" + headsign_id + "')";
                str += '<div id="' + id + '" class="button_bar" onclick="' + click + '"><span class="pic_button" ></span><span class="text_button" ><b>' + num + '</b><br/>' + trip_headsign + '</span></div>'
            }
            str += '</div>';
            busListPage.bus_list_page.innerHTML = str;
            startUpPage.openPage(BUS_LIST_PAGE);
        }).error(function (e) {
            alert("Ajax Error: " + e.responseText);
        });
    },
    openBusList: function (stop_id, citycode)
    {
        this.isSimple = false;
        var url = "http://geopad.ca/js/get_json_bus_list.php?stop_id=" + stop_id + "&city_code=" + citycode;
        $.get(url, {}, function (obj) {
            var my_marker = controller.stop_list.getAtCurrent();
            var routes = obj.routes;
            if (routes.length == 1) {
                var route_number = routes[0].route_number;
                var trip_headsign = routes[0].trip_headsign;
                var headsign_id = routes[0].headsign_id;
                controller.bus_list.Add(route_number, my_marker.stop_id, my_marker.stop_code, headsign_id);
                var trips = controller.bus_list.makeTripString();
                g_url = "http://geopad.ca/js/get_json_for.php?trips=" + trips;
                statusPage.makeList(g_url);
            }
            else {
                str = '<div class="stop">';
                var button = 'img/stop_button.png';
                for (var i = 0; i < routes.length; i++) {
                    var num = routes[i].route_number;
                    var trip_headsign = routes[i].trip_headsign;
                    var headsign_id = routes[i].headsign_id;
                    //TODO Split the number off headsign
                    var id = num + '_' + my_marker.stop_id + '_' + headsign_id;
                    var click = "javascript:busListPage.clickRoute('" + num + "','" + my_marker.stop_id + "','" + my_marker.stop_code + "','" + headsign_id + "')";
                    str += '<div id="' + id + '" class="button_bar" onclick="' + click + '"><span class="pic_button" ></span><span class="text_button" ><b>' + num + '</b><br/>' + trip_headsign + '</span></div>'
                }
                str += '</div>';
                busListPage.bus_list_page.innerHTML = str;
                startUpPage.openPage(BUS_LIST_PAGE);
            }
        }).error(function (e) {
            alert("Ajax Error: " + e.responseText);
        });
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
        this.openBusList(marker.stop_id, city_code); //NOTE city_code is defined in index.js TODO 
    },
    /////////////////////////////////////////// Click Route ////////////////////////////////////////////
    //
    //		Called when a Bus Route Selection is made
    //		Adds and Removes bus route selections from the SurrealRanch_Collections.BusList object
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    clickRoute: function (route_number, stop_id, stop_code, headsign_id)
    {
        if (this.isSimple)
        {
            if (this.busArray.length == 0)
            {
                document.getElementById(route_number + '_' + stop_id + '_' + headsign_id).style.backgroundColor = '#FF9933';
                this.busArray.push(route_number);
                return;
            }
            //Remove
            for (var i = 0; i < this.busArray.length; i++)
            {
                if(this.busArray[i] == route_number)
                {
                    document.getElementById(route_number + '_' + stop_id + '_' + headsign_id).style.backgroundColor = '#FFFFFF';
                    this.busArray.splice(i, 1);
                    return;
                }
            }
            document.getElementById(route_number + '_' + stop_id + '_' + headsign_id).style.backgroundColor = '#FF9933';
            this.busArray.push(route_number);

        }
        else
        {
            if (controller.bus_list.Add(route_number, stop_id, stop_code, headsign_id)) {
                document.getElementById(route_number + '_' + stop_id + '_' + headsign_id).style.backgroundColor = '#FF9933';
            }
            else {
                document.getElementById(route_number + '_' + stop_id + '_' + headsign_id).style.backgroundColor = '#FFFFFF';
            }
        }
    },
};