(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var cont = 0; // error para probar eslint!!
var cont = 0;

/**
 * Función contandor. Devuelve cada vez un número incremtado en una unidad, hasta el límiti establecido. Si no se pasa parámetro contará hasta 10
 * @param  {Number} limit [límite del contado]
 * @return {Number}       [devulve el número por el que va el contador]
 */
var counter = function(limit){
	var hasta = (limit == undefined) ? 10 : parseInt(limit, 10);
	if(cont < hasta) ++cont;
	return cont;
}

module.exports = counter;

},{}],2:[function(require,module,exports){
'use strict';
var counter = require('./counter');
/**
 * Eventos javascript
 * Cada vez que se produce un mouseover se lanza el contador
 */
$(function(){
	$('#boton').on('mouseover',function(){
		$('body').css('background-color', 'black');
		$('div.img').css('opacity', 1);
		$("#counter").text(counter());
	});

	$('#boton').on('mouseleave',function(){
		$('div.img').css('opacity', 0);
		$('body').css('background-color', 'white');
	});
});

},{"./counter":1}]},{},[2]);

//# sourceMappingURL=app.js.map
