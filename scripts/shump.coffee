core = require './shump_core.coffee'

class GameObject
	constructor: ->
		@parent = undefined
		@children = []
		@root = new THREE.Object3D()


	update: (delta)=>
		for child in @children.slice(0)
			child.update(delta)

	add: (gameObject)->
		gameObject.parent = this
		@children.push(gameObject)
		@root.add(gameObject.root)
		return gameObject

	remove: (gameObject)->
		@root.remove(gameObject.root)
		gameObject.parent = null
		i =  @children.indexOf(gameObject)
		if i >= 0
			@children.splice(i, 1);
		return gameObject

class Player extends GameObject

	constructor: ()->
		super()
		@root.add modelLoader.load("assets/ship.js")
		@lastFire = Date.now()

	update: (delta)=>
		if input.keyStates['up']
			@root.position.y += 10 * delta;
		if input.keyStates['down']
			@root.position.y -= 10 * delta;
		if input.keyStates['left']
			@root.position.x -= 10 * delta;
		if input.keyStates['right']
			@root.position.x += 10 * delta;
		if input.keyStates['fire_primary']
			@fire_primary()

	fire_primary: ()->
		if Date.now() > @lastFire + 240
			@lastFire = Date.now()
			bullet = new Bullet(@root.position)
			@parent.add bullet

class Bullet extends GameObject
	
	constructor: (position)->
		super()
		@birth = Date.now()
		@timeToLive = 1000

		@root.add new THREE.Mesh bulletGeometry, bulletMaterial
		@root.position.copy(position)

	update: ()->
		@root.position.x += .25
		if Date.now() > @birth + @timeToLive
			@parent.remove(this)

class Level extends GameObject
	constructor: ->
		super()
		
		@ambientLight = new THREE.AmbientLight(0xffffff);
		@root.add(@ambientLight);		

		@player1 = new Player()
		@add @player1

		# a@root.add modelLoader.load("assets/grid_cube.js")

	
	



bulletTexture = THREE.ImageUtils.loadTexture "assets/bullet.png"
bulletMaterial = new THREE.MeshBasicMaterial
			map: bulletTexture
			side: THREE.DoubleSide
bulletGeometry = new THREE.PlaneGeometry( 1, 1);
		

modelLoader = new core.ModelLoader()
input = new core.Input()

			
module.exports.Level = Level
module.exports.core = core
