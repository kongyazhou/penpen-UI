angular.module('penpen.services', [])

.factory("userService", function($http) {
    var users = [];
    return {
        getUsers: function() {
            return $http.get("https://randomuser.me/api/?results=10").then(function(response) {
                users = response.data.results;
                return response.data.results;
            });
        },
        getUser: function(index) {
            return users[index];
        }
    };
})

.factory('localStorageService', [function() {
        return {
            get: function localStorageServiceGet(key, defaultValue) {
                var stored = localStorage.getItem(key);
                try {
                    stored = angular.fromJson(stored);
                } catch (error) {
                    stored = null;
                }
                if (defaultValue && stored === null) {
                    stored = defaultValue;
                }
                return stored;
            },
            update: function localStorageServiceUpdate(key, value) {
                if (value) {
                    localStorage.setItem(key, angular.toJson(value));
                }
            },
            clear: function localStorageServiceClear(key) {
                localStorage.removeItem(key);
            }
        };
}])

.factory('dateService', [function() {
    return {
        handleMessageDate: function(messages) {
            var i = 0,
                length = 0,
                messageDate = {},
                nowDate = {},
                weekArray = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
                diffWeekValue = 0;
            if (messages) {
                nowDate = this.getNowDate();
                length = messages.length;
                for (i = 0; i < length; i++) {
                    messageDate = this.getMessageDate(messages[i]);
                    if(!messageDate){
                        return null;
                    }
                    if (nowDate.year - messageDate.year > 0) {
                        messages[i].lastMessage.time = messageDate.year + "";
                        continue;
                    }
                    if (nowDate.month - messageDate.month >= 0 ||
                        nowDate.day - messageDate.day > nowDate.week) {
                        messages[i].lastMessage.time = messageDate.month +
                            "月" + messageDate.day + "日";
                        continue;
                    }
                    if (nowDate.day - messageDate.day <= nowDate.week &&
                        nowDate.day - messageDate.day > 1) {
                        diffWeekValue = nowDate.week - (nowDate.day - messageDate.day);
                        messages[i].lastMessage.time = weekArray[diffWeekValue];
                        continue;
                    }
                    if (nowDate.day - messageDate.day === 1) {
                        messages[i].lastMessage.time = "昨天";
                        continue;
                    }
                    if (nowDate.day - messageDate.day === 0) {
                        messages[i].lastMessage.time = messageDate.hour + ":" + messageDate.minute;
                        continue;
                    }
                }
                // console.log(messages);
                // return messages;
            } else {
                console.log("messages is null");
                return null;
            }

        },
        getNowDate: function() {
            var nowDate = {};
            var date = new Date();
            nowDate.year = date.getFullYear();
            nowDate.month = date.getMonth();
            nowDate.day = date.getDate();
            nowDate.week = date.getDay();
            nowDate.hour = date.getHours();
            nowDate.minute = date.getMinutes();
            nowDate.second = date.getSeconds();
            return nowDate;
        },
        getMessageDate: function(message) {
            var messageDate = {};
            var messageTime = "";
            //2015-10-12 15:34:55
            var reg = /(^\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/g;
            var result = new Array();
            if (message) {
                messageTime = message.lastMessage.originalTime;
                result = reg.exec(messageTime);
                if (!result) {
                    console.log("result is null");
                    return null;
                }
                messageDate.year = parseInt(result[1]);
                messageDate.month = parseInt(result[2]);
                messageDate.day = parseInt(result[3]);
                messageDate.hour = parseInt(result[4]);
                messageDate.minute = parseInt(result[5]);
                messageDate.second = parseInt(result[6]);
                // console.log(messageDate);
                return messageDate;
            } else {
                console.log("message is null");
                return null;
            }
        }
    };
}])

.factory('messageService', ['localStorageService', 'dateService',function(localStorageService, dateService) {
        return {
            //TODO
            message:{},
            messageNum:0,
            messageDetails:[],

            init: function(messages) {
                var i = 0;
                var length = 0;
                var messageID = new Array();
                var date = null;
                var messageDate = null;
                if (messages) {
                    length = messages.length;
                    for (; i < length; i++) {
                        messageDate = dateService.getMessageDate(messages[i]);
                        if(!messageDate){
                            return null;
                        }
                        date = new Date(messageDate.year, messageDate.month,
                            messageDate.day, messageDate.hour, messageDate.minute,
                            messageDate.second);
                        messages[i].lastMessage.timeFrome1970 = date.getTime();
                        messageID[i] = {
                            id: messages[i].id
                        };

                    }
                    localStorageService.update("messageID", messageID);
                    for (i = 0; i < length; i++) {
                        localStorageService.update("message_" + messages[i].id, messages[i]);
                    }
                }
            },
            getAllMessages: function() {
                var messages = new Array();
                var i = 0;
                var messageID = localStorageService.get("messageID");
                var length = 0;
                var message = null;
                if (messageID) {
                    length = messageID.length;

                    for (; i < length; i++) {
                        message = localStorageService.get("message_" + messageID[i].id);
                        if(message){
                            messages.push(message);
                        }
                    }
                    dateService.handleMessageDate(messages);
                    return messages;
                }
                return null;

            },
            getMessageById: function(id){
                return localStorageService.get("message_" + id);
            },
            getAmountMessageById: function(num, id){
                var messages = [];
                var message = localStorageService.get("message_" + id).message;
                var length = 0;
                if(num < 0 || !message) return;
                length = message.length;
                if(num < length){
                    messages = message.splice(length - num, length); 
                    return messages;  
                }else{
                    return message;
                }
            },
            updateMessage: function(message) {
                var id = 0;
                if (message) {
                    id = message.id;
                    localStorageService.update("message_" + id, message);
                }
            },
            deleteMessageId: function(id){
                var messageId = localStorageService.get("messageID");
                var length = 0;
                var i = 0;
                if(!messageId){
                    return null;
                }
                length = messageId.length;
                for(; i < length; i++){
                    if(messageId[i].id === id){
                        messageId.splice(i, 1);
                        break;
                    }
                }
                localStorageService.update("messageID", messageId);
            },
            clearMessage: function(message) {
                var id = 0;
                if (message) {
                    id = message.id;
                    localStorageService.clear("message_" + id);
                }
            },
            sendMessage: function(msg) {
                var obj={"isFromMe": true,"content": msg,"time": "2015-11-22 08:51:02"};
                this.messageDetails.push(obj);                
            }
        };
}])

.service('wsService',['loginService',function(loginService) {
    var callbacks = {};
    var currentCallbackId = 0;
    //初始化ws对象
    this.ws = {};

    this.ws.onopen = function(){
        //各controller自己复写该方法以实现功能
    };    

    this.ws.onclose = function () {
        //各controller自己复写该方法以实现功能
        // window.plugins.toast.showShortBottom('连接关闭', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
    };

    this.ws.onmessage = function(message) {
        //各controller自己复写该方法以实现功能
        window.plugins.toast.showLongBottom('收到：'+message.data, function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
    };

    this.sendMessage = function(msg){
        //各controller自己复写该方法以实现功能
        this.ws.send('{"head":1110,"body":"'+Base64.encode(msg)+'","tail":"PENPEN 1.0"}');
        //ws.send(msg);
    };

}])

.service('loginService',[function() {
    var user ="";
    var password="";
    var login=false;

    this.setUser = function(arg) {
        user=arg;
    };
    this.getUser = function() {
        //可以考虑添加个上次登陆时间
        if (login) {
            return user;
        } else {
            return '0';
        } 
    };
    this.setPassword = function(arg) {
        password=hex_md5(arg);
    };
    this.getLoginMsg = function(arg) {
        var msg='{"user":"'+user+'","password":"'+password+'"}';
        return msg;
    };
    this.logined = function() {
        login=true;
        ws = new WebSocket('ws://223.202.124.144:33888/');
        ws.onopen = function(){
            user=loginService.getUser();
            msg='{"user":"'+user+'","state":1}';
            this.send('{"head":1110,"body":"'+Base64.encode(msg)+'","tail":"PENPEN 1.0"}');
        };      
    };
    this.isLogged = function() {
        return login;
    };
}])

.service('parser',[function() {
    /*
    本服务将消息包body部分解码
    并转换成对象返回
    */
    //TODO* 判断编码方式，检查协议版本
    this.parseMsg=function (msg) {
        var msgObj=eval('('+msg+')');
        var msgBodyUncoded=eval('('+Base64.decode(msgObj.body)+')');
        return msgBodyUncoded;
    };
    this.parseCotent=function (content) {
        return Base64.decode(content);
    };

}])

.service('activeState',['loginService',function(loginService) {
    /*
    本服务将消息包body部分解码
    并转换成对象返回
    */
    //TODO* 判断编码方式，检查协议版本

    document.addEventListener('resume', function () {
        ws = new WebSocket('ws://223.202.124.144:33888/');

        ws.onopen = function(){
            user=loginService.getUser();
            msg='{"user":"'+user+'","state":1}';
            this.send('{"head":1110,"body":"'+Base64.encode(msg)+'","tail":"PENPEN 1.0"}');
        };    

        ws.onclose = function () {
        };

        ws.onmessage = function(message) {
        };
    });
    document.addEventListener('pause', function () {
        ws = new WebSocket('ws://223.202.124.144:33888/');

        ws.onopen = function(){
            user=loginService.getUser();
            msg='{"user":"'+user+'","state":2}';
            this.send('{"head":1110,"body":"'+Base64.encode(msg)+'","tail":"PENPEN 1.0"}');
        };    

        ws.onclose = function () {
        };

        ws.onmessage = function(message) {
        };
    });
}])

.service('mp3Service',['$timeout',function($timeout) {
    var mp3Message = new Media("/android_asset/www/mp3/message.mp3",function() {
            // window.plugins.toast.showShortBottom('打开音乐成功');
        },
        function(err) {
            // window.plugins.toast.showShortBottom('打开音乐失败');
        });
    this.playMessage = function(){
        mp3Message.play();
    };
/*    this.playLogin = function(){
        var mp3Login = new Media("/android_asset/www/mp3/samsung.mp3",function() {
            mp3Login.play();
            $timeout(function() {
            mp3Login.release();
        }, 5000);
        },
        function(err) {
            mp3Message.play();
        });


    };*/
}])