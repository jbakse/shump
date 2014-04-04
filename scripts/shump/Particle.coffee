GameObject = require './GameObject.coffee'
util = require '../util.coffee'

class Particle extends GameObject
	particleTexture = THREE.ImageUtils.loadTexture "assets/particles/particle2.png"
	particleMaterial = new THREE.MeshBasicMaterial
			map: particleTexture
			shading: THREE.NoShading
			depthWrite: false
			transparent: true
			blending: THREE.AdditiveBlending

	particleGeometry = new THREE.PlaneGeometry( 1, 1);

	constructor: (position, energy)->
		super()
		
		@birth = Date.now()
		@timeToLive = 1000
		@root.add new THREE.Mesh particleGeometry, particleMaterial
		
		@velocity = new THREE.Vector3(util.random(-1, 1), util.random(-1, 1), util.random(-1, 1));
		@velocity.normalize().multiplyScalar(energy)
		@root.position.copy(position)

	update: (delta)->
		@velocity.multiplyScalar(.99)
		@root.position.x += @velocity.x * delta
		@root.position.y += @velocity.y * delta
		@root.position.z += @velocity.z * delta
		s = 1- ((Date.now() - @birth) / @timeToLive) + .01
		@root.scale.set(s, s, s)
		if Date.now() > @birth + @timeToLive
			@die()

module.exports = Particle
