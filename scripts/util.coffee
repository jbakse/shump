exports.after = (delay, func)->
	setTimeout func, delay

exports.random = (min, max)->
	return Math.random() * (max - min) + min;
