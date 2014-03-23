shump = require('./shump.coffee');
console.log "shump", shump

$("#debug").append("""<span id="levelChildren">""")

updateDebug = ()->
	$("#levelChildren").text """level.children = #{level.children.length}"""


#setup world
window.world = new shump.core.World()
level = new shump.Level()

world.scene.add level.root
world.on "update", level.update
world.on "update", updateDebug

console.log "level", level
#begin
world.start()


window.level = level

