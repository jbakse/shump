util = require '../util.coffee'

World = require './World.coffee'
GameObject = require './GameObject.coffee'
CollisionObject = require './CollisionObject.coffee'
Player = require './Player.coffee'
Enemies = require './Enemies.coffee'

Sound = require './Sound.coffee'
Score = require './Score.coffee'

Tiled = require './Tiled.coffee'

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



class HomeScreen extends GameObject
	texture = THREE.ImageUtils.loadTexture "assets/screens/title.png"
	material = new THREE.MeshBasicMaterial
			map: texture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	
	geometry = new THREE.PlaneGeometry( 20, 15)
	constructor: ()->
		super()
		@root.add new THREE.Mesh geometry, material

class GameOverScreen extends GameObject
	texture = THREE.ImageUtils.loadTexture "assets/screens/game_over.png"
	material = new THREE.MeshBasicMaterial
			map: texture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	
	geometry = new THREE.PlaneGeometry( 20, 15)
	constructor: ()->
		super()
		@root.add new THREE.Mesh geometry, material



class Game
	constructor: ()->
		#setup world
		@world = new World()
		@homeScreen = new HomeScreen()
		@gameOverScreen = new GameOverScreen()
		@loadLevel()
		@lives = 3

		Score.displayElement = $("""<h1>Score:</h1>""").appendTo $("#shump")
		@livesElement = $("""<h1>Lives:</h1>""").appendTo $("#shump")
		
		
		@state = "home"
		@world.scene.add @homeScreen.root


		$(window).keydown (e)=>
			if @state == "home"
				@world.scene.remove @homeScreen.root
				@state = "play"
				@startLevel()
				return

			if @state == "game_over"
				@world.scene.remove @gameOverScreen.root
				@world.scene.add @homeScreen.root
				@state = "home"
				return

		util.after 1, ()=>
			@world.start()

	loadLevel: ()->
		@world.camera.position.x = 0;
		@level = new Level(@world)
	
	startLevel: ()->
		@world.scene.add @level.root
		@world.on "update", @level.update
		
	resetPlayer: ()=>
		@lives--
		@livesElement.text "Lives: #{@lives}"

		if @lives > 0
			@level.player1 = new Player()
			@level.player1.root.position.x = @world.camera.position.x
			@level.add @level.player1
		else
			util.after 2000, @gameOver

	gameOver: ()=>
		console.log "game over"
		
		@world.scene.remove @level.root
		@world.off "update", @level.update

		@loadLevel()
		@world.scene.add @gameOverScreen.root
		@state = "game_over"


module.exports.game = game = new Game()

		

# modelLoader = new core.ModelLoader()


			


