Base = require './Base.coffee'


class World extends Base
	
	constructor: ->
		super()

		w = 640
		h = 480
		@camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000)
		fov_radians = 45 * (Math.PI / 180)

		targetZ = 480 / (2 * Math.tan(fov_radians / 2) ) / 32.0;

		@camera.position.z = targetZ
		
		@scene = new THREE.Scene()
		
		@renderer = new THREE.WebGLRenderer()
		@renderer.setSize w, h
		# @renderer.sortObjects = false
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



module.exports = World
