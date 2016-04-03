angular.module('penpen.controllers', [])

.controller('messageCtrl', ['$scope', '$state', '$ionicPopup', 'localStorageService',
    'messageService', 'activeState',
    function($scope, $state, $ionicPopup, localStorageService, messageService, activeState) {

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
                "name": message.name,
                "user": message.user,
                "icon": message.icon,
                "job" : message.job 
            });
        };
        $scope.$on("$ionicView.beforeEnter", function() {
            //TODO 从服务器同步离线未读消息存入sqlite
            //TODO 从lastMessage表读取消息
            // console.log($scope.messages);
            $scope.messages = messageService.getAllMessages();
            $scope.popup = {
                isPopup: false,
                index: 0
            };
        });
    }
])

.controller('messageDetailCtrl', ['$scope', '$state', '$stateParams',
    'messageService', '$ionicScrollDelegate', '$timeout', 'parser', 'wsService', 'loginService', 'mp3Service',
    function($scope, $state, $stateParams, messageService, $ionicScrollDelegate, $timeout, parser, wsService, loginService, mp3Service) {
        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
        $scope.doRefresh = function() {
            messageService.messageNum += 5;
            $timeout(function() {
                messageService.messageDetails = messageService.getAmountMessageById(messageService.messageNum, $stateParams.messageId);
                $scope.$broadcast('scroll.refreshComplete');
            }, 200);
        };

        $scope.del = function(idx) {
            messageService.messageDetails.splice(idx, 1);
        };
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.contact=$stateParams;
            // messageService.message = messageService.getMessageById($stateParams.messageId);
            // messageService.message.noReadMessages = 0;
            // messageService.message.showHints = false;
            // messageService.updateMessage(messageService.message);
            // messageService.messageNum = 10;
            // messageService.messageDetails = messageService.getAmountMessageById(messageService.messageNum,$stateParams.messageId);
            // $scope.messageDetails=messageService.messageDetails;
            // $scope.message=messageService.message;
            // messageService.message = messageService.getMessageByUser($stateParams.User);
            //TODO 设置所有消息unread为0 unreadNo为0
            messageService.message.showHints = false;
            $timeout(function() {
                viewScroll.scrollBottom(true);
            }, 0);
        });
        wsService.ws.onopen = function() {
                wsService.sendMessage(loginService.getLoginMsg());
            }
            //这是收到消息的函数
            //TODO 收到消息的提示音
            //Override ws.onmessage
        wsService.ws.onmessage = function(evt) {
            // window.plugins.toast.showShortBottom('controller!：'+evt.data);
            var msg = parser.parseMsg(evt.data);
            //TODO 判断消息是否属于本聊天
            if (true) {}
            // window.plugins.toast.showShortBottom('msg：'+msg);
            window.plugins.toast.showLongBottom('content：' + msg.content);
            //TODO 更新lastMessage表的lastMessage和lastTime
            //TODO 将message插入联系人的allMessage表
            //将消息添加到聊天界面
            $scope.$apply(function() {
                var obj = {
                    "isFromMe": false,
                    "content": parser.parseCotent(msg.content),
                    "time": "2015-11-22 08:51:02"
                };
                $scope.messageDetails.push(obj);
                mp3Service.playMessage();
                $timeout(function() {
                    viewScroll.scrollBottom(true);
                }, 0);
            });
        };


        $scope.onSwipeRight = function() {
            $state.go("tab.message");
        };
        //这是发送消息的函数
        $scope.addLocalMsg = function(msg) {
            messageService.sendMessage(msg);
            mp3Service.playMessage();
            //TODO 更新lastMessage表的lastMessage和lastTime
            //TODO 将message插入联系人的allMessage表
        };
        $scope.sendMessage = function(msg) {
            if (window["WebSocket"]) {
                var wsMsg = new WebSocket('ws://223.202.124.144:21888/');

                wsMsg.onopen = function() {
                    jsonMsg = '{"from":"15228977313","to":"15669910253","type":"0","content":"' + Base64.encode(msg) + '"}';
                    this.send('{"head":1110,"body":"' + Base64.encode(jsonMsg) + '","tail":"PENPEN 1.0"}');
                }
                wsMsg.onclose = function(evt) {}
                wsMsg.onmessage = function(evt) {
                    window.plugins.toast.showLongBottom('收到信息：' + evt.data + '\n' + Base64.decode(evt.data));
                }
            } else {
                window.plugins.toast.showLongBottom('Your browser does not support WebSockets.');
            }
        };

        window.addEventListener("native.keyboardshow", function(e) {
            viewScroll.scrollBottom();
        });
    }
])

