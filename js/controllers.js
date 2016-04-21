angular.module('penpen.controllers', [])

.controller('messageCtrl', ['$scope', '$state', '$timeout', '$ionicPopup', 'parser', 'wsService', 'loginService', 'mp3Service', 'contactService', 'sqliteService', 'activeState', 'groupService',
    function($scope, $state, $timeout, $ionicPopup, parser, wsService, loginService, mp3Service, contactService, sqliteService, activeState, groupService) {
        $scope.$on("$ionicView.beforeEnter", function() {
            // $scope.gmessages = sqliteService.getLastGroupMessages();
            /*            $scope.gmessages = [{
                            "gid": 123,
                            "name": "测试组",
                            "lastMessage": "这是一条测试消息",
                            "lastTime": "2002-1-1",
                            "unreadNo": 3
                        }];*/
            $scope.messages = sqliteService.getLastMessages();
            $scope.popup = {
                isPopup: false,
                index: 0
            };

            wsService.ws.onmessage = function(evt) {
                // window.plugins.toast.showShortBottom('controller!：'+evt.data);
                var msg = parser.parseMsg(evt.data);
                var msgObj = {};
                // window.plugins.toast.showShortBottom('msg:' + msg);
                if (msg.type === 0) {
                    msgObj = {
                        "from": msg.from,
                        "isFromMe": 0,
                        "content": parser.parseCotent(msg.content),
                        "time": msg.time
                    };
                    // window.plugins.toast.showShortBottom('time:' + msg.time);
                    // 将message存入消息数据库，并更新lastMessage表
                    mp3Service.playMessage();
                    sqliteService.addNewMessageRecv(msgObj);
                    //重新获取lastMessage表，并更新界面
                    $scope.messages = sqliteService.getLastMessages();
                    $timeout(function() {
                        $scope.$apply(function() {
                            // $scope.messages=$scope.messages;
                        });
                    }, 200);
                } else if (msg.type === 10) {
                    msgObj = {
                        "from": msg.from,
                        "to": msg.to, //群id
                        "isFromMe": 0,
                        "content": parser.parseCotent(msg.content),
                        "time": msg.time //TODO
                    };
                    //将消息存入群消息数据库，并更新lastMessage表
                    sqliteService.addNewGroupMessageRecv(msgObj);
                    mp3Service.playMessage();
                    //重新获取lastMessage表，并更新界面
                    $scope.messages = sqliteService.getLastMessages();
                    $timeout(function() {
                        $scope.$apply(function() {
                            // $scope.messages=$scope.messages;
                        });
                    }, 200);

                } else if (msg.type === 19) {
                    //收到创建group通知组成消息，按正常消息存入
                    // window.plugins.toast.showLongBottom('收到创建通知');
                    groupService.init();
                    var contentObj = eval('(' + parser.parseCotent(msg.content) + ')');
                    // window.plugins.toast.showShortBottom(JSON.stringify(contentObj));
                    var content = contentObj.holder + '创建了讨论组"' + parser.parseCotent(contentObj.name) + '",邀请了：' + contentObj.member;
                    msgObj = {
                        // "from": "0",
                        "to": msg.to, //gid
                        "isFromMe": 0,
                        "name": parser.parseCotent(contentObj.name),
                        "content": content,
                        "time": msg.time //TODO
                    };
                    // window.plugins.toast.showShortBottom(content + "!!!" + msg.to);
                    //将消息存入群消息数据库，并更新lastMessage表
                    sqliteService.addNewGroupMessageRecv(msgObj);
                    mp3Service.playMessage();
                    //重新获取lastMessage表，并更新界面
                    $scope.messages = sqliteService.getLastMessages();
                    $timeout(function() {
                        $scope.$apply(function() {
                            // $scope.messages=$scope.messages;
                        });
                    }, 200);
                }
            };

            for (var i = 0; i < 25; i++) {
                $timeout(refresh, 200 * i);
            }
        });

        var refresh = function() {
            $scope.$apply(function() {});
        };

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

        $scope.messageDetails = function(type, message) {
            if (type === 0) {
                $state.go("messageDetail", {
                    "user": message
                });
            } else if (type === 1) {
                $state.go("gmessageDetail", {
                    "gid": message
                });
            } else {
                window.plugins.toast.showLongBottom(type);
            }

        };

        wsService.ws.onopen = function() {
            wsService.sendMessage(loginService.getLoginMsg());
        };


    }
])

