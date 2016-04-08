angular.module('penpen.services', [])

.service('wsService', ['loginService', function(loginService) {
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
        // window.plugins.toast.showLongBottom('收到：' + message.data);
    };

    this.sendMessage = function(msg) {
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
    this.logoff = function() {
        user = "";
        password = "";
        login = false;
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

.service('sqliteService', ['loginService', 'contactService', function(loginService, contactService) {
    var dbName = "";
    // var dbName = 'penpen.12345678905';
    var stmt = "";
    var dbPenpen = {};
    this.openDatabase = function() {
        dbName = 'penpen.' + loginService.getUser();
        dbPenpen = window.sqlitePlugin.openDatabase({
            name: dbName,
            iosDatabaseLocation: 'default'
        }, function(db) {
            // window.plugins.toast.showLongBottom('打开数据库成功' + dbName);
        }, function(err) {
            // window.plugins.toast.showLongBottom('打开数据库失败' + err);
        });
    };
    this.closeDatabase = function() {
        dbPenpen.close(function() {
            // window.plugins.toast.showLongBottom('database is closed ok');
        }, function(error) {
            // window.plugins.toast.showLongBottom('ERROR closing database');
        });
    };

    this.addNewMessageSend = function(msg) {
        // window.plugins.toast.showShortBottom(msg.content);

        var contact = contactService.getContact(msg.to);
        dbPenpen.transaction(function(tx) {
            //更新lastMessage
            //判断表是否存在，不存在则创建
            tx.executeSql('CREATE TABLE IF NOT EXISTS lastMessage (id integer primary key, user text, name text, icon text, lastMessage text, lastTime text, unreadNo integer);', [], function(argument) {
                // window.plugins.toast.showLongBottom('创建表成功');
            }, function(err) {
                // window.plugins.toast.showLongBottom('创建表失败' + err.message);
            });
            //判断条目是否存在
            tx.executeSql('select count(*) as cnt from lastMessage where user=?;', [msg.to], function(tx, res) {
                // 如果没有则创建,有则更新
                if (res.rows.item(0).cnt !== 0) {
                    //存在则更新
                    // window.plugins.toast.showLongBottom('条目存在');
                    tx.executeSql("UPDATE lastMessage SET lastMessage=?,lastTime=?  WHERE user=?;", [msg.content, msg.time, msg.to]);
                } else {
                    //不存在则创建条目
                    // window.plugins.toast.showLongBottom('条目不存在');
                    tx.executeSql("INSERT INTO lastMessage( user, name, icon, lastMessage, lastTime, unreadNo) VALUES (?,?,?,?,?,?);", [msg.to, contact.name, contact.icon, msg.content, msg.time, 0]);
                }
            });

            //添加到账号记录中
            //若不存在则创建表
            stmt = 'CREATE TABLE IF NOT EXISTS penpen' + msg.to + ' (id integer primary key,isFromMe integer, content text, time text, unread integer);';
            tx.executeSql(stmt, [], function(argument) {
                // window.plugins.toast.showLongBottom('创建表成功');
            }, function(err) {
                // window.plugins.toast.showLongBottom('创建表失败' + err.message);
            });
            //添加新消息条目
            stmt = 'INSERT INTO penpen' + msg.to + ' (isFromMe, content, time, unread) VALUES (?,?,?,?);';
            tx.executeSql(stmt, [1, msg.content, msg.time, 0], function(tx, res) {
                // window.plugins.toast.showLongBottom('添加新消息成功');
            }, function(err) {
                // window.plugins.toast.showLongBottom('添加新消息失败' + err.message);
            });

        });
    };

    this.addNewMessageRecv = function(msg) {
        var contact = contactService.getContact(msg.from);
        dbPenpen.transaction(function(tx) {
            //判断表是否存在，不存在则创建
            tx.executeSql('CREATE TABLE IF NOT EXISTS lastMessage (id integer primary key, user text, name text, icon text, lastMessage text, lastTime text, unreadNo integer);');
            //判断条目是否存在
            tx.executeSql('select count(*) as cnt from lastMessage where user=?;', [msg.from], function(tx, res) {
                // 如果没有则创建,有则更新
                if (res.rows.item(0).cnt !== 0) {
                    //存在则更新最后消息，并使未读消息数目+1
                    tx.executeSql('select unreadNo from lastMessage where user=?;', [msg.from], function(tx, res) {
                        tx.executeSql("UPDATE lastMessage SET lastMessage=?,lastTime=?,unreadNo=?  WHERE user=?;", [msg.content, msg.time, res.rows.item(0).unreadNo + 1, msg.from]);
                    });
                } else {
                    //不存在则创建条目
                    tx.executeSql("INSERT INTO lastMessage( user, name, icon, lastMessage, lastTime, unreadNo) VALUES (?,?,?,?,?,?);", [msg.from, contact.name, contact.icon, msg.content, msg.time, 1]);
                }
            });
            //判断表是否存在，不存在则创建
            stmt = 'CREATE TABLE IF NOT EXISTS penpen' + msg.from + ' (id integer primary key,isFromMe integer, content text, time text, unread integer);';
            tx.executeSql(stmt, []);
            //添加新消息条目
            stmt = 'INSERT INTO penpen' + msg.from + ' (isFromMe, content, time, unread) VALUES (?,?,?,?);';
            tx.executeSql(stmt, [0, msg.content, msg.time, 1]);

        });
    };

    //收到读过消息
    this.addNewMessageRecvReaded = function(msg) {
        var contact = contactService.getContact(msg.from);
        dbPenpen.transaction(function(tx) {
            //判断表是否存在，不存在则创建
            tx.executeSql('CREATE TABLE IF NOT EXISTS lastMessage (id integer primary key, user text, name text, icon text, lastMessage text, lastTime text, unreadNo integer);');
            //判断条目是否存在
            tx.executeSql('select count(*) as cnt from lastMessage where user=?;', [msg.from], function(tx, res) {
                // 如果没有则创建,有则更新
                if (res.rows.item(0).cnt !== 0) {
                    //存在则更新
                    tx.executeSql("UPDATE lastMessage SET lastMessage=?,lastTime=?,unreadNo=?  WHERE user=?;", [msg.content, msg.time, 0, msg.from]);
                } else {
                    //不存在则创建条目
                    tx.executeSql("INSERT INTO lastMessage( user, name, icon, lastMessage, lastTime, unreadNo) VALUES (?,?,?,?,?,?);", [msg.from, contact.name, contact.icon, msg.content, msg.time, 0]);
                }
            });
            //判断表是否存在，不存在则创建
            stmt = 'CREATE TABLE IF NOT EXISTS penpen' + msg.from + ' (id integer primary key,isFromMe integer, content text, time text, unread integer);';
            tx.executeSql(stmt, []);
            //添加新消息条目
            stmt = 'INSERT INTO penpen' + msg.from + ' (isFromMe, content, time, unread) VALUES (?,?,?,?);';
            tx.executeSql(stmt, [0, msg.content, msg.time, 0]);
        });
    };

    this.getContactMessages = function(user) {
        // var contact = contactService.getContact(user);
        var messages = [];
        var count = 0;
        dbPenpen.transaction(function(tx) {
            stmt = 'select count(content) as cnt from penpen' + user + ';';
            tx.executeSql(stmt, [], function(tx, res) {
                count = res.rows.item(0).cnt;
                // window.plugins.toast.showShortBottom('Count:' + count);
            }, function(err) {
                // window.plugins.toast.showShortBottom('Count失败');
            });
            stmt = 'select * from penpen' + user + ';';
            tx.executeSql(stmt, [], function(tx, res) {
                var i = 0;
                for (i = 0; i < count; i++) {
                    // window.plugins.toast.showShortBottom(res.rows.item(i).user);
                    var obj = {
                        "isFromMe": res.rows.item(i).isFromMe,
                        "content": res.rows.item(i).content,
                        "time": res.rows.item(i).time
                    };
                    messages.push(obj);
                }
            });
        });
        return messages;
    };

    this.setReaded = function(user) {
        // var contact = contactService.getContact(user);
        var messages = [];
        var count = 0;
        dbPenpen.transaction(function(tx) {
            stmt = 'UPDATE lastMessage SET unreadNo=0  WHERE user=' + user + ';';
            tx.executeSql(stmt, [], function(tx, res) {
                // window.plugins.toast.showShortBottom('Count:' + count);
            }, function(err) {
                // window.plugins.toast.showShortBottom('setReaded失败');
            });
        });
    };


    this.getLastMessages = function() {
        var messages = [];
        var count = 0;
        // var length = 0;
        dbPenpen.transaction(function(tx) {
            tx.executeSql("select count(user) as cnt from lastMessage;", [], function(tx, res) {
                count = res.rows.item(0).cnt;
                // length = res.rows.item.length;
                // window.plugins.toast.showShortBottom('Count:' + count);
                // window.plugins.toast.showLongBottom('Length:' + length);
            }, function(err) {
                // window.plugins.toast.showShortBottom('Count失败');
            });

            tx.executeSql('select * from lastMessage;', [], function(tx, res) {
                // window.plugins.toast.showShortBottom('读取lastMessage成功');
                // window.plugins.toast.showLongBottom(res.rows.item(0).user);

                var i = 0;
                for (i = 0; i < count; i++) {
                    // window.plugins.toast.showShortBottom(res.rows.item(i).user);
                    var obj = {
                        "user": res.rows.item(i).user,
                        "name": res.rows.item(i).name,
                        "icon": res.rows.item(i).icon,
                        "lastMessage": res.rows.item(i).lastMessage,
                        "lastTime": res.rows.item(i).lastTime,
                        "unreadNo": res.rows.item(i).unreadNo

                    };
                    messages.push(obj);
                }

            }, function(err) {
                // window.plugins.toast.showLongBottom('读取lastMessage失败' + err.message);
            });
        });
        return messages;
    };
}]);