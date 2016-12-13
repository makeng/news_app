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
                        $scope.city = data;
                        console.log( data );
                    });
                }
            };
            //---执行---------------------------------------------------------------------------------------------------
            var weather = new WeatherObj();
            weather.receive();      //接受广播
            var city = weather.getCity();
            $scope.dateMark = [" (昨天)", " (今天)", " (明天)"];
            $scope.weatherClass = [];  //天气图标
            $scope.city = city;
            //获取天气信息，回调
            weather.getWeatherData( city, function( list, nameList ){
                $scope.list = list;
                angular.forEach( nameList, function (item, index) {
                    $scope.weatherClass.push( weather.getWeatherClassName(item) );  //转换成类名
                });
            });
        }]);
})();