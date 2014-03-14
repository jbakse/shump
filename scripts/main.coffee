class Base
	@_events: {}
	on: (event, handler) ->
		@_events ?= {}
		(@_events[event] ?= []).push handler
		this

	off: (event, handler) ->
		for suspect, index in @_events[event] when suspect is handler
			@_events[event].splice index, 1
		this

	trigger: (event, args...) ->
		return this unless @_events[event]?
		handler.apply this, args for handler in @_events[event]
		this



class World extends Base
	@camera: undefined
	@scene: undefined
	@renderer: undefined
	@clock: undefined

	constructor: ->
		w = 800
		h = 600
		@camera = new THREE.PerspectiveCamera(75, w / h, 1, 10000)
		@camera.position.z = 10
		
		@scene = new THREE.Scene()
		
		@renderer = new THREE.CanvasRenderer()
		@renderer.setSize w, h
		document.body.appendChild @renderer.domElement

		@clock = new THREE.Clock()

		return this

	animate: ->
		@trigger "update", @clock.getDelta()	
		requestAnimationFrame ()=> @animate()
		@renderer.render @scene, @camera
		return

	start: ->
		
		@animate()

class Level
	@root: undefined
	# @geometry: undefined
	# @material: undefined
	@mesh: undefined
	@ambientLight: undefined

	constructor: ->
		@root = new THREE.Object3D()

		@ambientLight = new THREE.AmbientLight(0xffffff);
		@root.add(@ambientLight);		
		
		jsonLoader = new THREE.JSONLoader();
		jsonLoader.load "assets/ship.js", (geometry, materials)=>
			console.log "load", geometry, materials,@material
			material = new THREE.MeshFaceMaterial( materials )
			@mesh = new THREE.Mesh(geometry, material)
			@root.add @mesh

	update: (delta)=>
		# return if not mesh?

		if input.keyStates['up']
			@mesh.position.y += 10 * delta;
		if input.keyStates['down']
			@mesh.position.y -= 10 * delta;
		if input.keyStates['left']
			@mesh.position.x -= 10 * delta;
		if input.keyStates['right']
			@mesh.position.x += 10 * delta;


class Input
	keyStates: {}
	keyMap: 
		"38":"up"
		"40":"down"
		"37":"left"
		"39":"right"

	constructor: ->
		for key, value of @keyMap
			@keyStates[value] = false;

		$(window).keydown (e)=>
			if @keyMap[e.which]
				@keyStates[@keyMap[e.which]] = true;

		$(window).keyup (e)=>
			if @keyMap[e.which]
				@keyStates[@keyMap[e.which]] = false;
			

world = new World();
level = new Level();
input = new Input();

world.scene.add level.root
world.on "update", level.update
# world.on "update", ()-> console.log input.keyStates['up']
world.start()