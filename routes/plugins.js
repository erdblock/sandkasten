var express = require("express");
var router = express.Router();
var fs = require("fs")
var path = require("path")
var connection = require("../lib/connection")
var buildPlugin = require("../lib/buildPlugin")
var app = require("../index")

// Plugins: GET/ POST new plugin

router.get("/new/:id", function(req, res, next){
	// needs for unknown reason imported at this point
	var markedm = require("../markedm")

	connection.query(
		"SELECT * " +
		"FROM plugins " +
		"WHERE id = ?",
		[req.params.id],
		function(err, plugins){
			if (plugins[0]) {
				res.locals.newPlugin = require(plugins[0].npmName)();

				var readmePath = path.resolve(__dirname, "..", "node_modules" , plugins[0].npmName, "README-sandkasten.md")
				fs.readFile(readmePath, 'utf8', function (err, data) {
					if (err){
						console.error(err)
					} else {
						app.locals.readme = data ? markedm(data) : null
					}
					// In booth cases render plugins/new. It can handle locals.readme = NULL.
					res.render("plugins/new")
				})
			} else {
				next()
			}
		}
	)
})

router.post("/new/:id", function(req, res, next){
	connection.query(
		"CALL addInstance( ?, ? )",
		[req.params.id, req.session.user.id],
		function(err, instanceId){
			if(err) return next(err);
			connection.query(
				"SELECT pluginInstances.id, pluginInstances.`enabled`, pluginInstances.`priority`, plugins.`npmName` " +
				"FROM pluginInstances, plugins " +
				"WHERE pluginInstances.`id` = ? " +
				"AND pluginInstances.`pluginId` = plugins.id;",
				[ instanceId[0][0].ai ],
				function(err, instance){
					if(err) return next(err);
					var plugin = buildPlugin(instance[0]);

					// TODO: cleaner solution (method)
					plugin.locals.globalPluginConfig = {
						priority: {
							label: 'Priority',
							value: instance[0].priority,
							setValue: function(v){
								this.value = parseInt(v)
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
						},
					}

					app.erdblocks[req.session.user.id].addPlugin(plugin, instance[0].id, instance[0].priority);
					req.flash("info", "Added Plugin " + plugin.locals.title);
					res.redirect("/plugins/" + instance[0].id + "/");
				}
			)
		}
	)
});



// Plugins: GET plugin

router.get("/:id/", function(req, res, next){
	var e = app.erdblocks[req.session.user.id]
	var pluginData = e.locals.pluginData[req.params.id]
	if (pluginData){
		res.locals.activePluginInstance = pluginData.plugin
		res.locals.instanceId = req.params.id
		res.render("plugins/view_edit")
	}
	else {
		next()
	}
})



// Plugins: GET/ POST delete plugin

router.get('/:id/delete', function(req, res, next){
	var e = app.erdblocks[req.session.user.id]

	res.locals.activePluginInstance = e.locals.pluginData[req.params.id].plugin

	res.locals.instanceId = req.params.id
	res.render("plugins/view_delete")
})

router.post('/:id/delete', function(req, res, next){
	connection.query(
		"DELETE FROM pluginInstances " +
		"WHERE id = ? " +
		"AND userId = ? " +
		"LIMIT 1",
		[req.params.id, req.session.user.id],
		function(err, users, fields) {
			if (err) return next(err);
			var e = app.erdblocks[req.session.user.id]
			var plugin = e.locals.pluginData[req.params.id].plugin

			e.removePlugin(req.params.id)

			res.redirect("/plugins/");
		}
	);
})



// Plugins: POST plugin global setting

router.post('/:id/global', function(req, res, next){

	var e = app.erdblocks[req.session.user.id]
	var plugin = e.locals.pluginData[req.params.id].plugin

	var values = []

	//for (var key in req.body) {
	for (var key in plugin.locals.globalPluginConfig) {
		var config = plugin.locals.globalPluginConfig[key]

		var err = config.isValid(req.body[key])
		if (err){
			req.flash("danger", config.label + ": " + err)
		}
		// TODO: fix error with checkmark ("on" != 1)...
		else if (config.value != config.setter(req.body[key])) {
			req.flash("info", config.label + " saved")
			config.setValue(req.body[key])
			values.push({key: key, value: config.value})

			// Special Actions
			/*if (key == "enabled"){
				if (config.value == 1) {
					e.addPlugin(req.params.id, config.value, plugin.locals.globalPluginConfig.priority.value)
				} else {
					e.removePlugin(req.params.id)
				}
			} else*/ if (key == "priority") {
				e.setPriorityForPlugin(req.params.id, config.value)
			}
		}
	}

	for (var i = 0; i < values.length; i++){
		var query = connection.query(
			"UPDATE pluginInstances " +
			"SET ?? = ? " +
			"WHERE userId = ? " +
			"AND id = ?",
			[values[i].key, values[i].value , req.session.user.id, req.params.id],
			function(err, sqlres, fields){
				if(err) return next(err)
			}
		)
	}

	res.redirect("/plugins/" + req.params.id+"/");
})



// Plugins: POST plugin setting

router.post('/:id/', function(req, res, next){
	var e = app.erdblocks[req.session.user.id]
	var plugin = e.locals.pluginData[req.params.id].plugin

	var values = []
	for (var key in req.body) {
		var config = plugin.locals.config[key]
		// Set Var to plugin
		if (plugin != null) {
			if (req.body[key] != config.value || (req.body[key].length == 0 && config.value == null) ) {
				var err = config.isValid(req.body[key])
				if (req.body[key].length == 0) {
					config.setValue(null)
					values.push([req.session.user.id, req.params.id, key, null])
					req.flash("info", config.label + " saved")
				}
				else if (err) {
					req.flash("danger", config.label + ": " + err)
				}
				else {
					config.setValue(req.body[key])
					values.push([req.session.user.id, req.params.id, key, req.body[key]])
					req.flash("info", config.label + " saved")
				}
			}
		}
	}

	if (values.length > 0) {
		connection.query(
			"SELECT COUNT(pluginId) AS c " +
			"FROM pluginInstances " +
			"WHERE id = ? " +
			"AND userId = ?",
			[req.params.id, req.session.user.id],
			function(err, sqlres, fields){
				if(err) return next(err)
				if(sqlres[0].c !== 1) next(new Error("Invalid"))

				var query = connection.query(
					"REPLACE INTO pluginConfig (userId, pluginInstanceId, `key`, value) " +
					"VALUES ?",
					[values], function(err) {
					if (err) return next(err)
					res.locals.activePluginInstance = plugin
					res.locals.instanceId = req.params.id
					res.render("plugins/view_edit")
				});
			}
		);
	}
	else {
		res.locals.activePluginInstance = plugin
		res.locals.instanceId = req.params.id
		res.render("plugins/view_edit")
	}
});



// Plugins: GET redirect

router.get('/', function(req, res, next){
	res.render("plugins/clear")
})

module.exports = router
