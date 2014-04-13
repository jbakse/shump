Base = require './Base.coffee'

class GameObject extends Base
	constructor: ->
		super()

		@parent = undefined
		@children = []
		@root = new THREE.Object3D()
		@dead = false
		@active = true

	update: (delta)=>
		for i in [@children.length-1..0] by -1
			child = @children[i]
			if child.dead
				@remove child
				continue
			if child.active
				child.update delta 
	
	activate: ()->
		@active = true;
		

	add: (gameObject)->
		gameObject.parent = this
		@children.push(gameObject)
		@root.add(gameObject.root)
		return gameObject

	remove: (gameObject)->
		@root.remove(gameObject.root)
		gameObject.parent = null
		i =  @children.indexOf(gameObject)
		if i >= 0
			@children.splice(i, 1);
		return gameObject

	die: ()->
		@dead = true;
		@trigger "die"

module.exports = GameObject
