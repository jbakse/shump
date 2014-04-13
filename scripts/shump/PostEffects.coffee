class exports.ScreenEffect
	constructor: ()->
		@scene = new THREE.Scene()
		@camera = new THREE.OrthographicCamera(-.5, .5, -.5 , .5, 0, 1)
		@camera.position.z = 0
		@scene.add @camera
		

		@processMaterial = new THREE.ShaderMaterial
			side: THREE.DoubleSide
			transparent: false
			uniforms: 
				"tDiffuse": { type: "t", value: undefined }

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
					o.g = texture2D( tDiffuse, vUv + vec2(0.0, 0.001) ).g;
					o.b = texture2D( tDiffuse, vUv + vec2(0.0, 0.003) ).b;

					//scanlines
					o.r *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;
					o.g *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;
					o.b *= sin(vUv.y * 240.0 * 6.28) * .25 + 1.0;

					o *= 0.5 + 1.0*16.0*vUv.x*vUv.y*(1.0-vUv.x)*(1.0-vUv.y);
					

					// set the output color
					gl_FragColor = o * .5 + c * .5;
				}
				"""

		@quad = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), @processMaterial );
		@quad.rotation.x = Math.PI
		@scene.add @quad
