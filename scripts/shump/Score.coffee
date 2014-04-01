
score = 0
exports.displayElement = undefined

exports.add = (points)->
	score += points
	# console.log exports.displayElement
	if exports.displayElement?
		exports.displayElement.text "Score: #{score}"

exports.get = ()->
	return score
