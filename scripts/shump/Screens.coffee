util = require '../util.coffee'
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

		@scene = new THREE.Scene()
		@scene.add @root
		
		@camera = new THREE.PerspectiveCamera(45, 640 / 480, 1, 10000)	
		@camera.position.z = util.layerSpacing() * 1
		@scene.add @camera

		screen = new THREE.Mesh geometry, material
		screen.scale.set(.25, .25, .25)
		screen.position.z =  util.layerSpacing() * .75
		@root.add screen 


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

		@scene = new THREE.Scene()
		@scene.add @root
		
		@camera = new THREE.PerspectiveCamera(45, 640 / 480, 1, 10000)	
		@camera.position.z = util.layerSpacing() * 1
		@scene.add @camera

		@root.add new THREE.Mesh geometry, material

exports.GameOverScreen = GameOverScreen
