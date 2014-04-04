GameObject = require './GameObject.coffee'

class CollisionObject extends GameObject
	constructor: ()->
		super()
		@colliderType = undefined
		@colliderHitTypes = []
		@hp = 1
		@dp = 1
		@collisionRadius = .6

	collideInto: (target)->
		target.takeDamage(@dp)
		# @die()
		# gameObject.die()

	takeDamage: (damage)->
		@hp -= damage
		if @hp <= 0 
			@die()

module.exports = CollisionObject
