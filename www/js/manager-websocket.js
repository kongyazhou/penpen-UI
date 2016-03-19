document.addEventListener('deviceready', function () {

  if (window["WebSocket"]) {

    var conn = new WebSocket('ws://192.168.1.11:8080/');
    //window.plugins.toast.showShortBottom('连接', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});

    conn.onopen = function() {
      //this.send('hello'); 
      window.plugins.toast.showShortBottom('连接成功', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
      updateMessage();
      updateBroadcast();
    }
    //定义:onclose事件函数
    conn.onclose = function(evt) {
      window.plugins.toast.showLongBottom('服务器连接失败，请检查你的网络连接。', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
    }
    //定义:onmessage事件函数
    conn.onmessage = function(evt) {

    }
  }
  else {
    //如果用户浏览器不支持WebSockets则打印错误信息
    window.plugins.toast.showLongBottom('抱歉，您的手机不支持WebSocket。', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
  }
});
document.addEventListener('resume', function () {
  var conn = new WebSocket('ws://192.168.1.11:8080/');
    //window.plugins.toast.showShortBottom('连接', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});

  conn.onopen = function() {
      //this.send('hello'); 
    window.plugins.toast.showShortBottom('重新连接', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
  }
  conn.onclose = function(evt) {
    window.plugins.toast.showLongBottom('服务器连接失败，请检查你的网络连接。', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
  }
  
});