shump = require('./shump/shump.coffee')

$("#fullscreen").click ()->
	
	$("#shump")[0].webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	
	canvas = $("#shump canvas")
	canvasAspect = canvas.width() / canvas.height()

	containerWidth = $(window).width()
	containerHeight = $(window).height()
	containerAspect = containerWidth / containerHeight
	console.log canvasAspect, $(window).width() , $(window).height(), containerAspect
	
	if canvasAspect < containerAspect
		console.log "match height"
		canvas.height containerHeight
		canvas.width containerHeight * canvasAspect
	else
		console.log "match width"
		canvas.width containerWidth
		canvas.height containerWidth / canvasAspect

$("#debug").append("""<span id="levelChildren">""")


updateDebug = ()->
	$("#levelChildren").text """level.children = #{shump.Game.level.children.length}"""



# testIt = ()->
# 	console.log "testIt"

# class MySuper
# 	test: "MySuperTest"
# 	anotherThing: testIt()
# 	constructor: ()->
# 		console.log @test



# class MySub extends MySuper
# 	test: "MySubTest"



# new MySub()
# new MySub()
# new MySub()
# new MySub()
# new MySuper()
