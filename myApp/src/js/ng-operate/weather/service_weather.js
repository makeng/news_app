/**
 * Created by kolly on 2016/5/11.
 */
//新闻栏目顺序
(function () {
    angular.module('citySer', [])        //城市选择
        .service('City', ["Cookie", "$rootScope", function (Cookie, $rootScope) {
            //---数据
            this.data = "";
            this.isSet = false;
            var _this = this;
            //---存入cookie
            this.set = function (val) {
                _this.data = val;
                Cookie.set('City', _this.data, 30);
            };
            //---取出
            this.get = function () {
                _this.data = Cookie.get('City');
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