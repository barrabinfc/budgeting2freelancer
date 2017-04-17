import gulp from "gulp";
import cp from "child_process";
import gutil from "gulp-util";
import sourcemaps from "gulp-sourcemaps";
import postcss from "gulp-postcss";
import cssImport from "postcss-import";
import cssNext from "postcss-cssnext";

import webpack from "webpack";
import webpackConfig from "./webpack.conf";


gulp.task("build", ["css","vendor-js","js"])

gulp.task("css", () => {
    gulp.src("./src/css/*.css")
        .pipe(sourcemaps.init())
        .pipe(postcss([cssImport({from: "./src/css/main.css"}), cssNext()]))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./dist/css"))
});

gulp.task("vendor-js", () => {
    gulp.src("./src/js/vendor/*.js")
        .pipe(gulp.dest("./dist/js/vendor"))
})

gulp.task("js", (cb) => {
    const wpackConfig = Object.assign({}, webpackConfig)
    webpack(webpackConfig, (err,stats) => {
        if (err) throw new gutil.PluginError("webpack",err)
        gutil.log("[webpack]", stats.toString({
            colors: true,
            progress: true
        }))
        cb()
    })
})

gulp.task("server", ["css","vendor-js","js"], () => {
    gulp.watch("./src/js/**/*.js", ["js"])
    gulp.watch("./src/css/**/*.css", ["css"])
})
