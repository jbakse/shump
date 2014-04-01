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


		
		@worldTexture = new THREE.WebGLRenderTarget w, h, 
			minFilter: THREE.LinearFilter
			magFilter: THREE.LinearFilter
			format: THREE.RGBFormat
		

		@processMaterial = new THREE.ShaderMaterial
			side: THREE.DoubleSide
			transparent: false
			uniforms: 
				"tDiffuse": { type: "t", value: @worldTexture }

			vertexShader:
				"""
				varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
				"""

			fragmentShader:
				"""
				uniform sampler2D tDiffuse;
				varying vec2 vUv;

				void main() {
					// read the input color

					vec4 o;

					o = texture2D( tDiffuse, vUv );
					o.r = texture2D( tDiffuse, vUv + vec2(0.0, 0.001) ).r;

					o.r *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;
					o.g *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;
					o.b *= sin(vUv.y * 240.0 * 6.28) * .25 + .75;

					o *= 0.5 + 1.0*16.0*vUv.x*vUv.y*(1.0-vUv.x)*(1.0-vUv.y);
					

					// set the output color
					gl_FragColor = o;
				}
				"""

		@processScene = new THREE.Scene()
		@processCamera = new THREE.OrthographicCamera(-.5, .5, -.5 , .5, 0, 1)
		@processCamera.position.z = 0
		@processScene.add @processCamera
		@processQuad = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), @processMaterial );
		@processQuad.rotation.x = Math.PI
		@processScene.add @processQuad




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

		@renderer.render( @scene, @camera, @worldTexture, true );


		@renderer.render @processScene, @processCamera

		@stats.update()
		requestAnimationFrame @animate
		return

	start: ->
		@animate()



module.exports = World
