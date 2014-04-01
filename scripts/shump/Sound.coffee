window.AudioContext = window.AudioContext||window.webkitAudioContext;
audioContext = new AudioContext();

class Sound
	constructor: (@name, @url, @buffer)->
exports.Sound = Sound

exports.loadedSounds = loadedSounds = {}


exports.load = load = (name, url) ->
	return new Promise (resolve, reject) =>
		request = new XMLHttpRequest()
		request.open('GET', url)
		request.responseType = 'arraybuffer';
		request.onload = (a, b, c)=>
			if request.status == 200
				audioContext.decodeAudioData request.response, 
					(buffer)=>
						#todo handle decoding error
						sound = new Sound(name, url, buffer)
						exports.loadedSounds[name] = sound
						return resolve(sound)
					,(err)=>
						reject Error("Decoding Error")
			else
				console.log  "Status"
				reject Error("Status Error")

				
		request.onerror = ()->
			console.log "errr"
			reject Error("Network Error") 	

		request.send()
			

exports.play = play = (arg)->
	if typeof arg == 'string'
		buffer = loadedSounds[arg].buffer
	else 
		buffer = arg
	if buffer?
		source = audioContext.createBufferSource()
		source.buffer = buffer
		source.connect(audioContext.destination)
		source.start(0)


assetsLoading = []
assetsLoading.push load('shoot', 'assets/sounds/shoot.wav')
assetsLoading.push load('explosion', 'assets/sounds/explosion.wav')

Promise.all(assetsLoading)
.then (results)->
	console.log "Loaded all Sounds!", results
.catch (err)->
	console.log "uhoh", err

