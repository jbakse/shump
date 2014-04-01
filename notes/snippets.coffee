
# subclassing example

# class MySuper
# 	a: "a"
# 	b: "b"
# 	funcA: ()->
# 		console.log "a"


# class MySub extends MySuper
# 	c: "c"
# 	d: []
# 	constructor: ()->
# 		@e = "e"
# 	funcB: ()->
# 		console.log @a, @b, @c

# myInstance = new MySub()
# console.log myInstance
# myInstance.funcB()



# assetsLoading.forEach (promise, i)->
# 	promise.then (result)->
# 		console.log "Loaded one Sound!", result



# class SoundLoader
# 	constructor: ()->
# 		@requestedCount = 0
# 		@completedCount = 0
# 		@loadedCount = 0
# 		@complete = undefined
# 		# errorCount = 0

# 	load: (name, url)=>
# 		request = new XMLHttpRequest()
# 		request.open('GET', url, true)
# 		request.responseType = 'arraybuffer';
# 		request.onload = ()=>
# 			audioContext.decodeAudioData request.response, (buffer)=>
# 				#todo decode error
# 				exports.loadedSounds[name] = buffer
# 				@loadedCount++
# 				@completedCount++
# 				# console.log @completedCount, @requestedCount, @complete
# 				if @completedCount == @requestedCount and @complete?
# 					@complete()
					
# 		# todo load error
# 		request.send()
# 		@requestedCount++
# exports.SoundLoader = SoundLoader


framgent shader chromatic aberations
void main() {
					// read the input color
					float scale = 1.05;
					vec2 adjusted_uv;
					vec4 o;

					adjusted_uv = ((vUv - vec2(.5, .5)) / 1.005) + vec2(.5, .5);
					o.r = texture2D( tDiffuse, adjusted_uv ).r;

					adjusted_uv = ((vUv - vec2(.5, .5)) / 1.0) + vec2(.5, .5);
					o.g = texture2D( tDiffuse, adjusted_uv ).g;

					adjusted_uv = ((vUv - vec2(.5, .5)) / .995) + vec2(.5, .5);
					o.b = texture2D( tDiffuse, adjusted_uv ).b;

					

					// set the output color
					gl_FragColor = o;
				}
