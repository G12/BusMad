var startUpPage = {
    start_up_page: null,
    map_canvas: null,
    bus_list: null,
    status_page: null,
    _networkState: null,
    init: function (start_up_page_id, map_canvas_id, bus_list_id, status_page_id)
    {
        _states = {};
        _states[Connection.UNKNOWN] = 'Unknown connection';
        _states[Connection.ETHERNET] = 'Ethernet connection';
        _states[Connection.WIFI] = 'WiFi connection';
        _states[Connection.CELL_2G] = 'Cell 2G connection';
        _states[Connection.CELL_3G] = 'Cell 3G connection';
        _states[Connection.CELL_4G] = 'Cell 4G connection';
        _states[Connection.CELL] = 'Cell generic connection';
        _states[Connection.NONE] = 'No network connection';

        this.start_up_page = document.getElementById(start_up_page_id);
        this.start_up_page.className = "hide";
        this.map_canvas = document.getElementById(map_canvas_id);
        this.bus_list = document.getElementById(bus_list_id);
        this.status_page = document.getElementById(status_page_id);
        document.addEventListener("offline", this.goinOffLine.bind(this), false);
        document.addEventListener("online", this.commingOnLine.bind(this), false);
    },
    goinOffLine: function ()
    {
        //alert("Going Off Line");
        //close any thing that's open
        this.map_canvas.className = "hide";
        this.bus_list.className = "hide";
        this.status_page.className = "hide";

        this.start_up_page.className = "show";
    },
    commingOnLine: function ()
    {
        //alert("Coming On Line");
        this.start_up_page.className = "hide";
        this.map_canvas.className = "show";
    },
    checkConnection: function()
    {
        _networkState = navigator.connection.type;
        //alert('Connection type: ' + _states[_networkState]);
        if (_networkState == Connection.UNKNOW || _networkState == Connection.NONE)
        {
            this.goinOffLine();
        }
    }
};