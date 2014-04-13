util = require '../util.coffee'
Tiled = require './Tiled.coffee'
Player = require './Player.coffee'
GameObject = require './GameObject.coffee'
Collisions = require './Collisions.coffee'

class Level extends GameObject
	constructor: ()->
		super()
		
		@colliders = []

		# create scene
		@scene = new THREE.Scene()
		@scene.add @root

		# camera
		@camera = new THREE.PerspectiveCamera(45, 640 / 480, 1, 10000)	
		@camera.position.z = util.layerSpacing() * 1
		@scene.add @camera

		# lights
		@ambientLight = new THREE.AmbientLight(0xffffff);
		@root.add(@ambientLight)


		# insert player
		@insertPlayer()


		# level
		Tiled.load('assets/level_1.json').then(@populate).catch (error)->
	 		console.error error

	populate: (map)=>
		@root.add(map.layers.background.root)
		map.layers.background.root.position.y = 7.5 * 2
		map.layers.background.root.position.z =  util.layerSpacing() * -1
		map.layers.background.root.scale.set(2, 2, 2)
		
		@root.add(map.layers.midground.root)
		map.layers.midground.root.position.y = 7.5

		for object in map.layers.enemies.objects
			@add object

		@trigger "ready"

	insertPlayer: ()=>
		@player1 = new Player()
		@add @player1
		@player1.root.position.copy @camera.position
		@player1.root.position.z = 0

		@player1.on "die", ()=>
			@trigger "playerDie"

	update: (delta)->
		super(delta)
		@camera.position.x += 1 * delta
		@player1.root.position.x += 1 * delta

		for child in @children
			if child.active == false and child.root.position.x < @camera.position.x + 10
				child.activate()

		Collisions.resolveCollisions(@colliders)

	
			

	add: (gameObject)->
		if gameObject instanceof Collisions.CollisionObject
			@colliders.push gameObject 
		return super(gameObject)

	remove: (gameObject)->
		i =  @colliders.indexOf(gameObject)
		if i >= 0
			@colliders.splice(i, 1)
		return super(gameObject)






exports.Level = Level
