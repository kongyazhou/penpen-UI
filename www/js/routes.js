angular.module('wechat.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state("tab", {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html",
        })
        .state('tab.message', {
            url: '/message',
            views: {
                'tab-message': {
                    templateUrl: 'templates/tab-message.html',
                    controller: "messageCtrl"
                }
            }
        })
        .state('about', {
            url: '/about',
            templateUrl: 'templates/about.html',
            controller: "aboutCtrl"
        })
        .state('messageDetail', {
            url: '/messageDetail/:messageId',
            templateUrl: "templates/message-detail.html",
            controller: "messageDetailCtrl"
        })
        .state('personDetail', {
            //url: '/personDetail/:personId',
            url: '/personDetail',
            templateUrl: "templates/person-detail.html",
            controller: "personDetailCtrl"
        })
        .state('tab.friends', {
            url: '/friends',
            views: {
                'tab-friends': {
                    templateUrl: 'templates/tab-friends.html',
                    controller: "friendsCtrl"
                }
            }
        })
        .state('tab.broadcast', {
            url: '/broadcast',
            views: {
                'tab-broadcast': {
                    templateUrl: 'templates/tab-broadcast.html',
                    controller: "broadcastCtrl"
                }
            },
        })
        .state('tab.setting', {
            url: '/setting',
            views: {
                'tab-setting': {
                    templateUrl: 'templates/tab-setting.html',
                    controller: "settingCtrl"
                }
            }
        });

    $urlRouterProvider.otherwise("/tab/message");
});