.controller('loginCtrl', ['$scope', '$location', '$state', 'loginService', 'parser', 'wsService',
    function($scope, $location, $state, loginService, parser, wsService) {
        /*
        输入用户名密码后，点击按钮发送登陆消息包
        等待返回结果，同时登录按钮disabled
        收到返回消息：
        1、成功，跳转页面至联系人
        2、失败，留在页面，按钮reabled
        */
        $scope.logining = false;
        $scope.login = function(user, password) {
            //TODO 网络异常，无法建立连接时的处理
            $scope.logining = true;
            if (user == "15669910253") {
                window.plugins.jPushPlugin.setAlias("penpen" + user);
                $scope.$apply(function() {
                    //TODO 为什么没有跳转？超级用户无效....
                    $scope.logining = false;
                    // $location.path('/tab/message');
                });
                var db = window.sqlitePlugin.openDatabase({
                        name: 'penpen.msg',
                        iosDatabaseLocation: 'default'
                    },
                    function(db) {
                        window.plugins.toast.showShortBottom('打开数据库成功');
                        db.transaction(function(tx) {
                            tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (id integer primary key, data text,  data_num integer)');
                            tx.executeSql("INSERT INTO test_table (data, data_num) VALUES (?,?)", ["R U OK?", 100]);
                        });
                    },
                    function(db) {
                        window.plugins.toast.showShortBottom('打开数据库失败');
                    });
                // window.plugins.toast.showShortBottom('登录成功');
            } else if (user == "12345678910") {
                var db = window.sqlitePlugin.openDatabase({
                        name: 'penpen.msg',
                        iosDatabaseLocation: 'default'
                    },
                    function(db) {
                        db.transaction(function(tx) {
                            tx.executeSql("select data from test_table;", [], function(tx, res) {
                                // window.plugins.toast.showShortBottom(res.rows.length);
                                window.plugins.toast.showLongBottom(res.rows.item(0).data);
                                // window.plugins.toast.showLongBottom(res.rows.item(1).data_num);
                                // console.log("res.rows.length: " + res.rows.length + " -- should be 1");
                                // console.log("res.rows.item(0).cnt: " + res.rows.item(0).cnt + " -- should be 1");
                            });
                        });
                    },
                    function(db) {
                        window.plugins.toast.showShortBottom('打开数据库失败');
                    });
                $scope.$apply(function() {
                    //TODO 为什么没有跳转？超级用户无效....
                    $scope.logining = false;
                    // $location.path('/tab/message');
                });
            } else {
                loginService.setUser(user);
                loginService.setPassword(password);

                wsService.ws = new ReconnectingWebSocket('ws://223.202.124.144:20888/');

                wsService.ws.onopen = function() {
                    wsService.sendMessage(loginService.getLoginMsg());
                };
                wsService.ws.onclose = function(evt) {

                };
                wsService.ws.onmessage = function(evt) {
                    // window.plugins.toast.showShortBottom('收到：'+evt.data);
                    var result = parser.parseMsg(evt.data);
                    // window.plugins.toast.showShortBottom('state：'+result.state);
                    if (result.state == 11) {
                        //登录成功
                        window.plugins.toast.showShortBottom('登录成功');

                        window.plugins.jPushPlugin.setAlias("penpen" + user);
                        loginService.logined();
                        // mp3Service.playLogin();
                        $scope.$apply(function() {
                            $scope.logining = false;
                            $location.path('/tab/message');
                        });

                    } else if (result.state == 12) {
                        window.plugins.toast.showLongBottom('登录失败');
                        wsService.ws.close();
                        $scope.$apply(function() {
                            $scope.logining = false;
                        });
                    } else {
                        window.plugins.toast.showLongBottom('登录异常');
                        wsService.ws.close();
                        $scope.$apply(function() {
                            $scope.logining = false;
                        });
                    }
                };
            }

        };
    }
])

.controller('friendsCtrl', ['$scope', '$state', 'contactService', function($scope, $state, contactService) {
    $scope.onSwipeLeft = function() {
        $state.go("tab.broadcast");
    };
    $scope.onSwipeRight = function() {
        $state.go("tab.message");
    };
    /*$scope.contacts_right_bar_swipe = function(e){
        console.log(e);
    };*/

    $scope.personDetail = function(contact) {
        $state.go("personDetail", {
            "name": contact.name,
            "user": contact.user,
            "icon": contact.icon,
            "job": contact.job
        });
    };
    $scope.groups = contactService.getGroups();
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
}])

.controller('personDetailCtrl', ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
    $scope.onSwipeRight = function() {
        $state.go("tab.friends");
    };
    $scope.contact = $stateParams;
    $scope.messageDetails = function(user) {
        //TODO 更新lastMessage表的lastTime
        $state.go("messageDetail", {
            "messageId": 7
        });
    };
}])

.controller('broadcastCtrl', function($scope, $state) {
    $scope.onSwipeLeft = function() {
        $state.go("tab.setting");
    };
    $scope.onSwipeRight = function() {
        $state.go("tab.friends");
    };

    //

    $scope.$on("$ionicView.beforeEnter", function() {
        // console.log($scope.messages);
        $scope.messages = messageService.getBroadcast();
    });
})

.controller('aboutCtrl', function($scope, $state) {
    $scope.onSwipeRight = function() {
        $state.go("tab.setting");
    };
})

.controller('userDetailCtrl', ['$scope', '$state', 'loginService', function($scope, $state, loginService) {
    $scope.onSwipeRight = function() {
        $state.go("tab.setting");
    };
    $scope.contact = loginService.getUserContact();
}])

.controller('settingCtrl', ['$scope', '$state', 'loginService', function($scope, $state, loginService) {
    $scope.onSwipeRight = function() {
        $state.go("tab.broadcast");
    };
    $scope.contact = loginService.getUserContact();
    // $scope.contact = contactService.getContact("12345678900");
}])