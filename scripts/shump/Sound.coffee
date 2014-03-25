window.AudioContext = window.AudioContext||window.webkitAudioContext;

audioContext = new AudioContext();




exports.sounds = sounds = {}


exports.loadSound = loadSound = (name, url)->
	request = new XMLHttpRequest()
	request.open('GET', url, true)
	request.responseType = 'arraybuffer';
	request.onload = ()->
		audioContext.decodeAudioData request.response, (buffer)->
			exports.sounds[name] = buffer
	request.send()

exports.play = play = (arg)->
	if typeof arg == 'string'
		buffer = sounds[arg]
	else 
		buffer = arg
	if buffer?
		source = audioContext.createBufferSource()
		source.buffer = buffer
		source.connect(audioContext.destination)
		source.start(0)


loadSound('shoot', 'assets/sounds/shoot.wav')
loadSound('explosion', 'assets/sounds/explosion.wav')
