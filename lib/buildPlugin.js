var app = require("../index")
var connection = require("../lib/connection")

/**
	Create a Plugin from a SQL instance

	@param 		instance
	@return 	plugin
*/
module.exports = function(instance){
	var plugin = require(instance.npmName)();
	connection.query(
		"SELECT `key`, value " +
		"FROM pluginConfig " +
		"WHERE pluginConfig.`pluginInstanceId` = ?;",
		[instance.id],
		function(err, config){
			if(err) console.log(err);
			config.forEach(function(e){
				if (plugin.locals.config[e.key] != null) {
					plugin.locals.config[e.key].setValue(e.value);
				}
			})

			plugin.locals.globalPluginConfig = {
				priority: {
					label: 'Priority',
					value: instance.priority,
					setValue: function(v){
						this.value = this.setter(v)
					},
					setter: function(v){
						return parseInt(v)
					},
					type: 'text',
					isValid: function(value){
						if (is.not.number(parseInt(value))){
							return "value must be a number"
						}
						else {
							return null
						}
					}
				}
			}

		}
	)
	return plugin;
}
