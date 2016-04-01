angular.module('penpen.controllers', [])

.controller('broadcastCtrl', function($scope, $state) {
    $scope.onSwipeLeft = function() {
        $state.go("tab.setting");
    };
    $scope.onSwipeRight = function() {
        $state.go("tab.friends");
    };

    //
    
    $scope.$on("$ionicView.beforeEnter", function(){
        // console.log($scope.messages);
        $scope.messages = messageService.getBroadcast();
    }); 
})

.controller('messageCtrl', ['$scope', '$state', '$ionicPopup', 'localStorageService',
 'messageService', 'WebSocketService',
 function($scope, $state, $ionicPopup, localStorageService, messageService, WebSocketService) {
    
    // $scope.messages = messageService.getAllMessages();
    // console.log($scope.messages);
    $scope.onSwipeLeft = function() {
        $state.go("tab.friends");
    };
    $scope.popupMessageOpthins = function(message) {
        $scope.popup.index = $scope.messages.indexOf(message);
        $scope.popup.optionsPopup = $ionicPopup.show({
            templateUrl: "templates/popup.html",
            scope: $scope,
        });
        $scope.popup.isPopup = true;
    };
    $scope.markMessage = function() {
        var index = $scope.popup.index;
        var message = $scope.messages[index];
        if (message.showHints) {
            message.showHints = false;
            message.noReadMessages = 0;
        } else {
            message.showHints = true;
            message.noReadMessages = 1;
        }
        $scope.popup.optionsPopup.close();
        $scope.popup.isPopup = false;
        messageService.updateMessage(message);
    };
    $scope.deleteMessage = function() {
        var index = $scope.popup.index;
        var message = $scope.messages[index];
        $scope.messages.splice(index, 1);
        $scope.popup.optionsPopup.close();
        $scope.popup.isPopup = false;
        messageService.deleteMessageId(message.id);
        messageService.clearMessage(message);
    };
    $scope.topMessage = function() {
        var index = $scope.popup.index;
        var message = $scope.messages[index];
        if (message.isTop) {
            message.isTop = 0;
        } else {
            message.isTop = new Date().getTime();
        }
        $scope.popup.optionsPopup.close();
        $scope.popup.isPopup = false;
        messageService.updateMessage(message);
    };
    $scope.messageDetails = function(message) {
        $state.go("messageDetail", {
            "messageId": message.id
        });
    };
    $scope.$on("$ionicView.beforeEnter", function(){
        // console.log($scope.messages);
        $scope.messages = messageService.getAllMessages();
        $scope.popup = {
            isPopup: false,
            index: 0
        };
    });
    WebSocketService.ws.onmessage=function(message) {
            window.plugins.toast.showShortBottom('tab msg!：'+message.data, function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
    };
}])

.controller('friendsCtrl', function($scope, $state) {
    $scope.onSwipeLeft = function() {
        $state.go("tab.broadcast");
    };
    $scope.onSwipeRight = function() {
        $state.go("tab.message");
    };
    $scope.contacts_right_bar_swipe = function(e){
        console.log(e);
    };
    $scope.groups = [];
    for (var i=0; i<3; i++) {
        $scope.groups[i] = {
            name: '部门',
            items: [],
            show: true
        };
        for (var j=0; j<3; j++) {
            $scope.groups[i].items.push(j);
        }
    }
      
    /*
    * if given group is the selected group, deselect it
    * else, select the given group
    */
    $scope.toggleGroup = function(group) {
        group.show = !group.show;
    };
    $scope.isGroupShown = function(group) {
        return group.show;
    };
})

.controller('settingCtrl', function($scope, $state) {
    $scope.onSwipeRight = function() {
        $state.go("tab.broadcast");
    };
})

.controller('messageDetailCtrl', ['$scope', '$rootScope', '$state','$stateParams',
 'messageService', '$ionicScrollDelegate', '$timeout', 'WebSocketService',
 function($scope, $rootScope,$state, $stateParams, messageService, $ionicScrollDelegate, $timeout, WebSocketService) {
    var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
    $scope.doRefresh = function() {
        messageService.messageNum += 5;
        $timeout(function() {
            messageService.messageDetails = messageService.getAmountMessageById(messageService.messageNum,$stateParams.messageId);
            $scope.$broadcast('scroll.refreshComplete');
        }, 200);
    };
    $scope.addLocalMsg=function(msg) {
        messageService.sendMessage(msg);
    };
    $scope.del=function(idx){
        messageService.messageDetails.splice(idx,1);
    };
    $scope.$on("$ionicView.beforeEnter", function() {
        messageService.message = messageService.getMessageById($stateParams.messageId);
        messageService.message.noReadMessages = 0;
        messageService.message.showHints = false;
        messageService.updateMessage(messageService.message);
        messageService.messageNum = 10;
        messageService.messageDetails = messageService.getAmountMessageById(messageService.messageNum,$stateParams.messageId);
        $scope.messageDetails=messageService.messageDetails;
        $scope.message=messageService.message;
        $timeout(function() {
            viewScroll.scrollBottom(true);
        }, 0);
    });

    //这是收到数据的函数
    //Override ws.onmessage
    WebSocketService.ws.onmessage=function(message) {
        window.plugins.toast.showShortBottom('controller!：'+message.data, function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
        $scope.$apply(function() {
            var obj={"isFromMe": false,"content": message.data,"time": "2015-11-22 08:51:02"};
            $scope.messageDetails.push(obj);
            $timeout(function() {
                viewScroll.scrollBottom(true);
        }, 0);
        });
    }


    $scope.onSwipeRight = function() {
        $state.go("tab.message");
    };

    $scope.sendMessage= function(msg) {
        if (window["WebSocket"]) {
            var wsMsg = new WebSocket('ws://223.202.124.144:21888/');

            wsMsg.onopen = function() {
                jsonMsg='{"from":"15228977313","to":"15669910253","type":"0","content":"' + Base64.encode(msg) + '"}';
                this.send('{"head":1110,"body":"'+Base64.encode(jsonMsg)+'","tail":"PENPEN 1.0"}');
            }
            wsMsg.onclose = function(evt) {
            }
            wsMsg.onmessage = function(evt) {
                window.plugins.toast.showLongBottom('收到信息：'+evt.data+'\n'+Base64.decode(evt.data), function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
            }
        }
        else {
            window.plugins.toast.showLongBottom('Your browser does not support WebSockets.', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
        }
    };

    window.addEventListener("native.keyboardshow", function(e){
        viewScroll.scrollBottom();
    });
}])

.controller('personDetailCtrl', function($scope, $state) {
    $scope.onSwipeRight = function() {
        $state.go("tab.friends");
    };
})

.controller('userDetailCtrl', function($scope, $state) {
    $scope.onSwipeRight = function() {
        $state.go("tab.setting");
    };
})

.controller('aboutCtrl', function($scope, $state) {
    $scope.onSwipeRight = function() {
        $state.go("tab.setting");
    };
})

.controller('loginCtrl', ['$scope','$location', '$state', 'loginService', 'parser',
 function($scope, $location, $state, loginService, parser) {

    /*
    输入用户名密码后，点击按钮发送登陆消息包
    等待返回结果，同时登录按钮disabled
    收到返回消息：
    1、成功，跳转页面至联系人
    2、失败，留在页面，按钮reabled
    */


    $scope.logining=false;
    $scope.login = function (user,password) {
        $scope.logining=true;
        loginService.setUser(user);
        loginService.setPassword(password);

        var wsLogin = new WebSocket('ws://223.202.124.144:20888/');

        wsLogin.onopen = function() {
            this.send('{"head":1110,"body":"'+Base64.encode(loginService.getLoginMsg())+'","tail":"PENPEN 1.0"}');
        }
        wsLogin.onclose = function(evt) {

        }
        wsLogin.onmessage = function(evt) {
            // window.plugins.toast.showShortBottom('收到：'+evt.data, function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
            var result=parser.parseMsg(evt.data);
            window.plugins.toast.showShortBottom('state：'+result.state, function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
            if (result.state==11) {
                //登录成功
                window.plugins.toast.showShortBottom('登录成功', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
                window.plugins.jPushPlugin.setAlias("penpen"+user);
                $scope.$apply(function() {
                    $scope.logining=false;
                    $location.path('/tab/message');
                });
            }
            else if (result.state==12) {
                window.plugins.toast.showLongBottom('登录失败', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
                $scope.$apply(function() {$scope.logining=false;});
            }else{
                window.plugins.toast.showLongBottom('登录异常', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
                $scope.$apply(function() {$scope.logining=false;});
            }
        }

    };
}])
