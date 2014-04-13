util = require '../util.coffee'
Base = require './Base.coffee'
Level = require './Level.coffee'
Screens = require './Screens.coffee'



# Score = require './Score.coffee'

# GameObject = require './GameObject.coffee'



class Game extends Base
	constructor: ()->
		super()
		
		# initialize state
		@lives = 3

		# create renderer
		@renderer = new THREE.WebGLRenderer()
		@renderer.setSize 640, 480
		$("#shump")[0].appendChild @renderer.domElement

		# clock
		@clock = new THREE.Clock()

		

		# other screens
		@state = "home"
		@homeScreen = new Screens.HomeScreen()
		@gameOverScreen = new Screens.GameOverScreen()

		# todo, clean this up let screens handle their input and send messages when they are done. maybe through a global event broadcaster
		$(window).keydown (e)=>
			if @state == "home"
				@state = "loading"
				@startGame()
				return

			if @state == "game_over"
				@state = "home"
				return

		# load assets

		# begin game
		util.after 1, ()=>
			@animate()


	startGame: ()->
		@lives = 3

		# level
		@level = new Level.Level()
		@level.on "playerDie", ()=>
			@lives--
			if @lives > 0
				util.after 1000, @level.insertPlayer
			else
				@state = "game_over"

		@level.on "ready", ()=>
			@state = "play"

	update: (delta)=>
		if @state == "home"
			@homeScreen.update(delta)

		if @state == "play"
			@level.update(delta)

		if @state == "game_over"
			@level.update(delta)
			@gameOverScreen.update(delta)


	render: ()=>
		@renderer.autoClear = false

		if @state == "home"
			@renderer.render @homeScreen.scene, @homeScreen.camera
		
		if @state == "play"	
			@renderer.render @level.scene, @level.camera
			@renderer.render @homeScreen.scene, @level.camera, undefined, false

		if @state == "game_over"
			@renderer.render @level.scene, @level.camera
			@renderer.render @gameOverScreen.scene, @gameOverScreen.camera, undefined, false



	animate: =>
		# update the game physics
		delta = @clock.getDelta()
		if (delta < .5) 
			@update(delta)

		# render to screen
		@render()

		# repeat
		requestAnimationFrame @animate
		return


exports.Game = Game






# @homeScreen = new Screens.HomeScreen()
# @gameOverScreen = new Screens.GameOverScreen()
# @loadLevel()

# Score.displayElement = $("""<h1>Score:</h1>""").appendTo $("#shump")
# @livesElement = $("""<h1>Lives:</h1>""").appendTo $("#shump")


# @state = "home"
# # @world.scene.add @homeScreen.root


# $(window).keydown (e)=>
# 	if @state == "home"
# 		# @world.scene.remove @homeScreen.root
# 		@state = "play"
# 		@startLevel()
# 		return

# 	if @state == "game_over"
# 		@world.scene.remove @gameOverScreen.root
# 		@world.scene.add @homeScreen.root
# 		@state = "home"
# 		return


	# loadLevel: ()->
	# 	# @world.camera.position.x = 0;
	# 	@level = new Level.Level(@world)
	
	# startLevel: ()->
	# 	@world.scene.add @level.root
	# 	@world.on "update", @level.update
		
	# resetPlayer: ()=>
	# 	@lives--
	# 	@livesElement.text "Lives: #{@lives}"

	# 	if @lives > 0
	# 		@level.player1 = new Player()
	# 		@level.player1.root.position.x = @world.camera.position.x
	# 		@level.add @level.player1
	# 	else
	# 		util.after 2000, @gameOver

	# gameOver: ()=>
	# 	console.log "game over"
		
	# 	@world.scene.remove @level.root
	# 	@world.off "update", @level.update

	# 	@loadLevel()
	# 	@world.scene.add @gameOverScreen.root
	# 	@state = "game_over"
