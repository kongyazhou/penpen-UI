angular.module('penpen.controllers', [])

.controller('messageCtrl', ['$scope', '$state', '$timeout', '$ionicPopup', 'parser', 'wsService', 'loginService', 'mp3Service', 'contactService', 'sqliteService', 'activeState',
    function($scope, $state, $timeout, $ionicPopup, parser, wsService, loginService, mp3Service, contactService, sqliteService, activeState) {
        $scope.$on("$ionicView.beforeEnter", function() {
            //TODO 从服务器同步离线未读消息存入sqlite
            //TODO 从lastMessage表读取消息
            // console.log($scope.messages);
            $scope.messages = sqliteService.getLastMessages();
            // $scope.messages = messageService.getAllMessages();
            $scope.popup = {
                isPopup: false,
                index: 0
            };

            $scope.$apply(function() {});
        });

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
                "user": message
            });
        };

        wsService.ws.onopen = function() {
            wsService.sendMessage(loginService.getLoginMsg());
        };

        wsService.ws.onmessage = function(evt) {
            // window.plugins.toast.showShortBottom('controller!：'+evt.data);
            var msg = parser.parseMsg(evt.data);
            // window.plugins.toast.showShortBottom('msg:' + msg);
            var msgObj = {
                "from": msg.from,
                "isFromMe": 0,
                "content": parser.parseCotent(msg.content),
                "time": msg.time
            };
            // 判断消息是否属于本聊
            // window.plugins.toast.showShortBottom('Else msg:' + msg);
            // 将message存入sqlite
            sqliteService.addNewMessageRecv(msgObj);
            //更新界面
            $scope.messages = sqliteService.getLastMessages();
            $timeout(function() {
                $scope.$apply(function() {
                    // $scope.messages=$scope.messages;
                });
            }, 200);
        };

    }
])

.controller('messageDetailCtrl', ['$scope', '$state', '$stateParams', '$ionicScrollDelegate', '$timeout', 'parser', 'wsService', 'loginService', 'mp3Service', 'contactService', 'sqliteService',
    function($scope, $state, $stateParams, $ionicScrollDelegate, $timeout, parser, wsService, loginService, mp3Service, contactService, sqliteService) {
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.contact = contactService.getContact($stateParams.user);
            $scope.messageDetails = sqliteService.getContactMessages($scope.contact.user);
            $scope.self = loginService.getUserContact();
            sqliteService.setReaded($scope.contact.user);
            $timeout(function() {
                viewScroll.scrollBottom(true);
            }, 200);
        });

        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');

        $scope.onSwipeRight = function() {
            $state.go("tab.message");
        };

        //连接断开时重发登陆消息
        wsService.ws.onopen = function() {
            wsService.sendMessage(loginService.getLoginMsg());
        };

        //这是收到消息的函数
        //Override ws.onmessage
        wsService.ws.onmessage = function(evt) {
            // window.plugins.toast.showShortBottom('controller!：'+evt.data);
            var msg = parser.parseMsg(evt.data);
            // window.plugins.toast.showShortBottom('msg:' + msg);
            var msgObj = {
                "from": msg.from,
                "isFromMe": 0,
                "content": parser.parseCotent(msg.content),
                "time": msg.time
            };
            // 判断消息是否属于本聊天
            if (msg.from == $scope.contact.user) {
                // window.plugins.toast.showShortBottom('msg：'+msg);
                // window.plugins.toast.showShortBottom('content:' + msg.content);
                //将消息添加到聊天界面                
                $scope.messageDetails.push(msgObj);
                // 播放收到消息提示音
                mp3Service.playMessage();
                $timeout(function() {
                    viewScroll.scrollBottom(true);
                }, 0);
                // 将message存入sqlite
                sqliteService.addNewMessageRecvReaded(msgObj);
            } else {
                // window.plugins.toast.showShortBottom('Else msg:' + msg);
                // 将message存入sqlite
                sqliteService.addNewMessageRecv(msgObj);
            }
        };

        //这是发送消息的函数
        $scope.addLocalMsg = function(msg) {
            var date = new Date();
            var msgObj = {
                "to": $scope.contact.user,
                "isFromMe": true,
                "content": msg,
                "time": date
            };

            $scope.messageDetails.push(msgObj);

            // 发送消息的提示音
            mp3Service.playMessage();
            // 更新lastMessage表的lastMessage和lastTime
            // 将message插入联系人的allMessage表
            sqliteService.addNewMessageSend(msgObj);

        };
        $scope.sendMessage = function(msg) {
            if (window.WebSocket) {
                var wsMsg = new WebSocket('ws://52.69.156.153:21888/');

                wsMsg.onopen = function() {
                    jsonMsg = '{"from":"' + loginService.getUser() + '","to":"' + $scope.contact.user + '","type":"0","content":"' + Base64.encode(msg) + '"}';
                    this.send('{"head":1110,"body":"' + Base64.encode(jsonMsg) + '","tail":"PENPEN 1.0"}');
                };
                wsMsg.onclose = function(evt) {};
                wsMsg.onmessage = function(evt) {
                    // window.plugins.toast.showLongBottom('收到信息：' + evt.data + '\n' + Base64.decode(evt.data));
                };
            } else {
                // window.plugins.toast.showLongBottom('Your browser does not support WebSockets.');
            }
        };

    }
])

.controller('loginCtrl', ['$scope', '$location', '$state', 'loginService', 'parser', 'wsService', 'sqliteService', 'contactService',
    function($scope, $location, $state, loginService, parser, wsService, sqliteService, contactService) {
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
            loginService.setUser(user);
            loginService.setPassword(password);

            wsService.ws = new ReconnectingWebSocket('ws://52.69.156.153:20888/');

            wsService.ws.onopen = function() {
                //打开立即发送登陆消息
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
                    // window.plugins.toast.showShortBottom('登录成功');

                    window.plugins.jPushPlugin.setAlias("penpen" + user);
                    contactService.init();
                    loginService.logined();
                    sqliteService.openDatabase();
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
        };

    }
])

