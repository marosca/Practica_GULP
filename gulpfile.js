var gulp = require('gulp');
var sass = require('gulp-sass');
var rimraf = require('gulp-rimraf');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var through2 = require('through2');
var htmlreplace = require('gulp-html-replace');
var jsdoc = require('gulp-jsdoc3');
var eslint = require('gulp-eslint');

// Rutas de ARCHIVOS
const DIST = 'dist';
const SRC = 'src';

var path = {
  sass: SRC + '/sass/*.scss',
  css:  DIST + '/css',
  js: SRC + '/js/*.js',
  jsProduccion: DIST + '/js',
  img: SRC + '/img/**/*',
  imgProduccion: DIST + '/img'
};

// carpeta y archivo que ha sido modificado en src. Quedan establecidos en la tarea "VIGILAR"
var file = '';
var folder = '';

//tarea para copia de node_modules a js
gulp.task('copiarDependencias', function(){
    return gulp.src('./node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest(path.jsProduccion));
});


//Borra los css de la carpeta de distribucion
gulp.task('borrar:css', function() {
    console.log('.... borrando los archivos de dist/css');
    return gulp.src(path.css + '/**/*')
    .pipe(rimraf());
});

//compilar sass --> css. Desarrollo expanded con sourcemap, Produccion minificado
gulp.task('build:css:dev', ['borrar:css'], function(){
    return gulp.src(path.sass)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle:'expanded' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.css));
});

gulp.task('build:css:prod', ['borrar:css'], function(){
    return gulp.src(path.sass)
        .pipe(sass({ outputStyle:'compressed' }))
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest(path.css));
});

// Empaquetado de JS con browserify, produccion app.min.js
gulp.task('build:js:prod', function () {
  return gulp.src('./src/js/main.js')
      .pipe(sourcemaps.init())
      .pipe(through2.obj(function (file, enc, next){
              browserify(file.path)
                  .bundle(function(err, res){
                      file.contents = res;
                      next(null, file);
                  });
          }))
      .pipe(uglify())
      .pipe(rename({basename: "app", suffix: ".min"}))
      .pipe(sourcemaps.write('./'))//los escribe en la misma ruta
      .pipe(gulp.dest(path.jsProduccion));
});
// Empaquetado de JS con browserify, desarrollo app.js con sourcemap
gulp.task('build:js:dev', function () {
  return gulp.src('./src/js/main.js')
      .pipe(sourcemaps.init())
      .pipe(through2.obj(function (file, enc, next){
              browserify(file.path)
                  .bundle(function(err, res){
                      file.contents = res;
                      next(null, file);
                  });
          }))
      .pipe(rename({basename: "app"}))
      .pipe(sourcemaps.write('./'))//los escribe en la misma ruta
      .pipe(gulp.dest(path.jsProduccion));
});

// tarea para optimizar imagenes
gulp.task('imagemin', function(){
    return gulp.src(path.img) //cogerá cualquier imagen dentro de culaquier subcarpeta que haya dentro de src/img
    .pipe(imagemin())
    .pipe(gulp.dest(path.imgProduccion));//al usar el glob de arriba (lo de los astericos) aquí replicará la misma estructura de carpetas
});

//cambiar rutas en el html para produccion, el html resultante quedarán en la carpeta raiz /html_dist
gulp.task('html:prod', function() {
  gulp.src('index.html')
    .pipe(htmlreplace({
        'css': path.css + '/estilos.min.css',
        'js': path.jsProduccion + '/app.min.js'
    }))
    .pipe(gulp.dest('./html_dist'));
});


//Borrar archivos de la carpeta de distribución que ya no sean necesarios porque sus orginales han sido borrados o renombrados en la carpeta src
gulp.task('borrar:eliminados', function() {
    console.log('....BORRANDO ' + folder + '/' + file + ' en DIST');
    console.log(DIST + '/' + folder + '/' + file + '?(.map)');
    return gulp.src(DIST + '/' + folder + '/' + file + '?(.map)')
    .pipe(rimraf());
});

// Vigilar archivos scss / js y la carpeta src/img
gulp.task('vigilar', function(){
    var sassWatcher = gulp.watch(path.sass, ['build:css:dev']);
    var jsWatcher = gulp.watch(path.js, ['build:js:dev']);
    var imgWatcher = gulp.watch(path.img, ['imagemin']);

    //Función para loguear cambios de archivos y actualizar las carpetas de distribucion borrando archivos que ya no sean utilizados
    function actualizarDIST(event){
        var files = event.path .split('/');
        folder = files[files.length-2]; // img | sass | js
        var fileExt = files[files.length-1]; // archivo con extensión
        console.log('Procesado: ' + fileExt + ' => ' + event.type);
        var ext = fileExt.substring(fileExt.lastIndexOf('.') + 1); //extension del archivo
        file = fileExt.substring(0, fileExt.lastIndexOf('.')); //archivo sin extension

        //vemos en que carpeta se ha producido el cambio para corregir las rutas de distribución. Si se ha tocado un arhivo sass en distribución hay que trabajar sobre la carpeta css/arhivo.css. Si es un js, en distribución se trabaja sobre el arcihvo.min.js
        switch(folder){
            case 'sass':
                file = file + '.css';
                folder = 'css';
                break;
            case 'js':
                file = file + '.js';
                break;
            case 'img':
                file = file + '.' + ext;
        }

        // si se ha borrado un archivo (cuando se renombra también se lanza) entonces autoejecutamos la tarea borrar
        if( event.type == 'deleted'){
            gulp.start(['borrar:eliminados']);
        }
    }
    sassWatcher.on('change', actualizarDIST);
    jsWatcher.on('change', function(){
            actualizarDIST();
            gulp.start('lint');
          });
    imgWatcher.on('change', actualizarDIST);
});

// Crear documentación
gulp.task('doc', function (cb) {
  var config = require('./src/jsdocConfig.json');
    gulp.src(['README.md', path.js], {read: false})
        .pipe(jsdoc(config, cb));
});

// Linter con gulp-eslint
gulp.task('lint', function () {
    return gulp.src([path.js,'!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

//Tarea para utilizar antes de pasar a producción el sitio
gulp.task('build:prod', ['copiarDependencias', 'build:js:prod', 'build:css:prod', 'imagemin', 'html:prod']);

//Tarea para utilizar antes de pasar a producción el sitio
gulp.task('build:dev', ['copiarDependencias', 'build:js:dev', 'build:css:dev', 'imagemin', 'vigilar', 'lint']);
