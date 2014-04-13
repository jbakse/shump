Base = require './Base.coffee'

Input = require './Input.coffee'

class World extends Base
	
	constructor: ->
		super()

		w = 640
		h = 480
		
		@renderer = new THREE.WebGLRenderer()
		@renderer.setSize w, h
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
					vec4 c;
					c = texture2D( tDiffuse, vUv );
					//o = texture2D( tDiffuse, vUv );

					//misalign rgb
					o.r = texture2D( tDiffuse, vUv + vec2(0.0, -0.001) ).r;
					o.g = texture2D( tDiffuse, vUv + vec2(0.0, 0.001) ).r;
					o.b = texture2D( tDiffuse, vUv + vec2(0.0, 0.003) ).r;

					//scanlines
					o.r *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;
					o.g *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;
					o.b *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;

					o *= 0.5 + 1.0*16.0*vUv.x*vUv.y*(1.0-vUv.x)*(1.0-vUv.y);
					

					// set the output color
					gl_FragColor = o * .5 + c * .5;
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

		@renderer.autoClear = false
		@renderer.render( @scene, @camera, @worldTexture, true );


		@renderer.render @processScene, @processCamera

		@stats.update()
		requestAnimationFrame @animate
		return

	start: ->
		@animate()



module.exports = World
