var statusPage = {
    status_page: null,
    status_list: null,
    _url: null,
    errMsg: null,
    init: function (status_page_id, status_list_id, refresh_btn_id, map_btn_id)
    {
        this.status_page = document.getElementById(status_page_id);
        this.status_list = document.getElementById(status_list_id);
        document.getElementById(refresh_btn_id).addEventListener('click', this.onRefresh.bind(this), false);
        document.getElementById(map_btn_id).addEventListener('click', this.onShowMap.bind(this), false);
    },
    //Button clicks
    onRefresh: function()
    {
        this.updateList();
    },
    onShowMap: function()
    {
        //Bad Bad does not work now Why?
        //Just a big waste of time
        //alert("Notification Test!");
        //window.plugin.notification.local.add({ message: 'Great Bus app!', sound: 'TYPE_ALARM' });
        //alert("Test Done");
        controller.showMap();
        this.hidePage();
    },
    updateList: function()
    {
        var count = 0;
        console.log("url:" + this._url);
        $.get(this._url, {}, function (json)
        {
            statusPage.status_list.innerHTML = "";
            var html = '<div class="bus_info_list">';
            console.log(JSON.stringify(json));
            //statusPage.status_list.innerHTML = json;
            var stops = json.stops;
            for (var i = 0; i < stops.length; i++) {
                var stop = stops[i];
                
                html += "<h2 class='bus_stop'>" + stop.stop_no + " - " + stop.stop_name + "</h2>";
                html += "<div class='bus_route'>";
                var routes = stop.routes;
                for (var j = 0; j < routes.length; j++) {
                    var route = routes[j];
                    var trips = route.trips;
                    if (trips.length == 0) {
                        html += "<img src='img/oc_bus_button.png' class='route_icon'/><h3 class='bus_title'>" + route.route_no + "</h3>";
                        html += "<h4 class='no_bus'>This route is not running at this time.</h4>";
                        count++;
                    }
                    else {
                        for (var k = 0; k < trips.length; k++) {
                            count++;
                            var trip = trips[k];
                            html += "<div class='route_block'><img src='img/oc_bus_button.png' class='route_icon'/><h3 class='bus_title'>" + route.route_no + " - " + trip.RouteLabel + "</h3></div>";
                            //html += "<h4>" + trip.Direction + "</h4>";
                            
                            var tripsForStop = trip.tripsForStop;
                            if (tripsForStop.length == 0) {
                                html += "<h4 class='no_bus'>There are no scheduled buses at this time.</h4>";
                            }
                            else {
                                for (var l = 0; l < tripsForStop.length; l++) {
                                    var tripForStop = tripsForStop[l];
                                    var now = new Date();
                                    var arrivalTime;
                                    if (tripForStop.AdjustmentAge > 0) {
                                        var eta = tripForStop.AdjustedScheduleTime - tripForStop.AdjustmentAge;
                                        var arrival = new Date(now.getTime() + eta * 60000);
                                        arrivalTime = arrival.toLocaleTimeString();
                                    }
                                    else {
                                        var arrival = new Date(now.getTime() + tripForStop.AdjustedScheduleTime * 60000);
                                        arrivalTime = arrival.toLocaleTimeString();
                                    }
                                    html += "<div class='bus_arrival'><h4>Arriving at: " + arrivalTime + "</h4><button>Set Timer</button></div><br/>";
                                }
                            }
                        }
                    }

                }
                html += "</div>";
            }
            html += "</div>";
            statusPage.status_list.innerHTML = html;
            google.maps.event.trigger(statusPage, "make_status_done", "SUCCESS");

        }).error(function (e) {
            this.errMsg = "Ajax Error: " + e.statusText;
            google.maps.event.trigger(statusPage, "make_status_done", this.errMsg);
        });
    },
    makeList: function (url)
    {
        this._url = url;
        this.updateList();
    },
    showPage: function()
    {
        this.status_page.className = "show";
    },
    hidePage: function()
    {
        this.status_page.className = "hide";
    }
};

