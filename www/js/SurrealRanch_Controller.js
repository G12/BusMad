var SurrealRanch_Controller = (function()
{
	function Controller(lat, lng, city_code, mode, zoom_level)
	{
		this.city_code = city_code;
		this.mode = mode;
		this.zoom_level = zoom_level;
		//PegMarker triggers a geolocation_done event
		this.peg_marker = new SurealRanch.PegMarker("You Are Here!", lat, lng);
	    this.stop_list;
		this.bus_list;
		this.initialLatLng = new google.maps.LatLng(lat,lng);
		this.map;
		this.map_canvas;
		this.document_width;
		this.document_height;
		this.text_mode = false;
		this.allowZoomUpdate = true;
	}
	Controller.prototype = new google.maps.MVCObject;
	Controller.prototype.startGeoLocation = function(debug)
	{
	    this.peg_marker.startGeoLocation(debug);
	}
	Controller.prototype.quickInit = function (map_canvas, wait_window)
	{
	    this.map_canvas = document.getElementById(map_canvas);
	}
	Controller.prototype.initialize = function(result, map_canvas) //, wait_window)
	{
	    this.map_canvas = document.getElementById(map_canvas);
	    var self = this;
	    if(this.mode == "static")
	    {
	    	//Moved to constructor - now does not rely on globals lat_in,lng_in
	    	//this.initialLatLng = new google.maps.LatLng(lat_in,lng_in)
	    }
	    else
	    {
	    	this.initialLatLng = new google.maps.LatLng(this.peg_marker.Lat(),this.peg_marker.Lng());
	    }
	    
	    var mapOptions = {zoom: this.zoom_level,	mapTypeId: google.maps.MapTypeId.ROADMAP, center: this.initialLatLng, scaleControl:true,
			zoomControl:true,zoomControlOptions:{style:google.maps.ZoomControlStyle.SMALL}};
			
	    this.map = new google.maps.Map(document.getElementById(map_canvas), mapOptions);

	    this.stop_list = new SurrealRanch_Collections.StopList(city_code, this.map);
	    this.bus_list = new SurrealRanch_Collections.BusList(city_code, this.map);
		if(this.mode == "static")
		{
		
		}
		else
		{
			this.peg_marker.Draw(this.map);
		}
		
		//setCenterCallJSon(initialLatLng, result);
		var n = .04;
		if(this.initialLatLng)
		{
			this.map.setCenter(this.initialLatLng);
		}
		if(result)
		{
			n = .01;
		}
		var lat_low = this.initialLatLng.lat() - n;
		var lat_high = this.initialLatLng.lat() + n;
		var lon_low = this.initialLatLng.lng() - n;
		var lon_high = this.initialLatLng.lng() + n;

		this.drawStops(lat_low, lat_high, lon_low, lon_high, false, false);
		
		google.maps.event.addListener(this.map, 'zoom_changed', function()
		{
		    if (self.allowZoomUpdate)
		    {
		        self.stop_list.ZoomChanged(); //self.zoom_level);
		    }
		});

        //TODO add more stops when bounds change
        /*
		google.maps.event.addListener(this.map, 'bounds_changed', function ()
		{
		    LatLngBounds = self.map.getBounds();
		    ne = LatLngBounds.getNorthEast();
		    sw = LatLngBounds.getSouthWest();
		    alert("NE lat-lng: " + ne.lat() + "-" + ne.lng() + " SW lat-lng: " + sw.lat() + "-" + sw.lng());
		});
        */

		return this.map;
	}

	Controller.prototype.getStopCodeFor = function(index)
	{
	    return this.bus_list.getStopCode(index);
	}

	Controller.prototype.getBusNumberFor = function (index)
	{
	    return this.bus_list.getBusNumber(index);
	}

	Controller.prototype.forceZoomUpdate = function ()
	{
	    this.stop_list.ZoomChanged(); //zoomLevel);
	}

	Controller.prototype.drawStops = function (lat_low, lat_high, lon_low, lon_high, isAdding, forceZoomUpdate)
	{
	    self = this;
	    var url = "http://geopad.ca/js/get_json_for.php?lat_low=" + lat_low + "&lat_high=" + lat_high + "&lon_low=" + lon_low + "&lon_high=" + lon_high + "&city_code=" + city_code;
	    $.get(url, {}, function (json) {
	        self.stop_list.makeMarkers(json);
	        if (isAdding)
	        {
	            //set the markers to right size
	            //TODO 
	            if (forceZoomUpdate)
	            {
	                self.forceZoomUpdate();
	            }
	        }
	        else {
	            //After all stop markers are drawn
	            self.peg_marker.startWatch();
	        }
	    }).error(function (e) {
	        console.log("Ajax Error: " + e.statusText);
	    }).always(function () {
	        console.log("Done getting stop markers!")
	        //Could send done event
	    });
	}
	/**
	*	Adds new Buses to bus_list
	*	Updates info on current buses
	*	Draws or redaws all selected buses
	*
	*/
	Controller.prototype.drawBusRoutes = function ()
	{
		var self = this;
		var trips_x = this.bus_list.getDrawListQuery();
		if(this.text_mode)
		{
		    var url = "http://geopad.ca/js/get_json_triplist_text.php?trips_x=" + trips_x + "&city_code=" + city_code + "&count=3";
			$.get(url, {}, function(jsonTxt)
			{
				google.maps.event.trigger(self, "draw_routes_done", jsonTxt);
				
			}).error(function(e)
			{
				google.maps.event.trigger(self, "draw_routes_error", "Ajax error");
			});
		}
		else
		{
		    var url = "http://geopad.ca/js/get_json_triplist.php?trips_x=" + trips_x + "&city_code=" + city_code + "&count=3";
			$.get(url, {}, function(jsonObj)
			{
				var obj = self.bus_list.Update(jsonObj);
				if(obj.status == "success")
				{
					self.bus_list.DrawNewRoutes();
					google.maps.event.trigger(self, "draw_routes_done", obj);
				}
				else
				{
					google.maps.event.trigger(self, "draw_routes_error", obj.status);
				}
			}).error(function(e)
			{
				google.maps.event.trigger(self, "draw_routes_error", "Ajax error");
			});
		}
	}

    /*
	Controller.prototype.showMap = function () {
	    this.map_canvas.className = "show";
	}

	Controller.prototype.hideMap = function () {
	    this.map_canvas.className = "hide";
	}
    */

    /////////////////////////////////////// TripObject ///////////////////////////////////////////////
	//
	//	The basic unit of information and control containing a Stop, a Bus and Route information
	//		
	//
	//////////////////////////////////////////////////////////////////////////////////////////////////
	function TripObject(city_code, map)
	{
		this.city_code = city_code;
		this.map = map;
	}

	TripObject.prototype = new google.maps.MVCObject;
		
	return {Controller: Controller};
})();

