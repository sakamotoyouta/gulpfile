/* 使用するプラグイン（モジュールのロード） */
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    ejs = require("gulp-ejs"),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    combineMq = require('gulp-combine-mq'),
    notify = require('gulp-notify'),
	 babel = require('babel');

/*****************************************************
・Deliverablesは納品物のフォルダ
・developは開発フォルダ
・afterCompileEjsはコンパイルしたhtmlファイルが
吐き出される場所（gulpfile.jsからの相対パスで記述）を示す。
・ejsDirはコンパイルしたいejsファイルがある場所。
・templateDirはテンプレートejsファイルがある場所。
・sassCompileはsassファイルがある場所。
・afterCompileSassはコンパイル後のcssファイルがある場所。
*******************************************************/
//Deliverables Folder
var deliverables = "html/";
//Folder to develop
var develop = "";
//config
var config = {
   "path" : {
      "sassCompile" : develop+"sass/**/*.scss",
      "sassModule" : develop+"sass/**/_*.scss",
      "afterCompileSass" : develop+"css/",
      "ejsDir"    : develop+"ejs/**/*.ejs",
      "templateDir": develop+"ejs/templates/_*.ejs",
      "afterCompileEjs": develop,
		"es6": develop+"es6/*.js",
		"js": develop+"js/*.js"
   }
},
//Folder to release
release = {
  "path" : {
    "css": deliverables+"css/",
    "js": deliverables+"js/",
    "html": deliverables,
  }
}


gulp.task('default',function(){
  //監視
  gulp.watch([config.path.ejsDir,config.path.templateDir],['EJS']);
  gulp.watch([config.path.sassCompile],['SASS']);
  gulp.watch([config.path.es6],['BABEL']);
  gulp.watch([develop+'*.html',develop+'js/*.js'],['RELOAD']);

  //サーバー起動
  browserSync({
      server:{
        baseDir: "./"+develop//ルートとなるディレクトリ
        //proxy: 'localhost:8888/wordpress'
      }
    });

  //ejsファイルのコンパイル
  gulp.task('EJS',function(){
    gulp.src([config.path.ejsDir,'!'+config.path.templateDir])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(ejs({}, {ext: '.html'}))
    .pipe(gulp.dest(config.path.afterCompileEjs));
  });

  //sassファイルのコンパイルとプレフィックスの付与
  gulp.task('SASS',function(){
    gulp.src([config.path.sassCompile,'!'+config.path.sassModule])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sass())
    .pipe(autoprefixer({browsers: ['last 3 versions','ie >=10','android >=4.2']}))
    .pipe(gulp.dest(config.path.afterCompileSass))//一度コンパイルしてから
    .pipe(combineMq())//cssを整形
    .pipe(gulp.dest(config.path.afterCompileSass))//整形したcssを再度吐きだし
    .pipe(browserSync.stream());
  });

  //es6のコンパイル
  gulp.task('babel',function(){
	  gulp.src(config.path.es6)
	  	.pipe(plumber({
			errorHandler: notify.onError('Error: <%= error.message %>')
		}))
		.pipe(babel())
		.pipe(gulp.dest(config.path.js));
  });



  //ブラウザの自動リロード
  gulp.task('RELOAD',function(){
    browserSync.reload();
 });

});

gulp.task('build',function(){
  gulp.src(config.path.afterCompileSass+"**/*.css")
  .pipe(gulp.dest(release.path.css));
  gulp.src(develop+"js/**/*.js")
  .pipe(gulp.dest(release.path.js));
  gulp.src(develop+"**/*.html")
  .pipe(gulp.dest(release.path.html));
});
