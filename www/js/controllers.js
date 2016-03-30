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

.controller('messageCtrl', function($scope, $state, $ionicPopup, localStorageService, messageService) {
    
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

})

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
        // console.log("enter");
        $scope.doRefresh = function() {
            // console.log("ok");
            messageService.messageNum += 5;
            $timeout(function() {
                // $scope.messageDetils = messageService.getAmountMessageById($scope.messageNum,
                    // $stateParams.messageId);
                messageService.messageDetails = messageService.getAmountMessageById(messageService.messageNum,$stateParams.messageId);
                $scope.$broadcast('scroll.refreshComplete');
            }, 200);
        };
        $scope.addLocalMsg=function(msg) {
            var obj={"isFromMe": true,"content": msg,"time": "2015-11-22 08:51:02"};
            // $scope.messageDetils.push(obj);
            messageService.messageDetails.push(obj);
        };
        $scope.del=function(idx){
            // $scope.messageDetils.splice(idx,1);
            messageService.messageDetails.splice(idx,1);
        };
        $scope.$on("$ionicView.beforeEnter", function() {
            // $scope.message = messageService.getMessageById($stateParams.messageId);
            // $scope.message.noReadMessages = 0;
            // $scope.message.showHints = false;
            // messageService.updateMessage($scope.message);
            // $scope.messageNum = 10;
            // $scope.messageDetils = messageService.getAmountMessageById($scope.messageNum,
            //     $stateParams.messageId);
            // $timeout(function() {
            //     viewScroll.scrollBottom();
            // }, 0);
            messageService.message = messageService.getMessageById($stateParams.messageId);
            messageService.message.noReadMessages = 0;
            messageService.message.showHints = false;
            messageService.updateMessage(messageService.message);
            messageService.messageNum = 10;
            messageService.messageDetails = messageService.getAmountMessageById(messageService.messageNum,$stateParams.messageId);
            $scope.messageDetails=messageService.messageDetails;
            $scope.message=messageService.message;
            $timeout(function() {
                viewScroll.scrollBottom();
            }, 0);
        });

        $scope.onSwipeRight = function() {
            $state.go("tab.message");
        };
 
        $scope.sendMessage= function(msg) {
            if (window["WebSocket"]) {
                //var wsMsg = new WebSocket('ws://192.168.1.11:8080/');
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
        $scope.$on("onMessage", function(event,data) {
            window.plugins.toast.showLongBottom('收到:'+data, function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});

        }); 


        window.addEventListener("native.keyboardshow", function(e){
            viewScroll.scrollBottom();
        });
    }
])

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
.controller('loginCtrl', ['$scope', '$rootScope', '$state', 'messageService', 'WebSocketService','loginService',
 function($scope,$rootScope, $state, messageService, WebSocketService,loginService) {

    $scope.$on("onMessage", function(event,data) {
        window.plugins.toast.showLongBottom('收到:'+data, function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});

    }); 
    $scope.login = function (user,password) {
        //该函数应当放在成功登陆以后执行
        window.plugins.jPushPlugin.setAlias("penpen"+user);

        loginService.setUser(user);
        loginService.setPassword(password);
        var msg=loginService.getLoginMsg();

        window.plugins.toast.showShortBottom(msg, function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
        
        WebSocketService.sendMessage(msg);

    };
}])