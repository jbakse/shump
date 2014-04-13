exports.after = (delay, func)->
	setTimeout func, delay

exports.random = (min, max)->
	return Math.random() * (max - min) + min;


exports.layerSpacing = ()->
	fov_radians = 45 * (Math.PI / 180)
	targetZ = 480 / (2 * Math.tan(fov_radians / 2) ) / 32.0;
