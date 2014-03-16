shump = require('./shump.coffee');
console.log "shump", shump

#utils
modelLoader = new shump.ModelLoader()
input = new shump.Input()

#setup world
world = new shump.World()
level = new shump.Level()

world.scene.add level.root
world.on "update", level.update

#begin
world.start()


