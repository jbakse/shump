
Sound = require './Sound.coffee'
Collisions = require './Collisions.coffee'
Particle = require './Particle.coffee'
Weapons = require './Weapons.coffee'


class Basic extends Collisions.CollisionObject

	enemyTexture = THREE.ImageUtils.loadTexture "assets/enemies/enemy.png"
	enemyMaterial: new THREE.MeshBasicMaterial
			map: enemyTexture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	enemyGeometry: new THREE.PlaneGeometry( 1, 1);

	constructor: (position)->
		super()
		@colliderType = "enemy"
		@colliderHitTypes.push "player"

		@root.add new THREE.Mesh @enemyGeometry, @enemyMaterial
		@root.position.copy(position)
		@age = 0
		@hasFired = false

		@active = false

	update: (delta)->
		super(delta)
		@age += delta
		
	
	die: ()->
		Sound.play('explosion')
		for i in [0..20]
			@parent.add new Particle(@root.position, 3)
		super()


class Boss extends Basic
	enemyTexture = THREE.ImageUtils.loadTexture "assets/enemies/boss.png"
	enemyMaterial: new THREE.MeshBasicMaterial
			map: enemyTexture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	enemyGeometry: new THREE.PlaneGeometry( 4, 6);

	constructor: (position)->
		super(position)
		@hp = 20
		@lastFire = Date.now()

	update: (delta)->
		super(delta)

		if @age < 2
			@root.position.x -= 1 * delta
		if @age > 2
			@root.position.x += 1 * delta
			@root.position.y += delta * Math.sin(@age)

		if @age % 4 > 1
				@fire_primary()
		
	fire_primary: ()->
		if Date.now() > @lastFire + 250
			Sound.play('shoot')
			@lastFire = Date.now()
			
			pos = @root.position.clone()
			pos.y -= 1.8
			pos.x -= 1.6
			bullet = new Weapons.EnemyBullet(pos)
			bullet.colliderType = "enemy_bullet"
			bullet.colliderHitTypes = ["player"]
			bullet.angle = Math.PI
			bullet.speed = 7
			@parent.add bullet


			pos = @root.position.clone()
			pos.y += 1.8
			pos.x -= 1.6
			bullet = new Weapons.EnemyBullet(pos)
			bullet.colliderType = "enemy_bullet"
			bullet.colliderHitTypes = ["player"]
			bullet.angle = Math.PI
			bullet.speed = 7
			@parent.add bullet	

	die: ()->
		Sound.play('explosion')
		for i in [0..200]
			@parent.add new Particle(@root.position, 10)

		for i in [0..100]
			@parent.add new Particle(@root.position, 5)

		super()


exports.Boss = Boss



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
			@hasFired = true
			@fire_primary()


	fire_primary: ()->
	
		Sound.play('shoot')
		@lastFire = Date.now()
		bullet = new Weapons.EnemyBullet(@root.position)

		bullet.colliderType = "enemy_bullet"
		bullet.colliderHitTypes = ["player"]
		bullet.angle = Math.PI - .25
		bullet.speed = 5

		@parent.add bullet	

		bullet = new Weapons.EnemyBullet(@root.position)

		bullet.colliderType = "enemy_bullet"
		bullet.colliderHitTypes = ["player"]
		bullet.angle = Math.PI + .25
		bullet.speed = 5

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
