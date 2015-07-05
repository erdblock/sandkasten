var app = require("../index")
var path = require("path")
/**
	Update Erdblock for given user

	@param 		erdblock
	@param 		user
	@return 	erdblock
*/
module.exports = function(erdblock, user){
	app.erdblocks[user.id].locals.title = user.title
	app.erdblocks[user.id].locals.subtitle = user.subtitle
	if (user.profileImagePath != null && user.profileImagePath != "") {
		app.erdblocks[user.id].locals.profileImage = path.resolve(__dirname, "..", user.profileImagePath)
	} else {
		app.erdblocks[user.id].locals.profileImage = path.resolve(__dirname, "..", "assets/png/profile.png")
	}
	if (user.coverImagePath != null && user.coverImagePath != "") {
		app.erdblocks[user.id].locals.coverImage = path.resolve(__dirname, "..", user.coverImagePath)
	} else {
		app.erdblocks[user.id].locals.coverImage = path.resolve(__dirname, "..", "assets/png/cover.png")
	}
}
