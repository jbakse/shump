Score = require './Score.coffee'
Sound = require './Sound.coffee'
CollisionObject = require './CollisionObject.coffee'
Particle = require './Particle.coffee'
Weapons = require './Weapons.coffee'


class Basic extends CollisionObject
	enemyTexture = THREE.ImageUtils.loadTexture "assets/enemies/enemy.png"
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
		@hasFired = false

	update: (delta)->
		super(delta)
		@age += delta
		
	
	die: ()->
		Score.add(1)
		Sound.play('explosion')
		for i in [0..20]
			@parent.add new Particle(@root.position, 3)
		super()


class SinWave extends Basic
	update: (delta)->
		super(delta)		
		@root.position.x += -1 * delta
		@root.position.y += delta * Math.sin(@age)

class Dart extends Basic
	update: (delta)->
		super(delta)		
		if @age < .5
			@root.position.x += -20 * delta
		else if @age < 3
			@root.position.x += 5 * delta
		else
			@die()

		if @age > 1 and not @hasFired
			console.log "fire"
			@hasFired = true
			@fire_primary()


	fire_primary: ()->
	
		Sound.play('shoot')
		@lastFire = Date.now()
		bullet = new Weapons.EnemyBullet(@root.position)
		@parent.add bullet	


exports.Basic = Basic
exports.SinWave = SinWave
exports.Dart = Dart

# super(delta)
		# if @age < 1
		# 	@root.position.x += -5 * delta
		# else if @age < 2
		# 	@root.position.y += -5 * delta
		# else if @age < 2.1
		# 	@root.position.x += 5 * delta
		# else
		# 	@die()
