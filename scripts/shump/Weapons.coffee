Score = require './Score.coffee'
CollisionObject = require './CollisionObject.coffee'
Particle = require './Particle.coffee'

class exports.Bullet extends CollisionObject
	bulletTexture = THREE.ImageUtils.loadTexture "assets/weapons/bullet.png"
	bulletMaterial = new THREE.MeshBasicMaterial
			map: bulletTexture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	
	bulletGeometry = new THREE.PlaneGeometry( 1, 1)

	constructor: (position)->
		super()
		
		@birth = Date.now()
		@timeToLive = 2000
		@root.add new THREE.Mesh bulletGeometry, bulletMaterial

		@root.position.copy(position)

		@colliderType = "bullet"
		@colliderHitTypes.push "enemy"
		@angle = 0
		@speed = 15

	update: (delta)->
		@root.position.x += Math.cos(@angle)*@speed*delta
		@root.position.y += Math.sin(@angle)*@speed*delta
		@root.rotation.z = @angle
		if Date.now() > @birth + @timeToLive
			@die()


	collideInto: (target)->
		super(target)
		Score.add(1)
		@die()
		for i in [0..5]
			@parent.add new Particle(@root.position, 1)


class exports.EnemyBullet extends CollisionObject
	bulletTexture = THREE.ImageUtils.loadTexture "assets/weapons/bullet_2.png"
	bulletMaterial = new THREE.MeshBasicMaterial
			map: bulletTexture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	
	bulletGeometry = new THREE.PlaneGeometry( 1, 1)
	
	constructor: (position)->
		super()
		
		@birth = Date.now()
		@timeToLive = 2000
		@root.add new THREE.Mesh bulletGeometry, bulletMaterial

		@root.position.copy(position)

		@colliderType = "bullet"
		@colliderHitTypes.push "enemy"
		@angle = 0
		@speed = 15

	update: (delta)->
		@root.position.x += Math.cos(@angle)*@speed*delta
		@root.position.y += Math.sin(@angle)*@speed*delta
		@root.rotation.z = @angle
		if Date.now() > @birth + @timeToLive
			@die()


	collideInto: (target)->
		super(target)
		Score.add(1)
		@die()
		for i in [0..5]
			@parent.add new Particle(@root.position, 1)
