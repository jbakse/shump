GameObject = require './GameObject.coffee'

class HomeScreen extends GameObject
	texture = THREE.ImageUtils.loadTexture "assets/screens/title.png"
	material = new THREE.MeshBasicMaterial
			map: texture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	
	geometry = new THREE.PlaneGeometry( 20, 15)
	constructor: ()->
		super()
		@root.add new THREE.Mesh geometry, material

exports.HomeScreen = HomeScreen

class GameOverScreen extends GameObject
	texture = THREE.ImageUtils.loadTexture "assets/screens/game_over.png"
	material = new THREE.MeshBasicMaterial
			map: texture
			side: THREE.DoubleSide
			shading: THREE.NoShading
			transparent: true
	
	geometry = new THREE.PlaneGeometry( 20, 15)
	constructor: ()->
		super()
		@root.add new THREE.Mesh geometry, material

exports.GameOverScreen = GameOverScreen
