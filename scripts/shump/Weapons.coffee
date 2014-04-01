CollisionObject = require './CollisionObject.coffee'

class exports.Bullet extends CollisionObject
	bulletTexture = THREE.ImageUtils.loadTexture "assets/weapons/bullet.png"
	bulletMaterial = new THREE.MeshBasicMaterial
			map: bulletTexture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	
	bulletGeometry = new THREE.PlaneGeometry( 1, 1);

	constructor: (position)->
		super()
		@colliderType = "bullet"
		@colliderHitTypes.push "enemy"
		
		@birth = Date.now()
		@timeToLive = 1000
		@root.add new THREE.Mesh bulletGeometry, bulletMaterial

		@root.position.copy(position)

	update: ()->
		@root.position.x += .25
		if Date.now() > @birth + @timeToLive
			@die()


class exports.EnemyBullet extends CollisionObject
	bulletTexture = THREE.ImageUtils.loadTexture "assets/weapons/bullet.png"
	bulletMaterial = new THREE.MeshBasicMaterial
			map: bulletTexture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	
	bulletGeometry = new THREE.PlaneGeometry( 1, 1);

	constructor: (position)->
		super()
		@colliderType = "enemy_bullet"
		@colliderHitTypes.push "player"
		
		@birth = Date.now()
		@timeToLive = 1000
		@root.add new THREE.Mesh bulletGeometry, bulletMaterial

		@root.position.copy(position)

	update: ()->
		@root.position.x -= .15
		if Date.now() > @birth + @timeToLive
			@die()
