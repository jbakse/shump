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
	

	constructor: ->
		w = 800
		h = 600
		@camera = new THREE.PerspectiveCamera(75, w / h, 1, 10000)
		@camera.position.z = 1000
		
		@scene = new THREE.Scene()
		
		@renderer = new THREE.CanvasRenderer()
		@renderer.setSize w, h
		document.body.appendChild @renderer.domElement

		

		return this

	animate: ->
		@trigger "update"		
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

	update: =>
		@mesh.rotation.x += .1;


world = new World();
level = new Level();

world.scene.add level.root
world.on "update", level.update

world.start()