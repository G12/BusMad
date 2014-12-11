/**
 * Namespace for collection type objects
 */
var SurrealRanch_Collections = (function()
{
	/**
	 * @param string city_code
	 * @param map
	 * @returns {StopList}
	 */
	function StopList(city_code, map)
	{
		this.city_code = city_code;
		this.stops = new Array();
		this.current_index;
		this.map = map;
	}

	StopList.prototype = new google.maps.MVCObject;
	
	StopList.prototype.makeMarkers = function(json)
	{
		this.current_index = 0;
		for(var i = 0; i < json.stops.length; i++)
		{ 
			var stop = json.stops[i];
			if (this.isUnique(stop.stop_id))
			{
			    var stop_marker = new SurealRanch.StopMarker(this.map, stop, this.current_index, this.city_code);
			    this.current_index = this.stops.push(stop_marker);
			}
		}
	};

	StopList.prototype.isUnique = function (stop_id)
	{
	    for (var i = 0; i < this.stops.length; i++)
	    {
	        if (stop_id == this.stops[i].stop_id)
	        {
	            return false;
	        }
	    }
	    return true;
	};

	StopList.prototype.getAt = function(index)
	{
		this.current_index = index;
		return this.stops[index];
	};

	StopList.prototype.getAtCurrent = function()
	{
		return this.stops[this.current_index];
	};
	
	StopList.prototype.CloseCurrentInfoWindow = function()
	{
		var stop = this.stops[this.current_index];
		if(stop)
		{
			stop.CloseInfoWindow();
		}
	};

	StopList.prototype.ZoomChanged = function()
	{
		var w = 16, h = 18; 
	    var zoom = this.map.getZoom();
		
		if(zoom >= 17){	w = 32, h = 37; }
	    if(zoom < 17){ w = 24, h = 27; }
	    if(zoom < 16){ w = 16, h = 18; }
		if(zoom < 15){ w = 8, h = 9; }
		if(zoom < 14){ w = 4, h = 4; }
		if(zoom < 12){ w = 2, h = 2; }
		
	    for(var i = 0; i < this.stops.length; i++)
	    {
		    //change the size of the icon
		    this.stops[i].setIcon(w, h);
		}
		return zoom;
	};

	////////////////////////////////////////// Bus List ///////////////////////////////////////
	function BusList(city_code, map)
	{
		this.city_code = city_code;
		this.buses = new Array();
		this.map = map;
	}

	BusList.prototype = new google.maps.MVCObject;
	
	BusList.prototype.Add = function(route_number, stop_id, stop_code, headsign_id)
	{
		for(var i = 0; i < this.buses.length; i++)
		{
			var obj = this.buses[i];
			if(route_number == obj.route_number && stop_id == obj.stop_id && headsign_id == obj.headsign_id)
			{
				this.buses.splice(i,1);
				return false;
			}
		}
		var bus = new SurrealRanch_Routes.Bus(this.map, route_number, stop_id, stop_code, headsign_id);
		this.buses.push(bus);
		return true;
	};

	BusList.prototype.getDrawListQuery = function()
	{
		var str = "";
		var first = true;
		for(var i = 0; i < this.buses.length; i++)
		{
			var obj = this.buses[i];
			if(!obj.is_drawn)
			{
				if(first)
				{
					str += obj.stop_id;
					first = false;
				}
				str += "b" + obj.route_number + "_" + obj.headsign_id;
			}
		}
		return str;
	};

	BusList.prototype.getBus = function(route_number, stop_id, headsign_id)
	{
		for(var i = 0; i < this.buses.length; i++)
		{
			obj = this.buses[i];
			if(obj.isEqual(route_number, stop_id, headsign_id))
			{
				return obj;
			}
		}
		return null;
	}
		
	BusList.prototype.Update = function(jsonObj)
	{
		if(jsonObj)
		{
			var strSchedule = "";
			//var bus_stops = jsonObj.bus_stops;
			var bus_stops = jsonObj.stops;
			for(var i = 0; i < bus_stops.length; i++)
			{
				var bus_stop_id = bus_stops[i].bus_stop_id;
				var buses = bus_stops[i].buses;
				for(var j = 0; j < buses.length; j++)
				{
					var route_number = buses[j].route_number;
                    var headsign_id = buses[j].headsign_id;
                    var stop_id = buses[j].stop_id;
					var schedule = buses[j].schedule;
					var routes = buses[j].routes;
					var bus = this.getBus(route_number,stop_id,headsign_id);
					bus.Update(schedule,routes);
				}//buses
			}//stops
			return {status:"success"};
		}
		else
		{
			return {status:"Null Object"};
		}
	};

	BusList.prototype.DrawNewRoutes = function()
	{
		for(var i = 0; i < this.buses.length; i++)
		{
			this.buses[i].Draw(0); //TODO why are there only one routes?
		}
	}

	BusList.prototype.getStopCode = function (index)
	{
	    if (this.buses.length > index && index >= 0)
	    {
	        var obj = this.buses[index];
	        return obj.stop_code;
	    }
	    return "";
	}

	BusList.prototype.getBusNumber = function (index)
	{
	    if (this.buses.length > index && index >= 0)
	    {
	        var obj = this.buses[index];
	        return obj.route_number;
	    }
	    return "";
	}

	//Deprecated
	BusList.prototype.makeTripString = function()
	{
		var str = "";
		if(this.city_code == "oc")
		{
			for(var i = 0; i < this.buses.length; i++)
			{
				var obj = this.buses[i];
				if(i == 0){str += obj.stop_code;}
				str += "b" + obj.route_number + "_" + obj.headsign_id;
			}
		}
		return str;
	};
	
	BusList.prototype.makeGenericTripString = function()
	{
		var str = "";
		for(var i = 0; i < this.buses.length; i++)
		{
			var obj = this.buses[i];
			if(i == 0){str += obj.stop_id;}
			str += "b" + obj.route_number + "_" + obj.headsign_id;
		}
		return str;
	};

	BusList.prototype.getLength = function()
	{
	    return this.buses.length;
	};

	return {StopList: StopList, BusList: BusList};
})();

