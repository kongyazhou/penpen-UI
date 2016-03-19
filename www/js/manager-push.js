document.addEventListener('deviceready', function () {
  //navigator.splashscreen.show();
  window.plugins.jPushPlugin.init();
});

document.addEventListener('resume', function () {
  JPushInterface.onResume(this);
});

document.addEventListener('pause', function () {
  JPushInterface.onPause(this);
});