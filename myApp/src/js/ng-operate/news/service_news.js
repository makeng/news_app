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