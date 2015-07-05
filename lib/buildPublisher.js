var app = require("../index")
var connection = require("../lib/connection")

/**
	Build Publisher with publisherData

	@param 		publisherData
	@return 	publisher
*/
module.exports = function(publisherData){
	app.publisherInstances[publisherData.id] = require(publisherData.npmName)();
	app.publisherInstances[publisherData.id].setErdblock(app.erdblocks[publisherData.userId])

	connection.query(
		"SELECT `key`, value " +
		"FROM publisherConfig " +
		"WHERE `publisherInstanceId` = ?;",
		[publisherData.id],
		function(err, config){
			if(err) console.log(err);
			config.forEach(function(e){
				if (app.publisherInstances[publisherData.id].config[e.key] != null) {
					app.publisherInstances[publisherData.id].config[e.key].setValue(e.value);
				}
			})
		}
	)
	return app.publisherInstances[publisherData.id]
}
