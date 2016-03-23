angular.module('penpen.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: "loginCtrl"
        })
        .state('about', {
            url: '/about',
            templateUrl: 'templates/about.html',
            controller: "aboutCtrl"
        })
        .state('messageDetail', {
            url: '/messageDetail/:messageId',
            templateUrl: "templates/detail-message.html",
            controller: "messageDetailCtrl"
        })
        .state('personDetail', {
            //url: '/personDetail/:personId',
            url: '/personDetail',
            templateUrl: "templates/detail-person.html",
            controller: "personDetailCtrl"
        })
        .state('userDetail', {
            //url: '/userDetail/:userId',
            url: '/userDetail',
            templateUrl: "templates/detail-user.html",
            controller: "userDetailCtrl"
        })
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

    //set the defalt page
    //$urlRouterProvider.otherwise("/tab/message");
    $urlRouterProvider.otherwise("/login");
});