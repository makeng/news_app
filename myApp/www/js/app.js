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
/**
 * Created by Ken on 2016/12/2.
 */
(function () {
    angular.module('news', [])
        .controller('newsCtrl', [
        "$rootScope", "$scope", "$http", "$timeout", "NewsCh", "NewsDetail",
        function ($rootScope, $scope, $http, $timeout, NewsCh, NewsDetail) {
            //---构建新闻对象
            var NewsObj = function () {
                //---页码
                this.page = 1;
                this.data = [];
                var _this = this;
                //---获取新闻，需要当前时间
                this.getData = function (channelName, fn) {
                    var url = "http://route.showapi.com/109-35";
                    var apiSign = "55f74716416141b1ac2d81797a321538";
                    //
                    $http.get(url, {
                        params: {
                            //系统参数
                            showapi_appid: "28034",
                            showapi_sign: apiSign,
                            //应用参数
                            needAllList: 0,    //不需要最全资料
                            needHtml: 1, //需要html
                            maxResult: 20, //每次20条
                            channelName: channelName,
                            page: _this.page
                        }
                    }).success(function (res) {
                        console.log( res );
                        var news = res.showapi_res_body.pagebean.contentlist;
                        (_this.data == []) ? (_this.data = news) : (_this.data = _this.data.concat(news));
                        fn && fn(_this.data);
                        NewsDetail.setData(_this.data);
                    });
                };
                this.clearData = function () {
                    this.data = [];
                };
            };
            //---构建新闻栏目对象
            var newsChObj = function () {
                this.data = [];
                this.cnt = 0;
                var _this = this;
                //获取数据
                this.getData = function (fn) {
                    var tempChs = NewsCh.get();
                    _this.data = [];
                    _this.cnt = 0;
                    angular.forEach(tempChs, function (item, index) {    //勾选的才加入
                        if (item.chk == true) {
                            _this.data.push(item);
                            _this.cnt++;
                        }
                    });
                    fn && fn(_this.cnt, _this.data);
                }
            };
            //---执行---------------------------------------------------------------------------------------------------
            var news = new NewsObj();
            var ch = new newsChObj();
            $scope.hideMoreNews = true;
            $scope.selected = [true, false, false, false, false];
            //
            function loadNewsCh() {
                ch.getData(function (cnt, data) {
                    $scope.channel = data[0]; //顶部标题
                    $scope.newsChannelArrFront4 = data.slice(0, 4);   //前四栏目
                    $scope.newsChannelArrAfter4 = data.slice(4);  //后面栏目
                    ( cnt >= 5 ) ? $scope.isMoreCh = true : $scope.isMoreCh = false;
                });
            }

            loadNewsCh();
            //---数据通知
            NewsCh.receiveUpdateBroadcast(function () {
                loadNewsCh();
            });
            //---下拉刷新数据
            $scope.newsRefreshData = function () {
                news.page = 1;   //回到第一页
                news.clearData();  //清空新闻存储
                news.getData($scope.channel.name, function (data) {
                    $scope.newsList = data;
                });
                $scope.$broadcast("scroll.refreshComplete"); // 通知框架数据已加载完毕
            };
            //---上拉滚动加载，500ms显示菊花图
            $scope.newsGetData = function () {
                $timeout(function () {
                    news.getData($scope.channel.name, function (data) {
                        $scope.newsList = data;
                    });
                    news.page++;
                    $scope.$broadcast("scroll.infiniteScrollComplete"); // 通知框架数据已加载完毕
                }, 500);
            };
            //---点击新闻栏目，切换颜色
            $scope.selTab = function (idx) {
                $scope.channel = ch.data[idx]; //更换标题
                news.clearData();  //清空新闻存储
                $scope.newsList = [];   //清空列表
                news.getData($scope.channel.name, function (data) {
                    $scope.newsList = data;
                });
                $scope.$broadcast("scroll.infiniteScrollComplete"); // 通知框架数据已加载完毕
                $scope.selected = [];
                $scope.selected[idx] = true;
                if (idx < 4) {
                    $scope.hideMoreNews = true;    //点击前几个栏目要把“更多”隐藏
                }
            };
            $scope.showMoreNewsTitle = function () {
                $scope.hideMoreNews = !$scope.hideMoreNews;
            };
        }]);
})();

