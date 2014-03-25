Base = require './Base.coffee'

class Model extends Base
	constructor: (@geometry, @material)->
		super()
		@material = undefined
		@geometry = undefined
		@texture = undefined
		@status = undefined

	load: (fileName)=>
		jsonLoader = new THREE.JSONLoader();
		jsonLoader.load fileName, (geometry, materials, others...)=>
			@material = new THREE.MeshFaceMaterial( materials )
			# @material = materials[0]
			@geometry = geometry
			@status = "ready"
			@trigger "success", this

	loadPng: (fileName)=>
		@texture = THREE.ImageUtils.loadTexture fileName, {}, ()=>
			@material = new THREE.MeshBasicMaterial
				# transparent: true
				# blending: THREE.AdditiveBlending
				map: @texture
				# side: THREE.DoubleSide
			@geometry = new THREE.PlaneGeometry 1, 1
			@status = "ready"
			console.log "loadpng", this
			@trigger "success", this

class ModelLoader
	
	constructor: ()->
		@defaultGeometry = new THREE.CubeGeometry(1,1,1)
		@defaultMaterial = new THREE.MeshBasicMaterial
			color: 0x00ff00
			wireframe: true
			map: THREE.ImageUtils.loadTexture "assets/util/white.png"

		@loadedModels = {}

	load: (fileName)->

		# if already loaded, just make the new mesh and return
		if @loadedModels[fileName]? && @loadedModels[fileName].status == "ready"
			console.log "cached"
			return new THREE.Mesh(@loadedModels[fileName].geometry, @loadedModels[fileName].material)


		# if requested but not ready
		if @loadedModels[fileName]
			model = @loadedModels[fileName]
		
		# if not requested before
		else
			model = new Model()
			if fileName.split('.').pop() == "js"
				model.load(fileName)
			else
				model.loadPng(fileName)
			@loadedModels[fileName] = model

		object = new THREE.Mesh( @defaultGeometry, @defaultMaterial )
		model.on "success", (m)->
			object.geometry = m.geometry			
			object.material = m.material
			m.off "success", arguments.callee #remove this handler once used
		return object

module.exports = ModelLoader
