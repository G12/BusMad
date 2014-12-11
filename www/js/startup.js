var HOME_PAGE = "HOME_PAGE";
var MAP_PAGE = "MAP_PAGE";
var STATUS_PAGE = "STATUS_PAGE";
var BUS_LIST_PAGE = "BUS_LIST_PAGE";
var startUpPage = {
    start_up_page: null,
    map_canvas: null,
    bus_list: null,
    status_page: null,
    map_btn: null,
    stop_number: null,
    bus_number: null,
    _networkState: null,
    _states: null,
    _current_page: null,
    application_status: null,
    init: function (start_up_page_id, map_canvas_id, bus_list_id, status_page_id)
    {
        this._current_page = HOME_PAGE;
        this._states = {};
        this._states[Connection.UNKNOWN] = 'Unknown connection';
        this._states[Connection.ETHERNET] = 'Ethernet connection';
        this._states[Connection.WIFI] = 'WiFi connection';
        this._states[Connection.CELL_2G] = 'Cell 2G connection';
        this._states[Connection.CELL_3G] = 'Cell 3G connection';
        this._states[Connection.CELL_4G] = 'Cell 4G connection';
        this._states[Connection.CELL] = 'Cell generic connection';
        this._states[Connection.NONE] = 'No network connection';

        this.application_status = document.getElementById("application_status");
        this.map_btn = document.getElementById("map_btn");
        this.start_up_page = document.getElementById(start_up_page_id);
        this.stop_number = document.getElementById("stop_number");
        this.bus_number = document.getElementById("bus_number");
        //this.start_up_page.className = "hide";
        this.map_canvas = document.getElementById(map_canvas_id);
        this.bus_list = document.getElementById(bus_list_id);
        this.status_page = document.getElementById(status_page_id);
        document.addEventListener("offline", this.goingOffLine.bind(this), false);
        document.addEventListener("online", this.commingOnLine.bind(this), false);
    },
    getCurrentPage: function()
    {
        return this._current_page;
    },
    setAppStatus: function(application_status)
    {
        this.application_status.innerHTML = application_status;
    },
    openPage: function(target_page)
    {
        this._current_page = target_page;
        this.start_up_page.className = "hide";
        this.map_canvas.className = "hide";
        this.status_page.className = "hide";
        this.bus_list.className = "hide";
        this.map_btn.innerHTML = "Map";
        switch (target_page)
        {
            case HOME_PAGE:
                this.start_up_page.className = "show";
                break;
            case MAP_PAGE:
                this.map_canvas.className = "show";
                this.map_btn.innerHTML = "Stops";
                break;
            case STATUS_PAGE:
                this.status_page.className = "show";
                break;
            case BUS_LIST_PAGE:
                this.bus_list.className = "show";
                break;
        }
    },
    goingOffLine: function ()
    {
        var temp = this._current_page;
        this.openPage(HOME_PAGE);
        this._current_page = temp;
        this.application_status.innerHTML = "No Network Connection";
    },
    commingOnLine: function ()
    {
        //this.application_status.innerHTML = "";
        this.application_status.innerHTML = "Platform: " + g_platform;
        this.openPage(this._current_page);
    },
    checkConnection: function()
    {
        this._networkState = navigator.connection.type;
        if (this._networkState == Connection.UNKNOW || this._networkState == Connection.NONE)
        {
            this.goingOffLine();
        }
    },
    setStopNumber: function(stop_code)
    {
        this.stop_number.value = stop_code;
    },
    setBusNumber: function(bus_number)
    {
        this.bus_number.value = bus_number;
    }

};