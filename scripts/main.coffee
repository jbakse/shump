shump = require('./shump.coffee');
console.log "shump", shump

#setup world
world = new shump.core.World()
level = new shump.Level()

world.scene.add level.root
world.on "update", level.update

#begin
world.start()

window.level = level


