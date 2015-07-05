var app = require("../")
var connection = require("../lib/connection")
var erdblock = require("erdblock")
var updateErdblock = require("./updateErdblock")
var buildPlugin = require("./buildPlugin")

/**
	Build Erdblock for given user

	@param 		user
	@return 	erdblock
*/
module.exports = function(user){

	app.erdblocks[user.id] = erdblock()
	updateErdblock(erdblock, user)

	app.use("/preview/"+user.username, app.erdblocks[user.id])

	// plugins:
	connection.query(
		"SELECT pluginInstances.id, pluginInstances.`enabled`, pluginInstances.`priority`, pluginInstances.id, plugins.`npmName` " +
		"FROM pluginInstances, plugins " +
		"WHERE pluginInstances.`userId` = ? " +
		"AND pluginInstances.`pluginId` = plugins.id "+
		"ORDER BY pluginInstances.`priority` DESC;",
		[user.id],
		function(err, instances) {
			if(err) console.log(err);
			instances.forEach(function(instance){
				var plugin = buildPlugin(instance)
				app.erdblocks[user.id].addPlugin(plugin, instance.id, instance.priority);
			});
		}
	)

	return app.erdblocks[user.id]
}
