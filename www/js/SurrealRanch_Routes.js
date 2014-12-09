var SurrealRanch_Routes = (function()
{
	function Bus(map, route_number, stop_id, stop_code, headsign_id)
	{
		this.map = map;
		this.route_number = route_number;
		this.stop_id = stop_id;
		this.stop_code = stop_code;
		this.headsign_id = headsign_id;
		this.schedule;
		this.routes;
		this.route_list = new Array(); 	
		this.is_drawn = false;
	}
	
	Bus.prototype.isEqual = function(route_number, stop_id, headsign_id)
	{
		if(this.route_number == route_number && this.stop_id == stop_id && this.headsign_id == headsign_id)return true;
		return false;
	};
	
	Bus.prototype.ClearRoutes = function()
	{
		for(var i = 0; i < this.route_list.length; i++)
		{ 
			this.route_list[i].Clear();
		}
		this.route_list = [];
	}

	Bus.prototype.Update = function(schedule,routes)
	{
		this.ClearRoutes();
		this.schedule = schedule;
		this.routes = routes;
		for(var i = 0; i < this.routes.length; i++)
		{
			var route = new SurrealRanch_Routes.Route(this.map, this.routes[i].route); 
			this.route_list.push(route);
		}
	}

	Bus.prototype.RouteCount = function()
	{
		return this.routes.length;
	};
	
	Bus.prototype.Draw = function(index)
	{
		//TODO reasons for 0 length list?
		if(this.route_list.length)
		{
			var route = this.route_list[index];
			if(!route.is_drawn)
			{ 
				route.Draw();
				route.is_drawn = true;
			}
		}
	};

	Bus.prototype.Status = function()
	{
		var text = 'Bus: ' + this.route_number + ' ariving at:'  
		for(var i = 0; i < this.schedule.length; i++)
		{
			text += ' ' + this.schedule[i].arrival_time;
		}
		var id =  this.route_number + '_' + this.stop_id + '_' + this.headsign_id;
		var click = "javascript:clickBus('" + this.stop_code + "','" + this.route_number + "','" + this.headsign_id + "','" + i + "')";
		str = '<div id="' + id + '" class="big_button_bar" onclick="' + click + '">';
		str += '<span class="pic_button" ></span><span class="big_text_button" ><b>' + text + '</b></span></div>'
		return str;
	};

	function Route(map, route)
	{
		this.is_drawn = false;
		this.map = map;
		this.route = route;
		var polyOptions = {
			strokeColor: '#0000FF',
			strokeOpacity: 0.4,
			strokeWeight: 6,
			map: map
		};
		this.transPoints = new google.maps.MVCArray();
		this.transPolyLine = new google.maps.Polyline(polyOptions);
	}
	
	Route.prototype.Clear = function()
	{
		this.transPoints = [];
		this.transPolyLine.setMap(null);
	};
	
	Route.prototype.Draw = function()
	{
		var stops = this.route.stops;
		for(var i = 0; i < stops.length; i++)
		{
			var obj = stops[i];
			var latlng = new google.maps.LatLng(obj.l,obj.n);
			this.transPoints.push(latlng);
		}
		this.transPolyLine.setMap(this.map);
		this.transPolyLine.setPath(this.transPoints);
		this.is_drawn = true;
	};

	return {Bus: Bus, Route: Route};
})();

