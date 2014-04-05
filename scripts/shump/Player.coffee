util = require '../util.coffee'

Sound = require './Sound.coffee'
CollisionObject = require './CollisionObject.coffee'
ModelLoader = require './ModelLoader.coffee'
Input = require './Input.coffee'
Weapons = require './Weapons.coffee'
Particle = require './Particle.coffee'
Shump = require './shump.coffee'

modelLoader = new ModelLoader()
# input = new Input()

class Player extends CollisionObject

	constructor: ()->
		super()
		
		
		@colliderType = "player"
		@colliderHitTypes.push "enemy_bullet"

		model = modelLoader.load("assets/ships/ship2.js")
		@root.add model
		util.after 1000, ()->
			model.material.materials[0].wireframe = true
		
		@lastFire = Date.now()
		@hp = 3


	update: (delta)=>
		if Input.keyStates['up']
			@root.position.y += 10 * delta;
		if Input.keyStates['down']
			@root.position.y -= 10 * delta;
		if Input.keyStates['left']
			@root.position.x -= 10 * delta;
		if Input.keyStates['right']
			@root.position.x += 10 * delta;
		if Input.keyStates['fire_primary']
			@fire_primary()

	fire_primary: ()->
		if Date.now() > @lastFire + 240 * 1
			Sound.play('shoot')
			@lastFire = Date.now()
			
			bullet = new Weapons.Bullet(@root.position)
			@parent.add bullet

			bullet = new Weapons.Bullet(@root.position)
			bullet.angle = -.25
			@parent.add bullet

			bullet = new Weapons.Bullet(@root.position)
			bullet.angle = +.25
			@parent.add bullet
			# @parent.colliders.push bullet

	die: ()->
		# console.log "die"
		
		Sound.play('explosion')
		for i in [0..200]
			@parent.add new Particle(@root.position, 8)

		pos = @root.position
		parent = @parent
		util.after 1000, ()->
			bullet = new Weapons.Bullet(pos)
			bullet.hp = 100
			bullet.dp = 10
			bullet.collisionRadius = 150
			parent.add bullet

		util.after 1250, Shump.game.resetPlayer
		super()



module.exports = Player