(function () {
    angular.module('newsDetail', [])
        .controller('newsDetailCtrl', [
            "$scope", "$stateParams", "NewsDetail",
            function ($scope, $stateParams, NewsDetail) {
                $scope.txt = NewsDetail.getData()[$stateParams.id];
            }]);
})();
/**
 * Created by kolly on 2016/5/11.
 */
//新闻栏目顺序
(function () {
    angular.module('newsDetailSer', [])
        .service('NewsDetail', [
            function () {
                this.data = [];
                this.getData = function(){
                    return this.data;
                };
                this.setData = function( val ){
                    this.data = val;
                };
            }])
        .service('NewsCh', ["$rootScope", "Storage",
            function ($rootScope, Storage) {
                this.data = [];
                var _data = this.data;
                var _this = this;
                this.isSet = false;
                this.cnt = 0;
                this.set = function ( obj ) {    //Storage取出
                    _data = obj;
                    Storage.set('NewsCh', JSON.stringify(_data));
                };
                //广播：数据已经改变
                this.updateBroadcast = function () {
                    _this.isSet = true;
                    $rootScope.$broadcast('to-news', _this.isSet);
                };
                //接受广播
                this.receiveUpdateBroadcast = function(fn){
                    _this.isSet = false;
                    $rootScope.$on('to-news', function(event, data ){   //栏目改变，重新加载
                        fn && fn();
                    });
                };
                //从Storage取出
                this.get = function () {
                    _data = Storage.get('NewsCh');
                    _data = JSON.parse(_data);
                    if (_data == [] || _data == undefined) { //default
                        _data = [
                            {name: "国内最新", chk: true, num:1 },
                            {name: "国际最新", chk: true, num:2 },
                            {name: "国内焦点", chk: true, num:3 },
                            {name: "国际焦点", chk: true, num:4 },
                            {name: "社会最新", chk: true, num:5 },
                            {name: "社会焦点", chk: true, num:6 },
                            {name: "军事最新", chk: true, num:7 },
                            {name: "军事焦点", chk: true, num:8 },
                            {name: "互联网最新", chk: false, num:9 },
                            {name: "体育最新", chk: false, num: 10},
                            {name: "体育焦点", chk: false, num: 11},
                            {name: "娱乐最新", chk: false, num: 12},
                            {name: "娱乐焦点", chk: false, num: 13},
                            {name: "科技最新", chk: false, num: 14},
                            {name: "科技焦点", chk: false, num: 15}
                        ];
                    }
                    return _data;
                };
            }]);
})();
/**
 * Created by Ken on 2015/12/2.
 */
