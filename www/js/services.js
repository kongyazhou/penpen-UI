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
                    if (!messageDate) {
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

.factory('messageService', ['localStorageService', 'dateService', function(localStorageService, dateService) {
    return {
        //TODO
        message: {},
        messageNum: 0,
        messageDetails: [],

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
                    if (!messageDate) {
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
                    if (message) {
                        messages.push(message);
                    }
                }
                dateService.handleMessageDate(messages);
                return messages;
            }
            return null;

        },
        getMessageById: function(id) {
            return localStorageService.get("message_" + id);
        },
        getAmountMessageById: function(num, id) {
            var messages = [];
            var message = localStorageService.get("message_" + id).message;
            var length = 0;
            if (num < 0 || !message) return;
            length = message.length;
            if (num < length) {
                messages = message.splice(length - num, length);
                return messages;
            } else {
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
        deleteMessageId: function(id) {
            var messageId = localStorageService.get("messageID");
            var length = 0;
            var i = 0;
            if (!messageId) {
                return null;
            }
            length = messageId.length;
            for (; i < length; i++) {
                if (messageId[i].id === id) {
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
            var date = new Date();
            var obj = {
                "isFromMe": true,
                "content": msg,
                "time": date
            };
            this.messageDetails.push(obj);
            return obj;
        }
    };
}])

.service('wsService', ['loginService', function(loginService) {
    var callbacks = {};
    var currentCallbackId = 0;
    //初始化ws对象
    this.ws = {};

    this.ws.onopen = function() {
        //各controller自己复写该方法以实现功能
    };

    this.ws.onclose = function() {
        //各controller自己复写该方法以实现功能
    };

    this.ws.onmessage = function(message) {
        //各controller自己复写该方法以实现功能
        window.plugins.toast.showLongBottom('收到：' + message.data);
    };

    this.sendMessage = function(msg) {
        //各controller自己复写该方法以实现功能
        this.ws.send('{"head":1110,"body":"' + Base64.encode(msg) + '","tail":"PENPEN 1.0"}');
        //ws.send(msg);
    };
}])

.service('loginService', ['contactService', function(contactService) {
    var user = "";
    var password = "";
    var login = false;

    this.setUser = function(arg) {
        user = arg;
    };
    this.getUser = function() {
        //可以考虑添加个上次登陆时间
        if (login) {
            return user;
        } else {
            return '0';
        }
    };
    this.getUserContact = function() {
        return contactService.getContact(user);
        // return contactService.getContact("12345678905");

    };
    this.setPassword = function(arg) {
        password = hex_md5(arg);
    };
    this.getLoginMsg = function(arg) {
        var msg = '{"user":"' + user + '","password":"' + password + '"}';
        return msg;
    };
    this.logined = function() {
        login = true;
        ws = new WebSocket('ws://223.202.124.144:33888/');
        ws.onopen = function() {
            user = loginService.getUser();
            msg = '{"user":"' + user + '","state":1}';
            this.send('{"head":1110,"body":"' + Base64.encode(msg) + '","tail":"PENPEN 1.0"}');
        };
    };
    this.isLogged = function() {
        return login;
    };
}])

.service('parser', [function() {
    /*
    本服务将消息包body部分解码
    并转换成对象返回
    */
    //TODO* 判断编码方式，检查协议版本
    this.parseMsg = function(msg) {
        var msgObj = eval('(' + msg + ')');
        var msgBodyUncoded = eval('(' + Base64.decode(msgObj.body) + ')');
        return msgBodyUncoded;
    };
    this.parseCotent = function(content) {
        return Base64.decode(content);
    };
}])

.service('activeState', ['loginService', function(loginService) {
    /*
    本服务将消息包body部分解码
    并转换成对象返回
    */
    //TODO* 判断编码方式，检查协议版本

    document.addEventListener('resume', function() {
        ws = new WebSocket('ws://223.202.124.144:33888/');

        ws.onopen = function() {
            user = loginService.getUser();
            msg = '{"user":"' + user + '","state":1}';
            this.send('{"head":1110,"body":"' + Base64.encode(msg) + '","tail":"PENPEN 1.0"}');
        };

        ws.onclose = function() {};

        ws.onmessage = function(message) {};
    });
    document.addEventListener('pause', function() {
        ws = new WebSocket('ws://223.202.124.144:33888/');

        ws.onopen = function() {
            user = loginService.getUser();
            msg = '{"user":"' + user + '","state":2}';
            this.send('{"head":1110,"body":"' + Base64.encode(msg) + '","tail":"PENPEN 1.0"}');
        };

        ws.onclose = function() {};

        ws.onmessage = function(message) {};
    });
}])

.service('mp3Service', [function() {
    var mp3Message = new Media("/android_asset/www/mp3/message.mp3", function() {
            // window.plugins.toast.showShortBottom('打开音乐成功');
        },
        function(err) {
            // window.plugins.toast.showShortBottom('打开音乐失败');
        });
    this.playMessage = function() {
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

.service('contactService', [function() {
    var groups = [{
        "show": true,
        "department": "总经理",
        "contacts": [{
            "user": "12345678900",
            "name": "郑总",
            "icon": "img/0.jpg",
            "job": "总经理"
        }]
    }, {
        "show": true,
        "department": "技术部",
        "contacts": [{
            "user": "12345678901",
            "name": "李明",
            "icon": "img/1.jpg",
            "job": "部长"
        }, {
            "user": "12345678902",
            "name": "刘翔",
            "icon": "img/2.jpg",
            "job": "软件工程师"
        }, {
            "user": "12345678903",
            "name": "张涛",
            "icon": "img/3.jpg",
            "job": "硬件工程师"
        }, {
            "user": "12345678904",
            "name": "顾城",
            "icon": "img/4.jpg",
            "job": "机械工程师"
        }]
    }, {
        "show": true,
        "department": "市场部",
        "contacts": [{
            "user": "12345678905",
            "name": "朱薇",
            "icon": "img/5.jpg",
            "job": "部长"
        }, {
            "user": "12345678906",
            "name": "郭思琪",
            "icon": "img/6.jpg",
            "job": "销售经理"
        }, {
            "user": "12345678907",
            "name": "沈紫",
            "icon": "img/7.jpg",
            "job": "销售经理"
        }]
    }, {
        "show": true,
        "department": "财务部",
        "contacts": [{
            "user": "12345678908",
            "name": "汪美琴",
            "icon": "img/8.jpg",
            "job": "部长"
        }, {
            "user": "12345678909",
            "name": "刘斌",
            "icon": "img/9.jpg",
            "job": "副部长"
        }]
    }];
    var contacts = [{
        "user": "12345678900",
        "name": "郑总",
        "icon": "img/0.jpg",
        "job": "总经理"
    }, {
        "user": "12345678901",
        "name": "李明",
        "icon": "img/1.jpg",
        "job": "部长"
    }, {
        "user": "12345678902",
        "name": "刘翔",
        "icon": "img/2.jpg",
        "job": "软件工程师"
    }, {
        "user": "12345678903",
        "name": "张涛",
        "icon": "img/3.jpg",
        "job": "硬件工程师"
    }, {
        "user": "12345678904",
        "name": "顾城",
        "icon": "img/4.jpg",
        "job": "机械工程师"
    }, {
        "user": "12345678905",
        "name": "朱薇",
        "icon": "img/5.jpg",
        "job": "部长"
    }, {
        "user": "12345678906",
        "name": "郭思琪",
        "icon": "img/6.jpg",
        "job": "销售经理"
    }, {
        "user": "12345678907",
        "name": "沈紫",
        "icon": "img/7.jpg",
        "job": "销售经理"
    }, {
        "user": "12345678908",
        "name": "汪美琴",
        "icon": "img/8.jpg",
        "job": "部长"
    }, {
        "user": "12345678909",
        "name": "刘斌",
        "icon": "img/9.jpg",
        "job": "副部长"
    }];
    this.getGroups = function() {
        return groups;
    };
    this.getContact = function(user) {
        //TODO ?
        var i = 0;
        for (i in contacts) {
            if (contacts[i].user == user) {
                return contacts[i];
            }
        }
    };
}])

.service('sqliteService', ['loginService', function(loginService) {
    var dbName = 'penpen.' + loginService.getUser();
    var dbPenpen = window.sqlitePlugin.openDatabase({
        name: dbName,
        iosDatabaseLocation: 'default'
    }, function(db) {
        window.plugins.toast.showLongBottom('打开数据库成功' + dbName);
    }, function(err) {
        window.plugins.toast.showLongBottom('打开数据库失败' + err);
    });

    this.updateLastMessageSend = function(msg) {
        // window.plugins.toast.showShortBottom(msg.content);
        dbPenpen.transaction(function(tx) {
            //判断表是否存在，不存在则创建
            tx.executeSql('CREATE TABLE IF NOT EXISTS lastMessage (id integer primary key, user text, lastMessage text, lastTime text, unreadNo integer);', [], function(argument) {
                // window.plugins.toast.showLongBottom('创建表成功');
            }, function(err) {
                // window.plugins.toast.showLongBottom('创建表失败' + err.message);
            });
            //判断条目是否存在
            tx.executeSql('select count(*) as cnt from lastMessage where user=?;', [msg.to], function(tx, res) {
                // 如果没有则创建,有则更新
                if (res.rows.item(0).cnt != 0) {
                    //存在则更新
                    // window.plugins.toast.showLongBottom('条目存在');
                    tx.executeSql("UPDATE lastMessage SET lastMessage=?,lastTime=?,unreadNo=?  WHERE user=?;", [msg.content, msg.time, 0, msg.to]);
                } else {
                    //不存在则创建条目
                    // window.plugins.toast.showLongBottom('条目不存在');
                    tx.executeSql("INSERT INTO lastMessage( user, lastMessage, lastTime, unreadNo) VALUES (?,?,?,?);", [msg.to, msg.content, msg.time, 0]);
                }
            });
            //
            tx.executeSql('CREATE TABLE IF NOT EXISTS penpen12345678901 (id integer primary key,isFromMe integer, message text, time text, unread integer);', [], function(argument) {
                window.plugins.toast.showLongBottom('创建表成功');
            }, function(err) {
                window.plugins.toast.showLongBottom('创建表失败' + err.message);
            });
            //添加新消息条目
            tx.executeSql('INSERT INTO penpen12345678901 (isFromMe, message, time, unread) VALUES (?,?,?,?);', [ 1, msg.content, msg.time, 0], function(tx, res) {
                window.plugins.toast.showLongBottom('添加新消息成功');
            }, function(err) {
                window.plugins.toast.showLongBottom('添加新消息失败' + err.message);
            });

        });
    };

/*    this.addNewMessageSend = function(msg) {
        dbPenpen.transaction(function(tx) {
            var tbName = 'penpen' + msg.to;
            //判断表是否存在，不存在则创建
            tx.executeSql('CREATE TABLE IF NOT EXISTS ? (id integer primary key,isFromMe integer, message text, time text, unread integer);', [tbName], function(tx, res) {
                window.plugins.toast.showLongBottom('创建表成功');
            }, function(err) {
                window.plugins.toast.showLongBottom('创建表失败' + err.message);
            });
            //添加新消息条目
            tx.executeSql('INSERT INTO ? (isFromMe, message, time, unread) VALUES (?,?,?,?);', ['penpen' + msg.to, 1, msg.content, msg.time, 0], function(tx, res) {
                window.plugins.toast.showLongBottom('添加新消息成功');
            }, function(err) {
                window.plugins.toast.showLongBottom('添加新消息失败' + err.message);
            });
        });
    };*/

    this.updateLastMessageRecv = function(msg) {
        dbPenpen.transaction(function(tx) {
            //判断表是否存在，不存在则创建
            tx.executeSql('CREATE TABLE IF NOT EXISTS lastMessage (id integer primary key, user text, lastMessage text, lastTime text, unreadNo integer);');
            //判断条目是否存在
            tx.executeSql('select count(*) as cnt from lastMessage where user=?;', [msg.from], function(tx, res) {
                // 如果没有则创建,有则更新
                if (res.rows.item(0).cnt != 0) {
                    //存在则更新最后消息，并使未读消息数目+1
                    tx.executeSql('select unreadNo from lastMessage where user=?;', [msg.from], function(tx, res) {
                        tx.executeSql("UPDATE lastMessage SET lastMessage=?,lastTime=?,unreadNo=?  WHERE user=?;", [msg.content, msg.time, res.rows.item(0).unreadNo + 1, msg.from]);
                    });
                } else {
                    //不存在则创建条目
                    tx.executeSql("INSERT INTO lastMessage( user, lastMessage, lastTime, unreadNo) VALUES (?,?,?,?);", [msg.from, msg.content, msg.time, 1]);
                }
            });
        });
    };

    this.addNewMessageRecv = function(msg) {
        dbPenpen.transaction(function(tx) {
            //判断表是否存在，不存在则创建
            tx.executeSql('CREATE TABLE IF NOT EXISTS ? (id integer primary key,isFromMe integer, message text, time text, unread integer);', ['penpen' + msg.from]);
            //添加新消息条目
            tx.executeSql('INSERT INTO ? (isFromMe, message, time, unread) values (?,?,?,?);', ['penpen' + msg.from, 0, msg.content, msg.time, 1]);
        });
    };

    //收到并读过消息
    this.updateLastMessageRecvReaded = function(msg) {
        //判断表是否存在，不存在则创建
        tx.executeSql('CREATE TABLE IF NOT EXISTS lastMessage (id integer primary key, user text, lastMessage text, lastTime text, unreadNo integer);');
        //判断条目是否存在
        tx.executeSql('select count(*) as cnt from lastMessage where user=?;', [msg.from], function(tx, res) {
            // 如果没有则创建,有则更新
            if (res.rows.item(0).cnt != 0) {
                //存在则更新
                tx.executeSql("UPDATE lastMessage SET lastMessage=?,lastTime=?,unreadNo=?  WHERE user=?;", [msg.content, msg.time, 0, msg.from]);
            } else {
                //不存在则创建条目
                tx.executeSql('select unreadNo from lastMessage where user=?;', [msg.from], function(tx, res) {
                    tx.executeSql("INSERT INTO lastMessage( user, lastMessage, lastTime, unreadNo) VALUES (?,?,?,?);", [msg.from, msg.content, msg.time, 0]);
                });
            }
        });
    };

    this.addNewMessageRecvReaded = function(msg) {
        dbPenpen.transaction(function(tx) {
            //判断表是否存在，不存在则创建
            tx.executeSql('CREATE TABLE IF NOT EXISTS ? (id integer primary key,isFromMe integer, message text, time text, unread integer);', ['penpen' + msg.from]);
            //添加新消息条目
            tx.executeSql('INSERT INTO ? (isFromMe, message, time, unread) values (?,?,?,?);', ['penpen' + msg.from, 0, msg.content, msg.time, 0]);
        });
    };

    this.getContactMessages = function(argument) {
        // body...
    };

    this.getLastMessages = function(argument) {
        // body...
    };
}])