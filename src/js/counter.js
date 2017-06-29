'use strict';

var cont = 0;
var counter = function(){
	return ++cont;
}

module.exports = counter;
