class Input
	keyMap: 
		"38":"up" #up arrow
		"87":"up" #w
		"40":"down" #down arrow
		"83":"down" #s
		"37":"left" #left arrow
		"65":"left" #a
		"39":"right" #right arrow
		"68":"right" #d
		"32":"fire_primary" #space

	constructor: ->
		@keyStates = []

		for key, value of @keyMap
			@keyStates[value] = false;

		$(window).keydown (e)=>
			console.log e.which
			if @keyMap[e.which]
				@keyStates[@keyMap[e.which]] = true;
			e.stopPropagation()

		$(window).keyup (e)=>
			if @keyMap[e.which]
				@keyStates[@keyMap[e.which]] = false;
			e.stopPropagation()

module.exports = Input
