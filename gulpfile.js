var gulp = require('gulp');
var gutil = require('gulp-util');


// `npm install --save replace`
var replace = require('replace');
var replaceFiles = ['./www/scripts/constants.js'];

var file = require('gulp-file');
var setUrl = function(url) {
    return file('base.js', 'BASE_URL="' + url + '"', {
            src: true
        })
        .pipe(gulp.dest('./www/scripts/'))
};

gulp.task('add-proxy', function() {
    setUrl("http://localhost:8100");
    /*return replace({
        regex: "http://54.191.240.64:8080",
        replacement: "http://localhost:8100",
        paths: replaceFiles,
        recursive: false,
        silent: false,
    });*/
});

gulp.task('remove-proxy', function() {
    setUrl("http://54.191.240.64:8080");
    /*return replace({
        regex: "http://localhost:8100",
        replacement: "http://54.191.240.64:8080",
        paths: replaceFiles,
        recursive: false,
        silent: false,
    });*/
});


//var jeditor = require("gulp-json-editor");
var replaceProxyFiles = ['./ionic.project'];
gulp.task('local-dev', function() {
    return replace({
        regex: "http://mycehq.com",
        replacement: "http://localhost:8080",
        paths: replaceProxyFiles,
        recursive: false,
        silent: false,
    });
});

gulp.task('aws-dev', function() {
    return replace({
        regex: "http://localhost:8080",
        replacement: "http://mycehq.com",
        paths: replaceProxyFiles,
        recursive: false,
        silent: false,
    });
});



gulp.task('aws-server', function() {
    setUrl("http://sme.mycehq.com");
});

var cachebust = require('gulp-cache-bust');
var fs = require('fs');
var s3 = require("gulp-s3");
var wait = require('gulp-wait');

gulp.task("upload", ['aws-server'], function() {
    aws = JSON.parse(fs.readFileSync('./aws.json'));
    gulp.src("./www/**").pipe(gulp.dest("./dist"));

    gulp.src("./www/index.html").pipe(wait(3000))
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest("./dist"));
    gulp.src('./dist/**').pipe(s3(aws));
});
