/**
 * Created by Ken on 2016/12/2.
 */
(function () {
    angular.module('myApp', ['ionic',
            //控制器
            'news', 'newsDetail', 'weather', 'setting',
            //服务
            'newsDetailSer', "citySer"])
        .config([
            "$stateProvider", "$urlRouterProvider", "$httpProvider", "$ionicConfigProvider",
            function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {
                //---配置导航始终贴底部
                $ionicConfigProvider.platform.ios.tabs.style('standard');
                $ionicConfigProvider.platform.ios.tabs.position('bottom');
                $ionicConfigProvider.platform.android.tabs.style('standard');
                $ionicConfigProvider.platform.android.tabs.position('standard');

                $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
                $ionicConfigProvider.platform.android.navBar.alignTitle('left');

                $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
                $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

                $ionicConfigProvider.platform.ios.views.transition('ios');
                $ionicConfigProvider.platform.android.views.transition('android');
                //---配置路由
                $urlRouterProvider.otherwise("/default");
                //---新闻和子页-----------------------------------------------------------------------------------
                $stateProvider.state('tab1', {
                    url: '/tab1',   //给sref跳转
                    //cache: false,
                    views: {
                        view1: {
                            controller: "newsCtrl",
                            templateUrl: "pages/news/news.html"  //加载html
                        }
                    }
                }).state('newsDetail', {
                    url: '/newsDetail/:id',
                    views: {
                        view1: {
                            controller: "newsDetailCtrl",
                            templateUrl: "pages/news/newsDetail.html"
                        }
                    }
                    //---天气-----------------------------------------------------------------------------------
                }).state('tab2', {
                    url: '/tab2',
                    //cache: false,
                    views: {
                        view2: {
                            controller: "weatherCtrl",
                            templateUrl: "pages/weather/weather.html"
                        }
                    }
                    //---设置-----------------------------------------------------------------------------------
                }).state('tab3', {
                    url: '/tab3',
                    views: {
                        view3: {
                            controller: "settingCtrl",
                            templateUrl: "pages/setting/setting.html"
                        }
                    }
                });
                // http 请求表单编码成一条
                $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
                $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            }])
        /*-------------------------------------- 总控制器 ------------------------------------------------*/
        .controller('indexCon', [function () {

        }])
        // 本地调试
        .constant('local', false)
        // HTML版本，用于强制刷新HTML页面
        .constant('version', '1.0.0')
        /*-------------------------------------- 自定义服务 ------------------------------------------------*/
        .service('Storage', [function () {
            this.set = function (name, value) {
                localStorage.setItem( name, value);
            };
            this.get = function (name) {
                return localStorage.getItem( name );
            };
            this.remove = function (name) {
                localStorage.removeItem( name );
            };
        }])
})();