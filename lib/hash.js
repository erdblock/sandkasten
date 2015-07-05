var crypto = require('crypto')
var config = require("../config").password
/**
	Hash a given string sha512

	@param 		text to hash
	@return 	sha512 string
*/
module.exports = function(text) {
	var hash = crypto.createHmac('sha512', config.salt)
	hash.update(text)
	var value = hash.digest('hex')
	return value
}
