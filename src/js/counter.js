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