.controller('messageDetailCtrl', ['$scope', '$state', '$stateParams', '$ionicScrollDelegate', '$timeout', 'parser', 'wsService', 'loginService', 'mp3Service', 'contactService', 'sqliteService', 'timeService',
    function($scope, $state, $stateParams, $ionicScrollDelegate, $timeout, parser, wsService, loginService, mp3Service, contactService, sqliteService, timeService) {
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.contact = contactService.getContact($stateParams.user);
            $scope.messageDetails = sqliteService.getContactMessages($scope.contact.user);
            $scope.self = loginService.getUserContact();
            sqliteService.setReaded($scope.contact.user);
            //这是收到消息的函数
            //Override ws.onmessage
            wsService.ws.onmessage = function(evt) {
                // window.plugins.toast.showShortBottom('controller!：'+evt.data);
                var msg = parser.parseMsg(evt.data);
                msgObj = {};
                // window.plugins.toast.showShortBottom('msg:' + msg);

                // 判断消息是否属于本聊天
                if (msg.type === 0) {
                    msgObj = {
                        "from": msg.from,
                        "isFromMe": 0,
                        "content": parser.parseCotent(msg.content),
                        "time": msg.time
                    };
                    if (msg.from == $scope.contact.user) {
                        // window.plugins.toast.showShortBottom('msg：'+msg);
                        // window.plugins.toast.showShortBottom('content:' + msg.content);
                        //将消息添加到聊天界面                
                        $scope.messageDetails.push(msgObj);
                        // 播放收到消息提示音
                        mp3Service.playMessage();
                        $timeout(function() {
                            viewScroll.scrollBottom(true);
                            $scope.$apply(function() {});
                        }, 200);
                        // 将message存入sqlite
                        sqliteService.addNewMessageRecvReaded(msgObj);
                    } else {
                        // window.plugins.toast.showShortBottom('Else msg:' + msg);
                        // 将message存入sqlite
                        sqliteService.addNewMessageRecv(msgObj);
                    }
                } else if (msg.type === 10) {
                    msgObj = {
                        "from": msg.from,
                        "to": msg.to, //群id
                        "isFromMe": 0,
                        "content": parser.parseCotent(msg.content),
                        "time": msg.time //TODO
                    };
                    //将消息存入群消息数据库，并更新lastMessage表
                    mp3Service.playMessage();
                    sqliteService.addNewGroupMessageRecv(msgObj);
                } else if (msg.type === 19) {
                    //收到创建group通知组成消息，按正常消息存入
                    // window.plugins.toast.showLongBottom('收到创建通知');
                    groupService.init();
                    var contentObj = eval('(' + parser.parseCotent(msg.content) + ')');
                    // window.plugins.toast.showShortBottom(JSON.stringify(contentObj));
                    var content = contentObj.holder + '创建了讨论组"' + parser.parseCotent(contentObj.name) + '"';
                    msgObj = {
                        // "from": "0",
                        "to": msg.to, //gid
                        "isFromMe": 0,
                        "name": parser.parseCotent(contentObj.name),
                        "content": content,
                        "time": msg.time //TODO
                    };
                    // window.plugins.toast.showShortBottom(content + "!!!" + msg.to);
                    //将消息存入群消息数据库，并更新lastMessage表
                    mp3Service.playMessage();
                    sqliteService.addNewGroupMessageRecv(msgObj);
                }
            };
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

        $scope.personDetail = function(user) {
            $state.go("personDetail", {
                "user": user
            });
        };

        //这是发送消息的函数
        $scope.addLocalMsg = function(msg) {
            var msgObj = {
                "to": $scope.contact.user,
                "isFromMe": true,
                "content": msg,
                "time": timeService.getFormatDate()
                    // "time": timeService.getSecondsSince1970()
            };
            // window.plugins.toast.showShortBottom('time:' + msgObj.time);
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

.controller('gmessageDetailCtrl', ['$scope', '$state', '$stateParams', '$ionicScrollDelegate', '$timeout', 'parser', 'wsService', 'loginService', 'mp3Service', 'contactService', 'sqliteService', 'groupService', 'timeService',
    function($scope, $state, $stateParams, $ionicScrollDelegate, $timeout, parser, wsService, loginService, mp3Service, contactService, sqliteService, groupService, timeService) {
        // TODO
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.group = groupService.getGroup($stateParams.gid);
            $scope.gmessageDetails = sqliteService.getGroupMessages($scope.group.gid);
            $scope.self = loginService.getUserContact();
            sqliteService.setReaded($scope.group.gid);
            //TODO
            // sqliteService.setReaded($scope.contact.user);//需改为group

            wsService.ws.onmessage = function(evt) {
                // window.plugins.toast.showShortBottom('controller!：'+evt.data);
                var msg = parser.parseMsg(evt.data);
                var msgObj = {};
                // window.plugins.toast.showShortBottom('msg:' + msg);
                if (msg.type === 0) {
                    msgObj = {
                        "from": msg.from,
                        "isFromMe": 0,
                        "content": parser.parseCotent(msg.content),
                        "time": msg.time
                    };
                    // window.plugins.toast.showShortBottom('Else msg:' + msg);
                    // 将message存入消息数据库，并更新lastMessage表
                    mp3Service.playMessage();
                    sqliteService.addNewMessageRecv(msgObj);
                } else if (msg.type === 10) {
                    msgObj = {
                        "from": msg.from,
                        "to": msg.to, //群id
                        "isFromMe": 0,
                        "content": parser.parseCotent(msg.content),
                        "icon": cordova.file.dataDirectory + msg.from + ".jpg",
                        "time": msg.time //TODO
                    };
                    if (msg.to == $scope.group.gid) {
                        $scope.gmessageDetails.push(msgObj);
                        mp3Service.playMessage();
                        $timeout(function() {
                            viewScroll.scrollBottom(true);
                            $scope.$apply(function() {});
                        }, 200);
                        //将消息存入群消息数据库，并更新lastMessage表
                        sqliteService.addNewGroupMessageRecvReaded(msgObj);
                    } else {
                        sqliteService.addNewGroupMessageRecv(msgObj);
                    }

                } else if (msg.type === 19) {
                    //收到创建group通知组成消息，按正常消息存入
                    // window.plugins.toast.showLongBottom('收到创建通知');
                    groupService.init();
                    var contentObj = eval('(' + parser.parseCotent(msg.content) + ')');
                    // window.plugins.toast.showShortBottom(JSON.stringify(contentObj));
                    var content = contentObj.holder + '创建了讨论组"' + parser.parseCotent(contentObj.name) + '"';
                    msgObj = {
                        // "from": "0",
                        "to": msg.to, //gid
                        "isFromMe": 0,
                        "name": parser.parseCotent(contentObj.name),
                        "content": content,
                        "time": msg.time //TODO
                    };
                    // window.plugins.toast.showShortBottom(content + "!!!" + msg.to);
                    //将消息存入群消息数据库，并更新lastMessage表
                    mp3Service.playMessage();
                    sqliteService.addNewGroupMessageRecv(msgObj);
                }
            };

            $timeout(function() {
                viewScroll.scrollBottom(true);
            }, 200);
        });

        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');

        $scope.onSwipeRight = function() {
            $state.go("tab.message");
        };

        $scope.groupDetail = function(gid) {
            $state.go("groupDetail", {
                "gid": gid
            });
        };

        //连接断开时重发登陆消息
        wsService.ws.onopen = function() {
            wsService.sendMessage(loginService.getLoginMsg());
        };

        //这是发送消息的函数
        $scope.addLocalMsg = function(msg) {
            // var date = new Date();
            var msgObj = {
                "to": $scope.group.gid,
                "isFromMe": true,
                "from": $scope.self.user,
                "content": msg,
                "time": timeService.getFormatDate()
                    // "time": timeService.getSecondsSince1970()
            };

            $scope.gmessageDetails.push(msgObj);

            // 发送消息的提示音
            mp3Service.playMessage();
            // 更新lastMessage表的lastMessage和lastTime
            // 将message插入联系人的allMessage表
            //TODO
            sqliteService.addNewGroupMessageSend(msgObj);

        };

        $scope.sendMessage = function(msg) {
            if (window.WebSocket) {
                var wsMsg = new WebSocket('ws://52.69.156.153:26888/');

                wsMsg.onopen = function() {
                    jsonMsg = '{"from":"' + loginService.getUser() + '","to":"' + $scope.group.gid + '","type":"10","content":"' + Base64.encode(msg) + '"}';
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

.controller('loginCtrl', ['$scope', '$location', '$state', '$timeout', 'loginService', 'parser', 'wsService', 'sqliteService', 'contactService', 'groupService',
    function($scope, $location, $state, $timeout, loginService, parser, wsService, sqliteService, contactService, groupService) {
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
                    groupService.init();
                    loginService.logined();
                    sqliteService.openDatabase();
                    // mp3Service.playLogin();
                    $timeout(function() {
                        $scope.logining = false;
                        $location.path('/tab/message');
                        $scope.$apply(function() {});
                    }, 500);


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

.controller('friendsCtrl', ['$scope', '$state', 'contactService', 'groupService', function($scope, $state, contactService, groupService) {
    $scope.$on("$ionicView.beforeEnter", function() {
        if ($scope.userGroups.length === 0) {
            $scope.showUserGroups = false;
        } else {
            $scope.showUserGroups = true;
        }
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

    $scope.groupDetail = function(gid) {
        // window.plugins.toast.showLongBottom(gid);
        $state.go("groupDetail", {
            "gid": gid
        });
    };

    $scope.groups = contactService.getGroups();
    $scope.userGroups = groupService.getUserGroups();

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

    var showUserGroup = true;


    $scope.toggleUserGroup = function() {
        showUserGroup = !showUserGroup;
    };

    $scope.isUserGroupShown = function() {
        return showUserGroup;
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

    // $scope.myGoBack = function() {
    //     $ionicHistory.goBack();
    // };
}])

.controller('groupDetailCtrl', ['$scope', '$state', '$stateParams', 'groupService', function($scope, $state, $stateParams, groupService) {
    $scope.onSwipeRight = function() {
        $state.go("tab.friends");
    };

    $scope.group = groupService.getGroup($stateParams.gid);

    $scope.gmessageDetails = function(gid) {
        //TODO 更新lastMessage表的lastTime
        $state.go("gmessageDetail", {
            "gid": gid
        });
    };

    // $scope.myGoBack = function() {
    //     $ionicHistory.goBack();
    // };
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

.controller('createGroupCtrl', ['$scope', '$state', 'contactService', 'loginService', function($scope, $state, contactService, loginService) {
    $scope.$on("$ionicView.beforeEnter", function() {
        $scope.groups = contactService.getGroups();
        $scope.groupName = "";
        // $scope.groupMembers = [];//清空会导致不相符
        $scope.$apply(function() {});
    });

    $scope.groupMembers = [];

    $scope.onSwipeRight = function() {
        $state.go("tab.friends");
    };

    $scope.createGroup = function(groupName) {
        //判断是否选择了讨论组成员，选择了则发送创建讨论组消息包
        if ($scope.groupMembers.length !== 0) {
            //TODO
            // window.plugins.toast.showShortBottom("$scope.groupMembers:" + $scope.groupMembers);
            // window.plugins.toast.showLongBottom("$scope.groupName:" + $scope.groupName);

            var holder = loginService.getUser();
            //为了防止多次添加holder的情况发生
            //先删除已存在的holder账号
            for (var i in $scope.groupMembers) {
                if ($scope.groupMembers[i] == holder) {
                    $scope.groupMembers.splice(i, 1);
                }
            }
            $scope.groupMembers.push(holder); //加上本人user
            //生成字符串
            var strGroupMembers = $scope.groupMembers.join(",");
            // window.plugins.toast.showShortBottom("strGroupMembers:" + strGroupMembers);
            //将消息包发送给服务器创建讨论组
            var wsGroup = new WebSocket('ws://52.69.156.153:60888/');

            wsGroup.onopen = function() {
                jsonMsg = '{"holder":"' + holder + '","name":"' + Base64.encode($scope.groupName) + '","member":"' + strGroupMembers + '"}';
                this.send('{"head":1110,"body":"' + Base64.encode(jsonMsg) + '","tail":"PENPEN 1.0"}');
            };
            wsGroup.onclose = function(evt) {
                $state.go("tab.message");
                $scope.$apply(function() {});
            };
            wsGroup.onmessage = function(evt) {
                // window.plugins.toast.showLongBottom('收到信息：' + evt.data + '\n' + Base64.decode(evt.data));
            };
            //等待服务器反馈，跳转至相应页面
        } else {
            window.plugins.toast.showLongBottom("未选择讨论组成员");
        }
    };

    $scope.addGroupMember = function(state, user) {
        if (state) {
            //选定则在组成员中添加该用户
            // window.plugins.toast.showShortBottom("Checked:" + user);
            $scope.groupMembers.push(user);
        } else {
            // window.plugins.toast.showShortBottom("unChecked:" + user);
            //取消选定则在组成员中删除该用户
            for (var i in $scope.groupMembers) {
                if ($scope.groupMembers[i] == user) {
                    $scope.groupMembers.splice(i, 1);
                }
            }

        }
    };
}])

.controller('settingCtrl', ['$scope', '$state', 'loginService', 'sqliteService', 'wsService', 'contactService', function($scope, $state, loginService, sqliteService, wsService, contactService) {
    $scope.$on("$ionicView.beforeEnter", function() {
        // console.log($scope.messages);
        $scope.contact = loginService.getUserContact();
        $scope.signing = $scope.contact.signing;
        $scope.$apply(function() {});
    });

    $scope.onSwipeRight = function() {
        $state.go("tab.broadcast");
    };

    // $scope.contact = loginService.getUserContact();
    $scope.logoff = function() {
        loginService.logoff();
        wsService.ws.close();
        wsService.ws = {};
        sqliteService.closeDatabase();
        $state.go("login");
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

    var picnumber = 0;

    $scope.updateIcon = function() {

        window.imagePicker.getPictures(
            function(results) {
                var win = function(r) {
                    window.plugins.toast.showLongBottom("重新登录可看到新的头像");
                    var transferSucc = function(entry) {
                        $scope.contact.icon = fileURL;
                        contactService.setIcon($scope.contact.user, $scope.contact.icon);
                        window.plugins.toast.showLongBottom(fileURL);
                        $scope.$apply(function() {});
                    };
                    var transferFail = function(error) {
                        window.plugins.toast.showShortBottom(error.code);
                    };
                    var fileTransfer = new FileTransfer();
                    var uri = encodeURI("http://52.69.156.153/upload/" + user + ".jpg");
                    // var fileURL =  "///storage/emulated/0/DCIM/penpen/test.jpg";
                    var fileURL = cordova.file.dataDirectory + "new.jpg";
                    fileTransfer.download(uri, fileURL, transferSucc, transferFail, false, {
                        headers: {
                            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                        }
                    });
                    picnumber = picnumber + 1;
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
    // $scope.contact = contactService.getContact("12345678900");
}]);