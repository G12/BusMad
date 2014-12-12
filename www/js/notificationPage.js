var notificationPage = {
    notification_page: null,
    errMsg: null,
    init: function (notification_page_id) {
        this.notification_page = document.getElementById(notification_page_id);
    },
    showPage: function () {
        //alert("You clicked");
        //window.plugin.notification.local.add({ message: 'Great Bus app!', sound: 'TYPE_ALARM' });
    },
	setTimer: function(time, btn) {

			newTime = new Date(time);
			arrivalMilliseconds = newTime.getTime();

			var currentTime = new Date();
			var now = new Date().getTime(),
			inputTime = statusPage.getInputTime(btn);
			alertTime = new Date(arrivalMilliseconds - (inputTime * 60) *1000);
			
			if(alertTime.getTime() < now){
				alert("Cannot Set Notification for a Bus in the Past");
			}else{
				alert("Notification Set For: "+ alertTime);
				
				window.plugin.notification.local.add({
					id: 1,
					title: 'Busman Reminder',
					message: 'Your Bus Arrives in ' + inputTime + ' Minutes!',
					date: alertTime,
					sound: 'TYPE_NOTIFICATION' 
				});
			}
		}
};