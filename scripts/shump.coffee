after = (delay, func)->
	setTimeout func, delay

class Base
	constructor: ()->
		@_events = {}

	on: (event, handler) ->
		(@_events[event] ?= []).push handler
		this

	off: (event, handler) ->
		for suspect, index in @_events[event] when suspect is handler
			@_events[event].splice index, 1
		this

	trigger: (event, args...) =>
		return this unless @_events[event]?
		handler.apply this, args for handler in @_events[event].slice(0) #.slice(0) to copy array, walk copy to avoid problems with delte while iterate
		this


class World extends Base
	
	constructor: ->
		super()

		w = 800
		h = 600
		@camera = new THREE.PerspectiveCamera(75, w / h, 1, 10000)
		@camera.position.z = 10
		
		@scene = new THREE.Scene()
		
		@renderer = new THREE.CanvasRenderer()
		@renderer.setSize w, h
		document.body.appendChild @renderer.domElement

		@clock = new THREE.Clock()
		@stats = new Stats();
		@stats.domElement.style.position = 'absolute'
		@stats.domElement.style.top = '0px'
		document.body.appendChild( @stats.domElement )

		return this

	animate: ->
		@trigger "update", @clock.getDelta()	
		@renderer.render @scene, @camera
		@stats.update()
		requestAnimationFrame ()=> @animate()
		return

	start: ->
		@animate()

class GameObject
	constructor: ->
		@children = []
		@root = new THREE.Object3D()


	update: (delta)=>
		for child in @children
			child.update(delta)

	add: (gameObject)->
		@children.push(gameObject)
		@root.add(gameObject.root)

class Model extends Base
	constructor: (@geometry, @material)->
		super()
		@status = undefined

	load: (fileName)=>
		jsonLoader = new THREE.JSONLoader();
		jsonLoader.load fileName, (geometry, materials, others...)=>
			console.log geometry, materials, others
			@material = new THREE.MeshFaceMaterial( materials )
			@geometry = geometry
			@status = "ready"
			@trigger "success", this


class ModelLoader
	
	constructor: ()->
		@defaultGeometry = new THREE.CubeGeometry(1,1,1)
		@defaultMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } )	
		@loadedModels = {}

	load: (fileName)->

		# if already loaded, just make the new mesh and return
		if @loadedModels[fileName]? && @loadedModels[fileName].status == "ready"
			return new THREE.Mesh( @loadedModels[fileName].geometry, @loadedModels[fileName].material )
		
		# if requested but not ready
		if @loadedModels[fileName]
			model = @loadedModels[fileName]
		
		# if not requested before
		else
			model = new Model()
			model.load(fileName)
			@loadedModels[fileName] = model

		object = new THREE.Mesh( @defaultGeometry, @defaultMaterial )
		model.on "success", (m)->
			object.geometry = m.geometry
			object.material = m.material
			m.off "success", arguments.callee #remove this handler once used
		return object


class Player extends GameObject

	constructor: (file)->
		super()
		@root.add modelLoader.load("assets/ship.js")

	update: (delta)=>
		if input.keyStates['up']
			@root.position.y += 10 * delta;
		if input.keyStates['down']
			@root.position.y -= 10 * delta;
		if input.keyStates['left']
			@root.position.x -= 10 * delta;
		if input.keyStates['right']
			@root.position.x += 10 * delta;
		

class Level extends GameObject
	constructor: ->
		super()
		
		@ambientLight = new THREE.AmbientLight(0xffffff);
		@root.add(@ambientLight);		

		@player1 = new Player()
		@add @player1

		@root.add modelLoader.load("assets/grid_cube.js")

	
	

class Input
	keyMap: 
		"38":"up"
		"87":"up" #w
		"40":"down"
		"83":"down" #s
		"37":"left"
		"65":"left" #a
		"39":"right"
		"68":"right" #d

	constructor: ->
		@keyStates = []

		for key, value of @keyMap
			@keyStates[value] = false;

		$(window).keydown (e)=>
			if @keyMap[e.which]
				@keyStates[@keyMap[e.which]] = true;

		$(window).keyup (e)=>
			if @keyMap[e.which]
				@keyStates[@keyMap[e.which]] = false;



modelLoader = new ModelLoader()
input = new Input()

			
module.exports.Input = Input
module.exports.ModelLoader = ModelLoader
module.exports.World = World
module.exports.Level = Level
