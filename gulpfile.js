let gulp = require("gulp");
let browserSync = require("browser-sync").create();



gulp.task('browser-sync', ()=>{
    browserSync.init({
        server: "./"
    });
    gulp.watch("./*.*").on('change', browserSync.reload);
});

