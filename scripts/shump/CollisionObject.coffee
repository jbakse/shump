GameObject = require './GameObject.coffee'

class CollisionObject extends GameObject
	constructor: ()->
		super()
		@colliderType = undefined
		@colliderHitTypes = []

	collideWith: (gameObject)->
		@die()
		gameObject.die()


module.exports = CollisionObject
