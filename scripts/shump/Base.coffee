class Base
	constructor: ()->
		@_events = {}

	on: (event, handler) ->
		(@_events[event] ?= []).push handler
		return this

	off: (event, handler) ->
		for suspect, index in @_events[event] when suspect is handler
			@_events[event].splice index, 1
		return this

	trigger: (event, args...) =>
		return this unless @_events[event]?
		for i in [@_events[event].length-1..0] by -1
			handler = @_events[event][i]
			handler.apply this, args
		return this

module.exports = Base
