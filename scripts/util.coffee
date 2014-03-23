module.exports.after = (delay, func)->
	setTimeout func, delay

module.exports.random = (min, max)->
	return Math.random() * (max - min) + min;