.controller('friendsCtrl', ['$scope', '$state', 'contactService', function($scope, $state, contactService) {
    $scope.$on("$ionicView.beforeEnter", function() {
        $scope.$apply(function() {});
    });

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
            "user": contact.user
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

.controller('personDetailCtrl', ['$scope', '$state', '$stateParams', 'contactService', function($scope, $state, $stateParams, contactService) {
    $scope.onSwipeRight = function() {
        $state.go("tab.friends");
    };

    $scope.contact = contactService.getContact($stateParams.user);

    $scope.messageDetails = function(user) {
        //TODO 更新lastMessage表的lastTime
        $state.go("messageDetail", {
            "user": user
        });
    };
}])

.controller('broadcastCtrl', ['$scope', '$state', function($scope, $state) {
    $scope.$on("$ionicView.beforeEnter", function() {
        // console.log($scope.messages);
        $scope.messages = messageService.getBroadcast();
    });

    $scope.onSwipeLeft = function() {
        $state.go("tab.setting");
    };

    $scope.onSwipeRight = function() {
        $state.go("tab.friends");
    };

    //
}])

.controller('aboutCtrl', ['$scope', '$state', 'sqliteService', function($scope, $state, sqliteService) {
    $scope.onSwipeRight = function() {
        $state.go("tab.setting");
    };
    /*    $scope.test = function() {
            $scope.obj = sqliteService.getLastMessages();
            $scope.lastMessage = $scope.obj[1].lastMessage;
            $scope.data = $scope.obj[1].user;
            $scope.$apply(function() {});
            // body...
            window.plugins.toast.showShortBottom($scope.lastMessage);
        };*/
}])

.controller('createGroupCtrl', ['$scope', '$state', 'contactService', function($scope, $state, contactService) {
    $scope.$on("$ionicView.beforeEnter", function() {
        $scope.groups = contactService.getGroups();
        $scope.$apply(function() {});
    });

    $scope.onSwipeRight = function() {
        $state.go("tab.friends");
    };
}])

.controller('userDetailCtrl', ['$scope', '$state', 'loginService', 'contactService', function($scope, $state, loginService, contactService) {

    $scope.$on("$ionicView.beforeEnter", function() {
        // console.log($scope.messages);
        $scope.contact = loginService.getUserContact();
        $scope.signing = $scope.contact.signing;
        $scope.$apply(function() {});
    });

    $scope.onSwipeRight = function() {
        $state.go("tab.setting");
    };

    $scope.updateSigning = function(signing) {
        var wsSigning = new WebSocket('ws://52.69.156.153:31888/');

        wsSigning.onopen = function() {
            jsonMsg = '{"user":"' + $scope.contact.user + '","signing":"' + Base64.encode(signing) + '"}';
            this.send('{"head":1110,"body":"' + Base64.encode(jsonMsg) + '","tail":"PENPEN 1.0"}');
        };
        wsSigning.onclose = function(evt) {
            contactService.setSigning($scope.contact.user, signing);
            $scope.contact.signing = signing;
            $scope.$apply(function() {});
        };
        wsSigning.onmessage = function(evt) {
            // window.plugins.toast.showLongBottom('收到信息：' + evt.data + '\n' + Base64.decode(evt.data));
        };
    };
    $scope.updateIcon = function() {

        window.imagePicker.getPictures(
            function(results) {
                var win = function(r) {
                    // window.plugins.toast.showLongBottom(r.responseCode);
                };
                //config fail
                var fail = function(error) {
                    window.plugins.toast.showLongBottom(error.code);
                };
                //config options
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = $scope.contact.user + ".jpg";
                options.mimeType = "image/jpeg";
                //config options.para
                var params = {};
                params.value1 = "test";
                params.value2 = "param";

                options.params = params;
                //do trandfer
                for (var i = 0; i < results.length; i++) {
                    // window.plugins.toast.showLongBottom('Image URI: ' + results[i]);
                    var ft = new FileTransfer();
                    ft.upload(results[i], encodeURI("http://52.69.156.153/upload.php"), win, fail, options);
                }
                //TODO
                // contactService.setIcon($scope.contact.user, results[i]);
                // $scope.contact.icon = results[i];
                // $scope.$apply(function() {});
            },
            function(error) {
                window.plugins.toast.showLongBottom('Error: ' + error);
            }, {
                maximumImagesCount: 1,
                width: 128,
                height: 128
            }
        );
        /*navigator.camera.getPicture(onSuccess, onFail, {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM
        });

        function onSuccess(imageURI) {
            // var image = document.getElementById('myImage');
            // image.src = imageURI;
            window.plugins.toast.showLongBottom('上传成功');
        }

        function onFail(message) {
            window.plugins.toast.showLongBottom('取消更换头像：' + message);
        }*/
    };
}])

.controller('settingCtrl', ['$scope', '$state', 'loginService', 'sqliteService', function($scope, $state, loginService, sqliteService) {
    $scope.$on("$ionicView.beforeEnter", function() {
        // console.log($scope.messages);
        $scope.contact = loginService.getUserContact();
    });

    $scope.onSwipeRight = function() {
        $state.go("tab.broadcast");
    };

    // $scope.contact = loginService.getUserContact();
    $scope.logoff = function() {
        loginService.logoff();
        sqliteService.closeDatabase();
        $state.go("login");
    };
    // $scope.contact = contactService.getContact("12345678900");
}]);