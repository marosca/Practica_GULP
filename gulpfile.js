var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

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

//Borra los js de la carpeta de distribucion
gulp.task('borrarJS', function() {
    console.log('.... borrando la carpeta dist/js');
    return gulp.src(path.jsProduccion + '?(.map)')
    .pipe(plugins.rimraf());
});

//Borra los css de la carpeta de distribucion
gulp.task('borrarCSS', function() {
    console.log('.... borrando la carpeta dist/css');
    return gulp.src(path.css + '?(.map)')
    .pipe(plugins.rimraf());
});


//compilar sass --> css y minificarlo
gulp.task('buildCSS', ['borrarCSS'], function(){
    return gulp.src(path.sass)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass({ outputStyle:'compressed' }))
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(path.css));
});

//tarea para minificar código JS y renombrarlo a *.*min-.js
gulp.task('buildJS', ['borrarJS'], function(){
    return gulp.src(path.js)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.uglify())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.sourcemaps.write('./'))//los escribe en la misma ruta
    .pipe(gulp.dest(path.jsProduccion));
});

gulp.task('imagemin', function(){
    return gulp.src(path.img) //cogerá cualquier imagen dentro de culaquier subcarpeta que haya dentro de src/img
    .pipe(plugins.imagemin())
    .pipe(gulp.dest(path.imgProduccion));//al usar el glob de arriba (lo de los astericos) aquí replicará la misma estructura de carpetas
});

//Borrar archivos de la carpeta de distribución que ya no sean necesarios porque sus orginales han sido borrados o renombrados en la carpeta src
gulp.task('borrar', function() {
    console.log('....BORRANDO ' + folder + '/' + file + ' en DIST');
    console.log(DIST + '/' + folder + '/' + file + '?(.map)');
    return gulp.src(DIST + '/' + folder + '/' + file + '?(.map)')
    .pipe(plugins.rimraf());
});

// Vigilar archivos scss / js y la carpeta src/img
gulp.task('vigilar', function(){
    var sassWatcher = gulp.watch(path.sass, ['buildCSS']);
    var jsWatcher = gulp.watch(path.js, ['buildJS']);
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
                file = file + '.min.js';
                break;
            case 'img':
                file = file + '.' + ext;
        }

        // si se ha borrado un archivo (cuando se renombra también se lanza) entonces autoejecutamos la tarea borrar
        if( event.type == 'deleted'){
            gulp.start(['borrar']);
        }
    }
    sassWatcher.on('change', actualizarDIST);
    jsWatcher.on('change', actualizarDIST);
    imgWatcher.on('change', actualizarDIST);
});

//Tarea para utilizar antes de pasar a producción el sitio
gulp.task('build', ['copiarDependencias', 'buildJS', 'buildCSS', 'imagemin', 'vigilar']);