(function () {
    angular.module('setting', []
    ).controller('settingCtrl', [
        "$scope", "$http", "$timeout", "$ionicScrollDelegate", "City", "NewsCh",           //顺序不可乱
        function ($scope, $http, $timeout, $ionicScrollDelegate, City, NewsCh ) {
            //---创建对象-----------------------------------------------------------------------------------
            //新闻栏目
            var NewsChObj = function(){
                this.data = [];
                this.cnt = 0;
                this.unCheckedData = [];
                this.checkedData = [];
                var _this = this;
                //获得所有数据
                this.getData = function(){
                    this.data = NewsCh.get();
                };
                //获得未勾选的列表
                this.getUn_checkedData = function(){
                    this.cnt = 0;
                    var newArr = [];
                    var newArr1 = [];
                    angular.forEach( newsCh.data, function(item, index){
                        if( !item.chk ){    //没有勾上的
                            newArr.push( item  );
                        }else{              //勾上了的
                            newArr1.push( item );
                        }
                    });
                    this.unCheckedData = newArr;
                    this.checkedData = newArr1;
                };
            };
            //城市列表操作对象
            var CityChObj = function(){
                this.data = [];
                this.allList = [];  //省市列表
                var _this = this;
                //
                this.getData = function(){
                    this.data = City.get();
                };
                this.getAllList = function( fn ){
                    var url = 'json/city.json';
                    $http.get(url).success(function (res) {
                        _this.allList = res; 
                        fn && fn( res );
                    });
                };
            };
            //---操作-----------------------------------------------------------------------------------
            //---新闻
            var newsCh = new NewsChObj();
            newsCh.getData();
            newsCh.getUn_checkedData();
            console.log( newsCh.data );
            console.log( newsCh.unCheckedData );
            console.log( newsCh.checkedData );
            $scope.NewsCh = newsCh.checkedData;
            //
            $scope.NewsChDel = function (idx) {  //点击方块删除对象
                newsCh.checkedData[idx].chk = false;
                var temp = newsCh.checkedData.splice( idx, 1 );  //取出
                newsCh.unCheckedData.push( temp[0] );
                NewsCh.set( newsCh.checkedData.concat( newsCh.unCheckedData ) );
                NewsCh.updateBroadcast();      //通知其他控制器
            };
            $scope.NewsChAdd = function(){
                $scope.showSelList = true;
                $scope.aniSelList = false;
                state_selList = 2;
                var arr = [];   //收集名字
                angular.forEach( newsCh.unCheckedData, function( item, data ){
                    arr.push( item.name );
                } );
                $scope.list = arr;
            };
            //---城市
            $scope.list = [];
            $scope.showSelList = false;
            $scope.aniSelList = false;
            var cityCh = new CityChObj();
            cityCh.getData();
            $scope.city = cityCh.data;
            $scope.selItemChecked = [];
            var state_selList = 0;   //用来区分选择状态
            //
            $scope.selCity = function () {  //选择城市按钮
                $scope.showSelList = true;
                $scope.aniSelList = false;
                $scope.list = [];
                state_selList = 0;
                cityCh.getAllList( function( res ){
                    angular.forEach( res, function (item, index) {
                        $scope.list.push(item.province);
                    })
                });
            };
            $scope.closeSelList = function(){
                state_selList = 0;
                $scope.showSelList = false;
                $scope.aniSelList = true;
            };
            $scope.selItem = function (idx) {
                $scope.selItemChecked[ idx ] = true;
                $timeout(function () {    //为了看清radio的点，延时一点点
                    switch (state_selList) {
                        //城市
                        //第一次按下，显示城市列表
                        case 0 :
                            $scope.list = [];
                            angular.forEach( cityCh.allList[idx].city, function (item, index) { //放入城市名字
                                $scope.list.push(item.name);
                            });
                            state_selList = 1;
                            $ionicScrollDelegate.$getByHandle('small').scrollTop(false);    //列表移动到顶端
                            break;
                        case 1 :
                            //第二次按下，关闭城市列表
                            $scope.showSelList = false;
                            $scope.aniSelList = true;
                            $scope.city = $scope.list[idx];
                            City.set( $scope.city ); //更改城市列表
                            City.broadcast();//广播
                            state_selList = 0;
                            break;
                        //未显示的新闻列表
                        case 2 :
                            var tempNewsCh = newsCh.unCheckedData.splice( idx, 1 );     //点击的切出来
                            tempNewsCh[0].chk = true;
                            newsCh.checkedData.push( tempNewsCh[0] );       //压入勾选了的列表
                            NewsCh.set( newsCh.checkedData.concat( newsCh.unCheckedData) );
                            console.log( newsCh.checkedData );
                            NewsCh.updateBroadcast();      //通知其他控制器
                            $scope.showSelList = false;
                            $scope.aniSelList = true;
                            break;
                        default :
                            break;
                    }
                    $scope.selItemChecked = [];     //清空checked按钮
                }, 500);
            };
        }]);
})();
/**
 * Created by Ken on 2015/12/2.
 */
