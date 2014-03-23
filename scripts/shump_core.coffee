class Base
	constructor: ()->
		@_events = {}

	on: (event, handler) ->
		(@_events[event] ?= []).push handler
		this

	off: (event, handler) ->
		for suspect, index in @_events[event] when suspect is handler
			@_events[event].splice index, 1
		this

	trigger: (event, args...) =>
		return this unless @_events[event]?
		for i in [@_events[event].length-1..0] by -1
			handler = @_events[event][i]
			handler.apply this, args

		this


class World extends Base
	
	constructor: ->
		super()

		w = 640
		h = 480
		@camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000)
		fov_radians = 45 * (Math.PI / 180)

		targetZ = 480 / (2 * Math.tan(fov_radians / 2) ) / 32.0;

		console.log targetZ
		@camera.position.z = targetZ
		
		@scene = new THREE.Scene()
		
		@renderer = new THREE.CanvasRenderer()
		@renderer.setSize w, h
		$("#shump")[0].appendChild @renderer.domElement

		@clock = new THREE.Clock()
		@stats = new Stats();
		@stats.domElement.style.position = 'absolute'
		@stats.domElement.style.top = '0px'
		$("#shump")[0].appendChild( @stats.domElement )

		return this

	animate: =>
		delta = @clock.getDelta()		
		#don't update after long frame (fixes issue with switching tabs)
		if (delta < .5) 
			@trigger "update", delta

		@renderer.render @scene, @camera
		@stats.update()
		requestAnimationFrame @animate
		return

	start: ->
		@animate()


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
			map: THREE.ImageUtils.loadTexture "assets/white.png"

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

class Input
	keyMap: 
		"38":"up"
		"87":"up" #w
		"40":"down"
		"83":"down" #s
		"37":"left"
		"65":"left" #a
		"39":"right"
		"68":"right" #d
		"32":"fire_primary" #space

	constructor: ->
		@keyStates = []

		for key, value of @keyMap
			@keyStates[value] = false;

		$(window).keydown (e)=>
			if @keyMap[e.which]
				@keyStates[@keyMap[e.which]] = true;
			e.stopPropagation()

		$(window).keyup (e)=>
			if @keyMap[e.which]
				@keyStates[@keyMap[e.which]] = false;
			e.stopPropagation()

module.exports.Base = Base
module.exports.World = World
module.exports.Model = Model
module.exports.ModelLoader = ModelLoader
module.exports.Input = Input
