util = require '../util.coffee'

World = require './World.coffee'
Sound = require './Sound.coffee'
Score = require './Score.coffee'
Level = require './Level.coffee'

GameObject = require './GameObject.coffee'

Screens = require './Screens.coffee'


class Game
	constructor: ()->
		#setup world
		@world = new World()
		@homeScreen = new Screens.HomeScreen()
		@gameOverScreen = new Screens.GameOverScreen()
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
		@level = new Level.Level(@world)
	
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


exports.Game = Game
