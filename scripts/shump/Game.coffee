


Sound = require './Sound.coffee'
Score = require './Score.coffee'
Level = require './Level.coffee'

GameObject = require './GameObject.coffee'

Screens = require './Screens.coffee'

Base = require './Base.coffee'

class Game extends Base
	constructor: ()->
		super()

		# create renderer
		@renderer = new THREE.WebGLRenderer()
		@renderer.setSize 640, 480
		$("#shump")[0].appendChild @renderer.domElement

		# clock
		@clock = new THREE.Clock()

		# level
		@level = new Level.Level(@world)

		# initialize state
		@lives = 3

		# load assets

		# begin game
		util.after 1, ()=>
			@animate()

	update: (delta)=>
		@level.update(delta)

	render: ()=>
		@renderer.render @level.scene, @level.camera

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
