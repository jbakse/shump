util = require '../util.coffee'

World = require './World.coffee'
GameObject = require './GameObject.coffee'
CollisionObject = require './CollisionObject.coffee'
Player = require './Player.coffee'
Enemies = require './Enemies.coffee'

Sound = require './Sound.coffee'
Score = require './Score.coffee'

class Tile
	constructor: (@tileSet, @row, @col)->
		@geometry = new THREE.PlaneGeometry( @tileSet.tileWidth / 32, @tileSet.tileHeight / 32)
		for v in @geometry.vertices
			v.x += @tileSet.tileWidth / 32 / 2
			v.y += @tileSet.tileHeight / 32 / 2
		@geometry.verticesNeedUpdate = true

		# calc and set uvs
		uvWidth = @tileSet.tileWidth/@tileSet.imageWidth
		uvHeight = @tileSet.tileHeight/@tileSet.imageHeight
		uvX = uvWidth * @col
		uvY = uvHeight * (@tileSet.rows - @row - 1)
		for face in @geometry.faceVertexUvs[0]
			for v in face
				v.x = v.x * uvWidth + uvX
				v.y = v.y * uvHeight + uvY
		@geometry.uvsNeedUpdate = true

		@material = @tileSet.material


class TileSet
	constructor: (@textureFile, @imageWidth, @imageHeight, @tileWidth, @tileHeight)->
		@cols = @imageWidth / @tileWidth
		@rows = @imageHeight / @tileWidth

		@texture = THREE.ImageUtils.loadTexture textureFile
		@material = new THREE.MeshBasicMaterial
			map: @texture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			depthTest: true
			depthWrite: false
			transparent: true
		
		

		# @geometry = new THREE.PlaneGeometry( width, height);



class TileObject
	constructor: (@tile, position)->
		#todo remove unneded object3d null wrapper
		@root = new THREE.Object3D()
		@root.add new THREE.Mesh tile.geometry, tile.material
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
		# console.log @data
		@tileSets = []
		@tiles = []

		# load the tileSet metadata, texture, and create tile geometries
		for tileSetData in data.tilesets
			tileSet = new TileSet "assets/"+tileSetData.image, 
				tileSetData.imagewidth, 
				tileSetData.imageheight,
				tileSetData.tilewidth,
				tileSetData.tileheight

			@tileSets.push tileSet

			id = tileSetData.firstgid
			for row in [0..tileSet.rows-1]
				for col in [0..tileSet.cols-1]
					tile = new Tile tileSet, row, col
					@tiles[id] = tile
					id++



		fov_radians = 45 * (Math.PI / 180)
		targetZ = 480 / (2 * Math.tan(fov_radians / 2) ) / 32.0;
		

		# create tile objects that comprise backgrounds
		layer = data.layers[0]
		farBackground = new THREE.Object3D()

		for id, index in layer.data
			if id > 0
				row = Math.floor(index / layer.width)

				col = index % layer.width
				tileObject = new TileObject(@tiles[id], new THREE.Vector3(col, -row - 1, 0) )
				
				
				farBackground.add tileObject.root	

		@root.add farBackground
		farBackground.position.y = 7.5 * 2
		farBackground.position.z = -targetZ
		
		farBackground.scale.set(2, 2, 2)


		layer = data.layers[1]
		background = new THREE.Object3D()

		for id, index in layer.data
			if id > 0
				row = Math.floor(index / layer.width)
				col = index % layer.width
				tileObject = new TileObject(@tiles[id], new THREE.Vector3(col, -row - 1, 0))
				background.add tileObject.root

		background.position.y = 7.5
		
		@root.add background


		# load objects
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
		
		Score.displayElement = $("""<h1>""").appendTo $("#shump")
		@loadLevel()

		util.after 1000, ()=>
			@world.start()
	
	loadLevel: ()->
		@world.camera.position.x = 0;
		@level = new Level(@world)
		@world.scene.add @level.root
		@world.on "update", @level.update
		
	reset: ()=>
		console.log "reset level"
		
		@world.scene.remove @level.root
		@world.off "update", @level.update

		@loadLevel()


module.exports.game = game = new Game()

		

# modelLoader = new core.ModelLoader()


			


