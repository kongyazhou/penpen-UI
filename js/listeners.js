document.addEventListener('deviceready', function() {
    // cordova plugin add jpush-phonegap-plugin --variable API_KEY=2dab9b8353f700e4ef57fa0e

    // 初始化Jpush
    window.plugins.jPushPlugin.init();
    // 打开应用停止推送，并清除已有推送
    // window.plugins.jPushPlugin.stopPush();
    window.plugins.jPushPlugin.clearAllNotification();
});

document.addEventListener('resume', function() {
    // window.plugins.toast.showLongBottom('resume');
    // 打开应用停止推送，并清除已有推送
    // window.plugins.jPushPlugin.stopPush();
    window.plugins.jPushPlugin.clearAllNotification();    
});

document.addEventListener('pause', function() {
    // JPushInterface.onPause(this);
    // 应用转至后台，恢复推送
    window.plugins.jPushPlugin.resumePush();
});