Sound = require './Sound.coffee'
CollisionObject = require './CollisionObject.coffee'
ModelLoader = require './ModelLoader.coffee'
Input = require './Input.coffee'
Weapons = require './Weapons.coffee'

modelLoader = new ModelLoader()
input = new Input()

class Player extends CollisionObject

	constructor: ()->
		super()
		
		
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
		if Date.now() > @lastFire + 240 * 1
			Sound.play('shoot')
			@lastFire = Date.now()
			bullet = new Weapons.Bullet(@root.position)
			@parent.add bullet
			# @parent.colliders.push bullet

	die: ()->
		# console.log "die"


module.exports = Player
