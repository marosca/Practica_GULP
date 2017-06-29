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
