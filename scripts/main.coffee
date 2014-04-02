shump = require('./shump/shump.coffee')



$("#debug").append("""<span id="levelChildren">""")

updateDebug = ()->
	$("#levelChildren").text """level.children = #{shump.game.level.children.length}"""


shump.game.world.on "update", updateDebug


# console.log "hidera"


