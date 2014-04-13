
score = 0
exports.displayElement = undefined

exports.set = (_score)->
	score = _score
	display()

exports.add = (points)->
	score += points
	display()

	# console.log exports.displayElement
display = ()->
	if exports.displayElement?
		exports.displayElement.text "Score: #{score}"

exports.get = ()->
	return score
