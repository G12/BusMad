var SurealRanch = (function()
{
	function StopMarker(map, stop, currentIndex, city_code)
	{
		this.city_code = city_code;
		this.map_ = map;
		this.set('map',map);
		this.set('current_index',currentIndex);
		
		var anchor = '<a href="route_lister.php?stop_no=' + stop.stop_code + '&lat=' + stop.stop_lat + '&lng=' + stop.stop_lng + '&stop_id=' + stop.stop_id + '">Routes for This Stop</a>';
		var generic_anchor = '<a href="generic_route_lister.php?stop_id=' + stop.stop_id + '&city_code=' + city_code + '">GENERIC Routes for This Stop</a>';

		//TODO make route drawer page takes stop number queries db stops_lis containing this number draw them
		var draw_routes_anchor = '<a href="route_lister.php?stop_no=' + stop.stop_code + '&lat=' + stop.stop_lat + '&lng=' + stop.stop_lng + '">Routes for This Stop</a>';

		//Icon temporary location TODO topLeft x1,y1 bottom right x2,y2
		var s_shape={
			coord:[0,0,32,37],
			type:"rect"
		};
		
		var icon={
			anchor:	new google.maps.Point(8,9),//	The position at which to anchor an image in correspondance to the location of the marker on the map. By default, the anchor is located along the center point of the bottom of the image.
			origin:	new google.maps.Point(0,0),//	The position of the image within a sprite, if any. By default, the origin is located at the top left corner of the image (0, 0).
			scaledSize: new google.maps.Size(24,27),//	Size	The size of the entire image after scaling, if any. Use this property to stretch/shrink an image or a sprite.
			//size: new google.maps.Size(40,40),//The display size of the sprite or image. When using sprites, you must specify the sprite size. If the size is not provided, it will be set when the image loads.
			url: "img/bus_stop_gb.png"//string	The URL of the image or sprite sheet.
		};

		var s_htmlContent = '<div><h4>Stop Number: ' + stop.stop_code + ' ' + stop.stop_name + '</h4><h4>' + anchor + '</h4><h4>' + generic_anchor + '</h4></div>';		
		var s_strMsg = "Stop Number: " + stop.stop_code + " " + stop.stop_name;
		var s_newInfoWindow=new google.maps.InfoWindow({content:s_htmlContent});
		var stopLatLng = new google.maps.LatLng(stop.stop_lat,stop.stop_lng);
		
		this.marker_ = new google.maps.Marker({
			position:stopLatLng,
			map:this.map_,
			icon:icon,
			shape:s_shape,
			title:s_strMsg,
			draggable:false,
			infoWindow:s_newInfoWindow
		});
		this.marker_.bindTo('current_index',this);
		
		this.stop_id = stop.stop_id;
		this.stop_code = stop.stop_code;
		this.stop_lat = stop.stop_lat;
		this.stop_lng = stop.stop_lng;
		
		google.maps.event.addListener(this.marker_,'click',function (){
			busListPage.makeRouteTable(this.get('current_index'));
		});
	}

	StopMarker.prototype = new google.maps.MVCObject;

	StopMarker.prototype.getInfoWindowContent = function()
	{
		return this.marker_.infoWindow.getContent();
	}
	
	StopMarker.prototype.setInfoWindowContent = function(html)
	{
		return this.marker_.infoWindow.setContent(html);
	}

	StopMarker.prototype.OpenInfoWindow = function()
	{
		this.marker_.infoWindow.open(this.map_, this.marker_);
	}
	
	StopMarker.prototype.CloseInfoWindow = function()
	{
		this.marker_.infoWindow.close();
	}

	//TODO use MVC for this ??????????
	StopMarker.prototype.setIcon = function(w, h)
	{
		var icon={
			anchor:	new google.maps.Point(w/2,h/2),
			scaledSize: new google.maps.Size(w, h),
			url: this.marker_.getIcon().url
		};
		this.marker_.setIcon(icon);
	}
	
	////////////////////////////////////////////////// Peg Marker /////////////////////////////////////
	function PegMarker(markerTitle, lat, lng)
	{
		var self = this;
		this.lat = lat;
		this.lng = lng;
		this.accuracy = null; //meters
		this.geolocation_err = "";
		this.position = null;
		this.watchId_ = null;
		this.watch_on = false;
		var icon={
			//anchor:	new google.maps.Point(20,20),//default, the anchor is located along the center point of the bottom of the image.
			origin:	new google.maps.Point(0,0),//	The position of the image within a sprite, if any. By default, the origin is located at the top left corner of the image (0, 0).
			//scaledSize	Size	The size of the entire image after scaling, if any. Use this property to stretch/shrink an image or a sprite.
			size: new google.maps.Size(15,23),//Width, HeightThe display size of the sprite or image. When using sprites, you must specify the sprite size. If the size is not provided, it will be set when the image loads.
			url: "img/pegman_small.png"//string	The URL of the image or sprite sheet.
		};
		var shape={
			coord:[0,0,15,23], //coords is [x1,y1,x2,y2] where x1,y1 are the coordinates of the upper-left corner of the rectangle and x2,y2 are the coordinates of the lower-right coordinates of the rectangle.
			type:"rect"
		};
		this.marker_=new google.maps.Marker({
			clickable: true,
			icon:icon,
			shape:shape,
			title:markerTitle,
			draggable:true,
			optimized:false
		});
		
		//Events
		google.maps.event.addListener(this.marker_, 'click', function(event) {
			alert("Lat: " + event.latLng.lat() + " Lng: " + event.latLng.lng());
		});	

	}
	PegMarker.prototype = new google.maps.MVCObject;
	
	PegMarker.prototype.startGeoLocation = function (debug)
	{
	    self = this;
	    if (debug)
	    {
	        document.getElementById("wait_msg").innerHTML = "DEBUG skip Geolocation";
	        document.getElementById("refresh_btn").className = "hide";

	        self.watch_on = false;
	        google.maps.event.trigger(self, "geolocation_done", true);
	        return;
	    }
	    if (navigator.geolocation)
	    {
	        document.getElementById("wait_msg").innerHTML = "Start Geolocation";
	        document.getElementById("refresh_btn").className = "hide";
	        navigator.geolocation.getCurrentPosition
			(
			    function (position) {
			        self.accuracy = position.coords.accuracy;
			        if (self.accuracy < 1000) {
			            self.lat = position.coords.latitude;
			            self.lng = position.coords.longitude;
			            self.watch_on = true;
			            google.maps.event.trigger(self, "geolocation_done", true);
			        }
			        else {
			            self.geolocation_err = "Poor Accuracy: " + self.accuracy + " meters.";
			            google.maps.event.trigger(self, "geolocation_done", false);
			        }
			    },
			    function (error) {
			        self.geolocation_err = "Geolcation Error: " + error.message;
			        google.maps.event.trigger(self, "geolocation_error", self.geolocation_err);
			    },
			    { enableHighAccuracy: true, maximumAge: 4000 }
			);
	    }
	    else {
	        self.geolocation_err = "Geolcation Not Available";
	        google.maps.event.trigger(self, "geolocation_done", false);
	    }

	};

	PegMarker.prototype.updatePosition_ = function(position)
	{
		mapNotSet = this.marker_.getMap() == null;
		if(mapNotSet)
		{
			return;
		}
		var newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		if(!this.position.equals(newPosition))
		{
			this.position = newPosition;
			this.marker_.setPosition(this.position);
			$('#json_text').val("NEW Latitude: " + position.coords.latitude);
		}
	};
	
	PegMarker.prototype.startWatch = function()
	{
		if(this.watch_on)
		{
			var self = this;
		  	if(navigator.geolocation)
		  	{
		    	this.watchId_ = navigator.geolocation.watchPosition(
		        function(position)
		        {
		        	self.updatePosition_(position);
		        },
		        function(e) { google.maps.event.trigger(self, "geolocation_error", e); },
		        {enableHighAccuracy: true, maximumAge: 4000});
		  	}
		}
	};
	
	PegMarker.prototype.Draw = function(map)
	{
		this.position = new google.maps.LatLng(this.lat,this.lng);
		this.marker_.setPosition(this.position);
		this.marker_.setMap(map);
		this.set('map',map);
	}

	PegMarker.prototype.GeoLocationError = function()
	{
		return this.geolocation_err;
	}
	PegMarker.prototype.Accuracy = function()
	{
		return this.accuracy;
	}
	PegMarker.prototype.Lat = function()
	{
		return this.lat;
	}
	PegMarker.prototype.Lng = function()
	{
		return this.lng;
	}
	
	return {PegMarker: PegMarker, StopMarker: StopMarker};
})();

