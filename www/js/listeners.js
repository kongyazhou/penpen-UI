document.addEventListener('deviceready', function() {
    //navigator.splashscreen.show();
    window.plugins.toast.showLongBottom('deviceready');
    window.plugins.jPushPlugin.init();
});

document.addEventListener('resume', function() {
    window.plugins.toast.showLongBottom('resume');
    window.plugins.jPushPlugin.resumePush();
});

document.addEventListener('pause', function() {
    // JPushInterface.onPause(this);
});