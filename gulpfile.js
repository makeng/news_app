// 加载插件，作为变量名字
var gulp = require('gulp'),
    less = require('gulp-less'),
	minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer');
/***********************************************************************************************************************
 * 包装函数
 * **********************************************************************************************************************/
//创建对象，并集中在一个数组
var arrObj = [];
var index = -1;		//后面马上加加，固从-1开始
function makeObj( name, source, target1, target2, newFileName ){
	index ++;
	arrObj[index] = {
		name: name,
		source: source,
		target1: target1,
		target2: target2,
		newFileName: newFileName
	};
}
//文件夹下文件的移动
function moveFiles( funName, source, target ){
	gulp.task(funName, function () {
		gulp.src(source)
			.pipe(gulp.dest(target))
	});
}
//less转换成css
function lessToCss( funName, source, target1, target2 ){
	gulp.task( funName, function () {
		gulp.src( source )
			.pipe(autoprefixer({
				browsers: ['last 2 versions', 'Android >= 4.0'],
				cascade: true, //是否美化属性值 默认：true 像这样：
				//-webkit-transform: rotate(45deg);
				//        transform: rotate(45deg);
				remove:true //是否去掉不必要的前缀 默认：true
			}))
			.pipe(less())  // *.css
			.pipe(gulp.dest( target1 ))
			.pipe(rename({suffix: '.min'}))   // 把编译出来的css文件重命名，压缩版的中间都会带上.min
			.pipe(minifycss())                // 把重命名后的style.min.css文件执行压缩操作
			.pipe(gulp.dest( target1 ))
			.pipe(gulp.dest( target2 ))
	});
}
//css最小化
//less转换成css
function cssOptimize( funName, source, newFileName, target1, target2 ){
	gulp.task( funName, function () {
		gulp.src( source )
			.pipe(concat( newFileName ))
			.pipe(rename({suffix: '.min'}))   // 把编译出来的css文件重命名，压缩版的中间都会带上.min
			.pipe(minifycss())                // 把重命名后的style.min.css文件执行压缩操作
			.pipe(gulp.dest( target1 ))
			.pipe(gulp.dest( target2 ))
	});
}
//js合并和最小化，已经最小化的不需要操作
function jsOptimize( funName, source, newFileName, target1, target2 ){
	gulp.task( funName, function () {
		gulp.src( source )		//注意js文件有顺序
			.pipe(concat( newFileName ))
			.pipe(gulp.dest( target1 ))
			.pipe(gulp.dest( target2 ))
			.pipe(rename({suffix: '.min'}))  // main.js => main.min.js
			.pipe(uglify())  //main.min.js
			.pipe(gulp.dest( target1 ))
			.pipe(gulp.dest( target2 ))
	});
}
/***********************************************************************************************************************
 * 创建功能
 * **********************************************************************************************************************/
//文件移动 -----------------------------------------------------------------------------
/*---一个对象需要把index加1-------*/
makeObj( "moveHtml", "myApp/src/*.html", "myApp/www" );
makeObj( "moveHtmlPages", "myApp/src/pages/**/*", "myApp/www/pages" );
makeObj( "moveImg", "myApp/src/imgs/*", "myApp/www/imgs" );
makeObj( "moveJs", "myApp/src/js/lib/*.js", "myApp/www/js/lib" );
makeObj( "moveJson", "myApp/src/json/*.json", "myApp/www/json" );

//makeObj( "moveCss", "myApp/src/css/!*", "myApp/www/css" );
//文件移动
for ( var i = 0; i < arrObj.length; i ++ ){	//文件移动的集中处理
	moveFiles( arrObj[i].name, arrObj[i].source, arrObj[i].target1 );
}
//makeObj( name, source, target1, target2, newFileName )
//less转换-----------------------------------------------------------------------------------------
/*makeObj( "less2css", "myApp/src/less/!*.less", "myApp/src/css", "myApp/www/css" );
lessToCss( arrObj[index].name, arrObj[index].source, arrObj[index].target1, arrObj[index].target2 );*/
//css最小化-----------------------------------------------------------------------------------------
makeObj( "cssOpt", "myApp/src/css/unbuild/*.css", "myApp/src/css/build", "myApp/www/css/build", "main.css" );
cssOptimize( arrObj[index].name, arrObj[index].source, arrObj[index].newFileName, arrObj[index].target1, arrObj[index].target2 );
//js转换-------------------------------------------------------------------------------------------
makeObj( "jsOpt", "myApp/src/js/ng-operate/**/*.js", "myApp/src/js", "myApp/www/js", "app.js" );
jsOptimize( arrObj[index].name, arrObj[index].source, arrObj[index].newFileName, arrObj[index].target1, arrObj[index].target2 );
//监听文件-------------------------------------------------------------------------------------
var arrWatch = {
	fun: [],
	source: []
};
for ( i = 0; i < arrObj.length; i ++ ){
	arrWatch.fun[i] = arrObj[i].name;			//收集对象函数名字
	arrWatch.source[i] = arrObj[i].source;	//收集对象源文件
}
gulp.task('watch', arrWatch.fun, function () {	//先执行一次全部函数，在监听
	gulp.watch(arrWatch.source, arrWatch.fun);
});
    
    



    

