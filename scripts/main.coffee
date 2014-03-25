shump = require('./shump/shump.coffee')

game = new shump.Game()

$("#debug").append("""<span id="levelChildren">""")

updateDebug = ()->
	$("#levelChildren").text """level.children = #{game.level.children.length}"""


game.world.on "update", updateDebug


console.log "hidera"
