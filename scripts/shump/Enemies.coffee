CollisionObject = require './CollisionObject.coffee'
Particle = require './Particle.coffee'

class Basic extends CollisionObject
	enemyTexture = THREE.ImageUtils.loadTexture "assets/enemy.png"
	enemyMaterial = new THREE.MeshBasicMaterial
			map: enemyTexture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	enemyGeometry = new THREE.PlaneGeometry( 1, 1);

	constructor: (position)->
		super()
		@colliderType = "enemy"
		@colliderHitTypes.push "player"

		@root.add new THREE.Mesh enemyGeometry, enemyMaterial
		@root.position.copy(position)
		@age = 0

	update: (delta)->
		super(delta)
		@age += delta
		
	
	die: ()->
		for i in [0..20]
			@parent.add new Particle(@root.position, 3)
		super()


class SinWave extends Basic
	update: (delta)->
		super(delta)		
		@root.position.x += -1 * delta
		@root.position.y += delta * Math.sin(@age)

exports.Basic = Basic
exports.SinWave = SinWave


# super(delta)
		# if @age < 1
		# 	@root.position.x += -5 * delta
		# else if @age < 2
		# 	@root.position.y += -5 * delta
		# else if @age < 2.1
		# 	@root.position.x += 5 * delta
		# else
		# 	@die()
