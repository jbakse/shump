core = require './shump_core.coffee'

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

	
	





modelLoader = new core.ModelLoader()
input = new core.Input()

			
module.exports.Level = Level
module.exports.core = core
