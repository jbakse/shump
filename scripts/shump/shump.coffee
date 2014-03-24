util = require '../util.coffee'

World = require './World.coffee'
GameObject = require './GameObject.coffee'
CollisionObject = require './CollisionObject.coffee'
Player = require './Player.coffee'
Enemies = require './Enemies.coffee'

Sound = require './Sound.coffee'
Score = require './Score.coffee'


class TileAsset
	constructor: (textureFile, width, height)->
		@texture = THREE.ImageUtils.loadTexture textureFile
		@material = new THREE.MeshBasicMaterial
			map: @texture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			depthTest: true
			depthWrite: false
			# opacity: .9
			transparent: true
			# color: 0xff0000
				
		console.log "mat", @material
		@geometry = new THREE.PlaneGeometry( width, height);

class Tile extends GameObject
	constructor: (position, tileAsset)->
		super()
		@root.add new THREE.Mesh tileAsset.geometry, tileAsset.material
		@root.position.copy(position)

	update: ->

class Level extends GameObject
	constructor: (@world)->
		super()
		
		@colliders = []

		@ambientLight = new THREE.AmbientLight(0xffffff);
		@root.add(@ambientLight);		

		@player1 = new Player()
		@add @player1

	

		$.getJSON "assets/level_1.json", @onLoad
			

	onLoad: (data)=>
		@data = data
		console.log @data
		@tiles = []
		for tileset in data.tilesets
			@tiles[tileset.firstgid] = new TileAsset("assets/"+tileset.image, tileset.tileheight/32, tileset.tilewidth/32)

		fov_radians = 45 * (Math.PI / 180)
		targetZ = 480 / (2 * Math.tan(fov_radians / 2) ) / 32.0;
		for d, i in data.layers[0].data
			if d > 0
				row = Math.floor(i / data.layers[0].width)
				col = i % data.layers[0].width
				tile = new Tile(new THREE.Vector3(col, 14.5 - row, -targetZ), @tiles[d])
				tile.root.position.x *= 2;
				tile.root.position.y *= 2;

				tile.root.scale.set(2, 2, 2);
				@add tile

		for d, i in data.layers[1].data
			if d > 0
				row = Math.floor(i / data.layers[0].width)
				col = i % data.layers[0].width
				tile = new Tile(new THREE.Vector3(col, 14.5 - row, 0), @tiles[d])
				@add tile

		for o in data.layers[2].objects 
			enemy = new Enemies[o.type](new THREE.Vector3(o.x / 32, 7 - o.y / 32, util.random(-1, 1)))

			enemy.active = false
			@add enemy

	update: (delta)->
		super(delta)
		@world.camera.position.x += 1 * delta
		@player1.root.position.x += 1 * delta

		for child in @children
			if child.active == false and child.root.position.x < @world.camera.position.x + 10
				child.activate()

		@collisions()

	
			

	add: (gameObject)->
		if gameObject instanceof CollisionObject
			@colliders.push gameObject 
		return super(gameObject)

	remove: (gameObject)->
		i =  @colliders.indexOf(gameObject)
		if i >= 0
			@colliders.splice(i, 1);

		return super(gameObject)




	collisions: ()->
		for a in @colliders
			if a.active
				for b in @colliders
					if b.active
						if a.colliderHitTypes.indexOf(b.colliderType) > -1
							if @testCollision a, b
								a.collideWith b

	testCollision: (a, b)->
		return a.root.position.distanceToSquared(b.root.position) < 1





class Game
	constructor: ()->
		#setup world
		@world = new World()
		@level = new Level(@world)

		@world.scene.add @level.root
		@world.on "update", @level.update
		Score.displayElement = $("""<h1>Hi</h1>""").appendTo $("#shump")
		util.after 1000, ()=>
			@world.start()

		


module.exports.Game = Game	

		

# modelLoader = new core.ModelLoader()


			


