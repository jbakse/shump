core = require './shump_core.coffee'
util = require './util.coffee'

class GameObject
	constructor: ->
		@parent = undefined
		@children = []
		@root = new THREE.Object3D()
		@dead = false
		@active = true
		@age = 0

	update: (delta)=>
		@age += delta
		for i in [@children.length-1..0] by -1
			child = @children[i]
			if child.dead
				@remove child
				continue
			if child.active
				child.update delta 
	
	activate: ()->
		@active = true;
		

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

	die: ()->
		@dead = true;
	

class CollisionObject extends GameObject
	constructor: ()->
		super()
		@colliderType = undefined
		@colliderHitTypes = []

	collideWith: (gameObject)->
		@die()
		gameObject.die()

	


class Player extends CollisionObject

	constructor: ()->
		super()
		
		@root.position.setX(-11);
		world.camera.position.setX(-11);
		@colliderType = "player"
		@colliderHitTypes.push ""


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
			# @parent.colliders.push bullet

	die: ()->
		# console.log "die"


class Bullet extends CollisionObject
	bulletTexture = THREE.ImageUtils.loadTexture "assets/bullet.png"
	bulletMaterial = new THREE.MeshBasicMaterial
			map: bulletTexture
			side: THREE.DoubleSide
	
	bulletGeometry = new THREE.PlaneGeometry( 1, 1);

	constructor: (position)->
		super()
		@colliderType = "bullet"
		@colliderHitTypes.push "enemy"
		
		@birth = Date.now()
		@timeToLive = 1000
		@root.add new THREE.Mesh bulletGeometry, bulletMaterial
		@root.position.copy(position)

	update: ()->
		@root.position.x += .25
		if Date.now() > @birth + @timeToLive
			@parent.remove(this)

class Enemy extends CollisionObject
	enemyTexture = THREE.ImageUtils.loadTexture "assets/enemy.png"
	enemyMaterial = new THREE.MeshBasicMaterial
			map: enemyTexture
			side: THREE.DoubleSide
	
	enemyGeometry = new THREE.PlaneGeometry( 1, 1);

	constructor: (position)->
		super()
		@colliderType = "enemy"
		@colliderHitTypes.push "player"

		@root.add new THREE.Mesh enemyGeometry, enemyMaterial
		@root.position.copy(position)


	update: (delta)->
		super(delta)
		@root.position.x += -1 * delta
		@root.position.y += delta * Math.sin(@age)
		# super(delta)
		# if @age < 1
		# 	@root.position.x += -5 * delta
		# else if @age < 2
		# 	@root.position.y += -5 * delta
		# else if @age < 2.1
		# 	@root.position.x += 5 * delta
		# else
		# 	@die()

class Level extends GameObject
	constructor: ->
		super()
		
		@colliders = []

		@ambientLight = new THREE.AmbientLight(0xffffff);
		@root.add(@ambientLight);		

		@player1 = new Player()
		@add @player1

		# a@root.add modelLoader.load("assets/grid_cube.js")
		@lastEnemy = Date.now()

		$.getJSON "assets/level_1.json", @onLoad
			

	onLoad: (data)=>
		@data = data
		console.log @data
		for o in data.layers[0].objects 
			enemy = new Enemy(new THREE.Vector3(o.x / 32, 7 - o.y / 32, 0))
			enemy.active = false
			@add enemy

	update: (delta)->
		super(delta)
		world.camera.position.x += 1 * delta
		@player1.root.position.x += 1 * delta

		for child in @children
			if child.root.position.x < world.camera.position.x + 10
				child.activate()

		@collisions()

		# if Date.now() > @lastEnemy + 100
		# 	@lastEnemy = Date.now()
		# 	enemy = new Enemy(@root.position.clone().setX(15).setY(util.random(-10, 10)))
		# 	@add enemy
			

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
								a.collideWith b

	testCollision: (a, b)->
		return a.root.position.distanceToSquared(b.root.position) < 1


		

modelLoader = new core.ModelLoader()
input = new core.Input()

			
module.exports.Level = Level
module.exports.core = core