(function () {
    angular.module('weather', []
    ).controller('weatherCtrl', [
        "$scope", "$http", "City",
        function ($scope, $http, City) {
            //---构建对象
            var WeatherObj = function(){
                //---数据转换成类名
                this.getWeatherClassName = function( val ) {
                    var res = "";
                    switch ( val ){
                        case "多云" : res = "ion-ios-partlysunny"; break;
                        case "晴" : res = "ion-ios-sunny"; break;
                        case "阴" : res = "ion-cloud"; break;
                        case "雾" : res = "ion-navicon"; break;
                        case "小雨" : res = "ion-waterdrop"; break;
                        case "中雨" : res = "ion-waterdrop"; break;
                        case "大雨" : res = "ion-ios-rainy"; break;
                        case "雷阵雨" : res = "ion-ios-thunderstorm"; break;
                        case "冰雹" : res = "ion-record"; break;
                        case "冻雨" : res = "ion-ios-rainy-outline"; break;
                        case "雨夹雪" : res = "ion-ios-snowy"; break;
                        case "小雪" : res = "ion-ios-snowy"; break;
                        case "中雪" : res = "ion-ios-snowy"; break;
                        case "大雪" : res = "ion-ios-snowy"; break;
                        case "阵雪" : res = "ion-ios-snowy"; break;
                        case "霜冻" : res = "ion-ios-medical-outline"; break;
                        case "大风" : res = "ion-ios-rewind-outline"; break;
                        case "霾" : res = "ion-grid"; break;
                        default : break;
                    }
                    return res;
                };
                this.getCity = function(){
                    return City.get();
                };
                //---获取天气信息
                this.getWeatherData = function( cityStr, fn ){
                    var url = "http://wthrcdn.etouch.cn/weather_mini?city=" + cityStr; //city是"深圳"之类的中文
                    $http.get(url).success(function (res) {
                        var list = [];
                        list.push(res.data.yesterday);
                        list = list.concat(res.data.forecast);
                        //---从列表中抽取名字作为新的列表
                        var nameList = [];
                        angular.forEach(list, function (item, index) {
                            nameList.push( item.type );  //填入所有名字
                        });
                        fn && fn( list, nameList );
                    });
                };
                //---接受来自设置的广播
                this.receive = function(){
                    City.receive(function( data ){
                        getWeather( data );
                        console.log( data );
                    });
                }
            };
            //---执行---------------------------------------------------------------------------------------------------
            var weather = new WeatherObj();
            weather.receive();      //接受广播
            var city = weather.getCity();
            $scope.dateMark = [" (昨天)", " (今天)", " (明天)"];
            //获取天气信息，回调
            function getWeather( city ){
                $scope.city = city;
                $scope.weatherClass = [];  //天气图标
                weather.getWeatherData( city, function( list, nameList ){
                    $scope.list = list;
                    angular.forEach( nameList, function (item, index) {
                        $scope.weatherClass.push( weather.getWeatherClassName(item) );  //转换成类名
                    });
                    console.log( $scope.weatherClass );
                });
            }
            getWeather( city );
        }]);
})();
/**
 * Created by kolly on 2016/5/11.
 */
//新闻栏目顺序
(function () {
    angular.module('citySer', [])        //城市选择
        .service('City', ["Storage", "$rootScope", function (Storage, $rootScope) {
            //---数据
            this.data = "";
            this.isSet = false;
            var _this = this;
            //---存入Storage
            this.set = function (val) {
                _this.data = val;
                Storage.set('City', _this.data );
            };
            //---取出
            this.get = function () {
                _this.data = Storage.get('City');
                if (_this.data == "" || _this.data == undefined) {   //default
                    _this.data = "深圳";
                }
                return _this.data;
            };
            //---广播
            this.broadcast = function(){
                $rootScope.$broadcast('to-city', _this.data );
            };
            //---接受
            this.receive = function( fn ){
                $rootScope.$on('to-city', function( event, data ){   //栏目改变，重新加载
                    fn && fn( data );
                });
            }
        }])
})();