var SurealRanch_Markers = (function()
{
	function BusMarker(map, obj, path)
	{
		this.elapsedTime = 0;
		this.index = path[3];
		this.route_no = obj.stops[path[0]].routes[path[1]].route_no;
		this.stop_no = obj.stops[path[0]].stop_no;
		this.stop_name = obj.stops[path[0]].stop_name;
		
		var trips = obj.stops[path[0]].routes[path[1]].trips[path[2]];
		//var StopLabel = trips.StopLabel;
		this.Direction = trips.Direction;
		var RouteLabel = trips.RouteLabel;
		//var RequestProcessingTime = trips.RequestProcessingTime;

		var tripsForStop = trips.tripsForStop[path[3]];
		var AdjustedScheduleTime = tripsForStop.AdjustedScheduleTime;
		var AdjustmentAge = tripsForStop.AdjustmentAge;
		var GPSSpeed = tripsForStop.GPSSpeed;
		//this.TripDestination = tripsForStop.TripDestination;
		this.TripStartTime = tripsForStop.TripStartTime;

		//var LastTripOfSchedule = tripsForStop.LastTripOfSchedule;
		//var BusType = tripsForStop.BusType;

		var lat = tripsForStop.Latitude;
		var lng = tripsForStop.Longitude; 
		
		var position = new google.maps.LatLng(lat,lng);
		this.old_position = position;

		var stop_lat = obj.stops[path[0]].stop_lat;
		var stop_lng = obj.stops[path[0]].stop_lng;
		this.stop_position = new google.maps.LatLng(stop_lat,stop_lng);
		
		this.delta = google.maps.geometry.spherical.computeDistanceBetween(this.stop_position, position);
		//Test if the bus is close to it's destination stop TODO include walking distance in this calculation
		//err_logger.debug("Difference between stop and bus in meters: " + this.delta);
		if(this.delta < 1000) //meters
		{ 
			//err_logger.debug("Try to play a sound");
			var snd = new Audio("../sounds/notify.wav"); 
			snd.play();
		}

		var now = new Date();
    	var arrival = new Date(now.getTime() + AdjustedScheduleTime*60000);

		var markerTitle = "Bus " + this.route_no + " traveling " + this.Direction + " to " + this.stop_name + " arriving in " + AdjustedScheduleTime + " minutes at " + arrival.toLocaleTimeString() + " StartTime: " + this.TripStartTime;
		
		this.errDistance = AdjustmentAge > 0 ? AdjustmentAge : 10 * AdjustmentAge;

		this.set('map', map);
		this.set('position', position);
		this.set('stop_position', this.stop_position);
		this.set('errDistance', this.errDistance);
		this.set('title', markerTitle);
		
		var icon={
			anchor:	new google.maps.Point(20,20),//	The position at which to anchor an image in correspondance to the location of the marker on the map. By default, the anchor is located along the center point of the bottom of the image.
			origin:	new google.maps.Point(0,0),//	The position of the image within a sprite, if any. By default, the origin is located at the top left corner of the image (0, 0).
			//scaledSize	Size	The size of the entire image after scaling, if any. Use this property to stretch/shrink an image or a sprite.
			size: new google.maps.Size(40,40),//The display size of the sprite or image. When using sprites, you must specify the sprite size. If the size is not provided, it will be set when the image loads.
			url: "img/oc_bus.png"//string	The URL of the image or sprite sheet.
		};
		var shape={
			coord:[0,0,0,40,40,40,40,0],
			type:"poly"
		};
		
		var infoContent = '<div style="width:250px">' + markerTitle + '</div>';
		this.infoWindow = new google.maps.InfoWindow({content:infoContent});

		this.marker_=new google.maps.Marker({
			clickable: true,
			icon:icon,
			shape:shape,
			title:markerTitle,
			draggable:false,
			optimized:false,
			infoWindow:this.infoWindow,
			zIndex:2 //Infront of Error Elipse
		});
		google.maps.event.addListener(this.marker_,'click',function (){
			//Do nothing if bus clicked - ErrorElipse below for handling visible circle
			if(global_currentInfoWindow!=null)global_currentInfoWindow.close();
			global_currentInfoWindow=this.infoWindow;
			this.infoWindow.open(this.getMap(),this);
		});
		//Draws the marker and sets its position
		this.marker_.bindTo('map', this);
		this.marker_.bindTo('position', this);
		this.marker_.bindTo('title',this);
		
		this.errElipse = new ErrorElipse(this);
		this.errElipse.bindTo('map',this);
		this.errElipse.bindTo('center', this, 'position');
		this.errElipse.bindTo('errDistance', this);
		this.startTimer(this);

	}
	BusMarker.prototype = new google.maps.MVCObject;
	
	BusMarker.prototype.startTimer = function(me)
	{
		t_logger = new SurrealRanch_Maps.Logger("debug", false);
		if(me.errDistance > 0)
		{
			me.t = window.setInterval(function()
			{
				me.elapsedTime++;	
				var d = parseFloat(me.errElipse.get('errDistance'));
				var r = d + 1;
				if(r < 10)
				{
					me.errElipse.set('errDistance',r);
				}
				else
				{
					//TODO fix mutiple pinging - using closest bus as controller should solve this problem
					//if(me.elapsedTime > 20) //TODO estimate the best value fo this USE constants for easy tuning
					//{ 
						//trigger(instance:Object, eventName:string, var_args:*)	None
						//Triggers the given event. All arguments after eventName are passed as arguments to the listeners.
						google.maps.event.trigger(me, 'on_max_error', me);
						me.stopTimer(me);
					//}				
				}
				t_logger.debug("errDistance [" + d + "] result[ " + r + "]");
			},10000);
		}
	}

	BusMarker.prototype.stopTimer = function(me)
	{
		window.clearInterval(me.t);
	}
		
	BusMarker.prototype.update = function(json)
	{
		var num_trips = json.stops[0].routes[0].trips.length;
		var i;
		
		//Test to make sure this is the right direction
		for(i = 0; i < num_trips; i++)
		{
			
			test = json.stops[0].routes[0].trips[i].Direction;
			if(test == this.Direction)
			{
				break;
			}
		} 
		
		//TODO Rush test here way too much redundancy FIX THIS
		var strHtml = "";
		var trips = json.stops[0].routes[0].trips[i];
		for(ii = 0; ii < trips.tripsForStop.length; ii++)
		{
			var myTtripsForStop	= trips.tripsForStop[ii];
			myAdjustedScheduleTime = myTtripsForStop.AdjustedScheduleTime;
			myAdjustmentAge = myTtripsForStop.AdjustmentAge;
			myGPSSpeed = myTtripsForStop.GPSSpeed;
			myTripDestination = myTtripsForStop.TripDestination;
			myTripStartTime = myTtripsForStop.TripStartTime;
			myLastTripOfSchedule = myTtripsForStop.LastTripOfSchedule;
			myBusType = myTtripsForStop.BusType;
			var my_now = new Date();
	    	var my_arrival = new Date(my_now.getTime() + myAdjustedScheduleTime*60000);
			var tempTitle = "Bus: " + this.route_no + " " + this.Direction + "</br>";
			if(myAdjustmentAge > 0)
			{
				tempTitle += "<b>ETA: " + myAdjustedScheduleTime + " minutes at " + my_arrival.toLocaleTimeString() + "</b></br>";
			}
			else
			{
				tempTitle += "<b>Scheduled Arrival: " + myAdjustedScheduleTime + " minutes at " + my_arrival.toLocaleTimeString() + "</b></br>";
			}
			strHtml += tempTitle;
			//strHtml += '<div style="font-size:small">';
			//strHtml += "<ul><li>GPS Speed: " + myGPSSpeed + "</li>";
			//strHtml += "<li>Adjustment Age: " + myAdjustmentAge + "</li>";
			//strHtml += "<li>TripStartTime: " + myTripStartTime + "</li>";
			//strHtml += "<li>TripDestination: " + myTripDestination + "</li></ul></div></br>";
			
		}
		$('#task_bar').html(strHtml);	
		//End of Rush test
		
		
		var tripsForStop = json.stops[0].routes[0].trips[i].tripsForStop[this.index];	
	
		var tempTripStartTime = tripsForStop.TripStartTime;

		Latitude = tripsForStop.Latitude;
		Longitude = tripsForStop.Longitude;
		var position = new google.maps.LatLng(Latitude,Longitude);
		
		//Test if the bus is close to it's destination stop TODO include walking distance in this calculation
		var delta = google.maps.geometry.spherical.computeDistanceBetween(this.stop_position, position);
		//err_logger.debug("Difference between stop and bus in meters: " + delta);
		if(delta < 1000) //meters Close to bus stop
		{ 
			//err_logger.debug("Try to play a sound");
			//var snd = new Audio("sounds/notify.wav"); 
			//snd.play();
		}
		else
		{
			//TODO this wont work if a new busMarker is not created
			if(delta < 500) //Bus close to arriving or just departing
			{
				//var snd = new Audio("sounds/tada.wav"); 
				//snd.play();
				//alert("Bus has probably just left!");
				//document.location.reload(true); //TODO
			}
			else if(tempTripStartTime != this.TripStartTime && this.delta < 2000)//compare with old delta allow 2 k incase bus does not report frequently 
			{
				//var snd = new Audio("sounds/tada.wav"); 
				//snd.play();
			}
			else
			{
				//var snd = new Audio("sounds/InfoBar.wav"); 
				//snd.play();
			}
		}
		this.old_position = position;
		this.delta = delta;
		
		this.AdjustedScheduleTime = tripsForStop.AdjustedScheduleTime;
		this.AdjustmentAge = tripsForStop.AdjustmentAge;
		this.GPSSpeed = tripsForStop.GPSSpeed;
		this.TripDestination = tripsForStop.TripDestination;
		this.TripStartTime = tripsForStop.TripStartTime;
		this.LastTripOfSchedule = tripsForStop.LastTripOfSchedule;
		this.BusType = tripsForStop.BusType;

		if(this.AdjustmentAge < 0)
		{
			this.marker_.setMap(null);
		}
		var now = new Date();
    	var arrival = new Date(now.getTime() + this.AdjustedScheduleTime*60000);
		var markerTitle = "Bus " + this.route_no + " traveling " + this.Direction + " to " + this.stop_name + " arriving in " + this.AdjustedScheduleTime + " minutes at " + arrival.toLocaleTimeString() + " StartTime: " + this.TripStartTime;
		this.set('title', markerTitle);
		
		var infoContent = '<div style="width:250px">' + markerTitle + '</div>';
		this.infoWindow.setContent(infoContent);

		var errDistance = this.AdjustmentAge > 0 ? this.AdjustmentAge : 10 * this.AdjustmentAge;
		this.set('position', position);
		this.set('errDistance', errDistance);
		
		this.startTimer(this);

	}

	function ErrorElipse(busMarker)
	{
		this.circle = new google.maps.Circle(
		{
		    clickable: true,
		    strokeColor: '1bb6ff',
		    strokeOpacity: .4,
		    fillColor: '61a0bf',
		    fillOpacity: .4,
		    strokeWeight: 1,
		    zIndex: 1
	  	});
		this.circle.set('busMarker',busMarker);
		
		//this.set('errDistance', errDistance);
		this.bindTo('bounds', this.circle);
		this.circle.bindTo('center', this);
		this.circle.bindTo('map', this);
		this.circle.bindTo('radius',this);
	} 
	ErrorElipse.prototype = new google.maps.MVCObject;
	
	//Update the radius when the err_distance changes
	ErrorElipse.prototype.errDistance_changed = function(){
		this.set('radius', this.get('errDistance') * 100); 
	}  

	return {BusMarker: BusMarker};

})();