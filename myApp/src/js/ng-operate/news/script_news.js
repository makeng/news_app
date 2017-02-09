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
