util = require '../util.coffee'
Base = require './Base.coffee'
Level = require './Level.coffee'
Screens = require './Screens.coffee'
Score = require './Score.coffee'
PostEffects = require './PostEffects.coffee'

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

		# todo nearest better?
		@worldTexture = new THREE.WebGLRenderTarget 640, 480, 
			minFilter: THREE.LinearFilter 
			magFilter: THREE.LinearFilter
			format: THREE.RGBFormat

		# screenEffect 
		@screenEffect = new PostEffects.ScreenEffect()
		@screenEffect.processMaterial.uniforms.tDiffuse.value = @worldTexture
		# console.log "mat", @screenEffect.processMaterial

		# clock
		@clock = new THREE.Clock()

		# create stats
		@stats = new Stats();
		@stats.domElement.style.position = 'absolute'
		@stats.domElement.style.top = '0px'
		$("#shump")[0].appendChild( @stats.domElement )
		
		# hud
		Score.displayElement = $("""<h1>Score:</h1>""").appendTo $("#shump")
		@livesElement = $("""<h1>Lives:</h1>""").appendTo $("#shump")

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
		@livesElement.text "Lives: #{@lives}"

		Score.set 0

		# level
		@level = new Level.Level()
		@level.on "playerDie", ()=>
			@lives--
			@livesElement.text "Lives: #{@lives}"

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
			@renderer.render @homeScreen.scene, @homeScreen.camera, @worldTexture, true
		
		if @state == "play"	
			@renderer.render @level.scene, @level.camera, @worldTexture, true
			@renderer.render @homeScreen.scene, @level.camera, @worldTexture, false

		if @state == "game_over"
			@renderer.render @level.scene, @level.camera, @worldTexture, true
			@renderer.render @gameOverScreen.scene, @gameOverScreen.camera, @worldTexture, false
			
		@renderer.render @screenEffect.scene, @screenEffect.camera


	animate: =>
		# update the game physics
		delta = @clock.getDelta()
		if (delta < .5) 
			@update(delta)

		# render to screen
		@render()

		# update fps overlay
		@stats.update()

		# repeat
		requestAnimationFrame @animate
		return


exports.Game = Game
