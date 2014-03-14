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
		@camera.position.z = 1000
		
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
	@geometry: undefined
	@material: undefined
	@mesh: undefined

	constructor: ->
		@root = new THREE.Object3D()
		@geometry = new THREE.BoxGeometry(200, 200, 200)
		@material = new THREE.MeshBasicMaterial(
			color: 0xff0000
			wireframe: true
		)
		@mesh = new THREE.Mesh(@geometry, @material)
		@root.add @mesh

	update: (delta)=>
		if input.keyStates['up']
			@mesh.position.y += 600 * delta;
		if input.keyStates['down']
			@mesh.position.y -= 600 * delta;
		if input.keyStates['left']
			@mesh.position.x -= 600 * delta;
		if input.keyStates['right']
			@mesh.position.x += 600 * delta;


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