Enemies = require './Enemies.coffee'

exports.load = load = (url) ->
	return new Promise (resolve, reject) =>
		jqxhr = $.getJSON url, @onLoad

		jqxhr.done ()->
			level = new TiledMap(jqxhr.responseJSON)
			return resolve(level)

		jqxhr.fail ()->
			return reject Error("Status Error")


class TiledMap
	constructor: (@data)->
		@tileSets = []
		@tiles = []
		@layers = {}

		# create tileSets, load the textures
		for tileSetData in data.tilesets
			tileSet = new TileSet tileSetData
			@tileSets.push tileSet

		# create tiles @geometery and @material
		for tileSet in @tileSets
			id = tileSet.data.firstgid
			for row in [0..tileSet.rows-1]
				for col in [0..tileSet.cols-1]
					tile = new Tile tileSet, row, col
					@tiles[id] = tile
					id++


		# load layers
		for layerData in data.layers
			if layerData.type == "tilelayer"
				@layers[layerData.name] = new TileLayer(this, layerData)
			if layerData.type == "objectgroup"
				@layers[layerData.name] = new ObjectGroup(layerData)

		# # create tile objects that comprise backgrounds

		# data.layers

		# @farBackground = @loadTileLayer(data.layers[0])
		# @background = 


		# farBackground.position.y = 7.5 * 2
		# fov_radians = 45 * (Math.PI / 180)
		# targetZ = 480 / (2 * Math.tan(fov_radians / 2) ) / 32.0
		# farBackground.position.z = -targetZ
		# farBackground.scale.set(2, 2, 2)
		# console.log farBackground
		# @root.add farBackground
		
		# background = @loadTileLayer(data.layers[1])
		# background.position.y = 7.5
		# console.log background
		# @root.add background


		# # load objects
		# for o in data.layers[2].objects 
		# 	enemy = new Enemies[o.type](new THREE.Vector3(o.x / 32, 7 - o.y / 32, util.random(-1, 1)))
		# 	enemy.active = false
		# 	@add enemy


	loadTileLayer: (data)=>
		layer = new THREE.Object3D()
		for id, index in data.data
			if id > 0
				row = Math.floor(index / data.width)
				col = index % data.width
				tileObject = new TileObject(@tiles[id], new THREE.Vector3(col, -row - 1, 0) )
				layer.add tileObject.root	
		return layer

	


# represents a TileSet in a Tiled Editor level
class TileSet
	constructor: (@data)->
		@cols = @data.imagewidth / @data.tilewidth
		@rows = @data.imageheight / @data.tileheight
		@texture = THREE.ImageUtils.loadTexture "assets/#{@data.image}"
		@material = new THREE.MeshBasicMaterial
			map: @texture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			depthTest: true
			depthWrite: false
			transparent: true

# Represents the @geometry and @material of a tile loaded from a Tiled Editor level
class Tile
	constructor: (@tileSet, @row, @col)->
		# todo, probably be prettier to just make this from scratch
		@geometry = new THREE.PlaneGeometry( @tileSet.data.tilewidth / 32, @tileSet.data.tileheight / 32)
		
		# Reposition vertices to lower left at 0,0 
		for v in @geometry.vertices
			v.x += @tileSet.data.tilewidth / 32 / 2
			v.y += @tileSet.data.tileheight / 32 / 2
		@geometry.verticesNeedUpdate = true

		# calc and set uvs
		uvWidth = @tileSet.data.tilewidth/@tileSet.data.imagewidth
		uvHeight = @tileSet.data.tileheight/@tileSet.data.imageheight

		uvX = uvWidth * @col
		uvY = uvHeight * (@tileSet.rows - @row - 1)
		for face in @geometry.faceVertexUvs[0]
			for v in face
				if v.x == 0
					v.x = uvX
				else
					v.x = uvX + uvWidth # * (31.5/32.0) # todo dirty hack to prevent slight oversample on tile showing hint of next tile on edge.

				if v.y == 0
					v.y = uvY
				else
					v.y = uvY + uvHeight # * (31.5/32.0) # todo dirty hack to prevent slight oversample on tile showing hint of next tile on edge.					
		@geometry.uvsNeedUpdate = true

		@material = @tileSet.material

		

# Represents a TileLayer in the Tiled Editor file. 
class TileLayer
	constructor: (map, @data)->
		@root = new THREE.Object3D()
		for id, index in @data.data
			if id > 0
				row = Math.floor(index / data.width)
				col = index % data.width
				# console.log  "tile", map, map.tiles[id]
				tileObject = new TileObject(map.tiles[id], new THREE.Vector3(col, -row - 1, 0) )
				@root.add tileObject.mesh	
		

# Represents an instance of a tile to be rendered
class TileObject
	constructor: (tile, position)->
		@mesh = new THREE.Mesh tile.geometry, tile.material
		@mesh.position.copy(position)
	

class ObjectGroup
	constructor: (@data)->
		console.log @data
		@objects = []
		for objectData in @data.objects 
			enemy = new Enemies[objectData.type](new THREE.Vector3(objectData.x / 32, 7 - objectData.y / 32, 0))
			@objects.push enemy
