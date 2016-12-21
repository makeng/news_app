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