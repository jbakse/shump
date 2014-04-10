Tiled = require './Tiled.coffee'
Player = require './Player.coffee'
CollisionObject = require './CollisionObject.coffee'
GameObject = require './GameObject.coffee'

class Level extends GameObject
	constructor: (@world)->
		super()
		
		@colliders = []

		@ambientLight = new THREE.AmbientLight(0xffffff);
		@root.add(@ambientLight)

		@player1 = new Player()
		@add @player1

		
		mapPromise = Tiled.load('assets/level_1.json')
		readyPromise = mapPromise.then (map)=>
			@root.add(map.layers.background.root)
			map.layers.background.root.position.y = 7.5

			@root.add(map.layers.midground.root)
			map.layers.midground.root.position.y = 7.5

			for object in map.layers.enemies.objects
				@add object

		
		readyPromise.catch (error)->
			console.error error

	update: (delta)->
		super(delta)
		@world.camera.position.x += 1 * delta
		@player1.root.position.x += 1 * delta

		for child in @children
			if child.active == false and child.root.position.x < @world.camera.position.x + 10
				child.activate()

		@collisions()

	
			

	add: (gameObject)->
		if gameObject instanceof CollisionObject
			@colliders.push gameObject 
		return super(gameObject)

	remove: (gameObject)->
		i =  @colliders.indexOf(gameObject)
		if i >= 0
			@colliders.splice(i, 1);

		return super(gameObject)




	collisions: ()->
		for a in @colliders
			if a.active
				for b in @colliders
					if b.active
						if a.colliderHitTypes.indexOf(b.colliderType) > -1
							if @testCollision a, b
								a.collideInto b

	testCollision: (a, b)->
		return a.root.position.distanceToSquared(b.root.position) < a.collisionRadius + b.collisionRadius


exports.Level = Level
