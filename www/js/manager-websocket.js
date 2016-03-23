document.addEventListener('deviceready', function () {
  window.plugins.toast.showLongBottom('deviceready', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});


});
document.addEventListener('resume', function () {
  window.plugins.toast.showLongBottom('resume', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});

  // var conn = new WebSocket('ws://223.202.124.144:20888/');
  //   //window.plugins.toast.showShortBottom('连接', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});

  // conn.onopen = function() {
  //     //this.send('hello'); 
  //   window.plugins.toast.showShortBottom('重新连接', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
  // }
  // conn.onclose = function(evt) {
  //   window.plugins.toast.showLongBottom('服务器连接失败，请检查你的网络连接。', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
  // }
  
});