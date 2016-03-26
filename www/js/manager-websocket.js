document.addEventListener('deviceready', function () {
  window.plugins.toast.showLongBottom('deviceready', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
});
document.addEventListener('resume', function () {
  window.plugins.toast.showLongBottom('resume', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});

});