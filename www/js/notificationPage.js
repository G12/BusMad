var notificationPage = {
    notification_page: null,
    errMsg: null,
    init: function (notification_page_id) {
        this.notification_page = document.getElementById(notification_page_id);
    },
    showPage: function () {
        //alert("You clicked");
        //window.plugin.notification.local.add({ message: 'Great Bus app!', sound: 'TYPE_ALARM' });
    }
};