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

module.exports.CollisionObject = CollisionObject



module.exports.resolveCollisions = (colliders)->
	for a in colliders
		if a.active
			for b in colliders
				if b.active
					if a.colliderHitTypes.indexOf(b.colliderType) > -1
						if @testCollision a, b
							a.collideInto b

module.exports.testCollision = (a, b)->
	return a.root.position.distanceToSquared(b.root.position) < a.collisionRadius + b.collisionRadius
