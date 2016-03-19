angular.module('wechat.controllers', [])

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

.controller('messageDetailCtrl', ['$scope', '$state','$stateParams',
    'messageService', '$ionicScrollDelegate', '$timeout',
    function($scope, $state, $stateParams, messageService, $ionicScrollDelegate, $timeout ) {
        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
        // console.log("enter");
        $scope.doRefresh = function() {
            // console.log("ok");
            $scope.messageNum += 5;
            $timeout(function() {
                $scope.messageDetils = messageService.getAmountMessageById($scope.messageNum,
                    $stateParams.messageId);
                $scope.$broadcast('scroll.refreshComplete');
            }, 200);
        };

        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.message = messageService.getMessageById($stateParams.messageId);
            $scope.message.noReadMessages = 0;
            $scope.message.showHints = false;
            messageService.updateMessage($scope.message);
            $scope.messageNum = 10;
            $scope.messageDetils = messageService.getAmountMessageById($scope.messageNum,
                $stateParams.messageId);
            $timeout(function() {
                viewScroll.scrollBottom();
            }, 0);
        });

        $scope.onSwipeRight = function() {
            $state.go("tab.message");
        };
        $scope.sendMessage= function(msg) {
            if (window["WebSocket"]) {
                var wsMsg = new WebSocket('ws://192.168.1.11:8081/');
 
                wsMsg.onopen = function() {
                    this.send(msg);
                }
                wsMsg.onclose = function(evt) {
                }
                wsMsg.onmessage = function(evt) {
                    window.plugins.toast.showShortBottom('收到信息：'+evt.data, function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
                }
            }
            else {
                window.plugins.toast.showShortBottom('Your browser does not support WebSockets.', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
            }
        }


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
.controller('loginCtrl', function($scope, $state) {

})