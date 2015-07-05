var express = require("express")
var router = express.Router()
var app = require("../index")
var connection = require("../lib/connection")
var async = require("async")

// Plugins: GET/ POST available plugins from database and call next
router.use(function(req, res, next){
	if (res.locals.user){
		async.parallel(
			{
				pluginInstances: function(callback) {
					connection.query(
						"SELECT i.id, i.pluginId, i.userId, i.priority, i.enabled, p.npmName " +
						"FROM pluginInstances AS i, plugins AS p " +
						"WHERE userId = ? " +
						"AND i.pluginId = p.id " +
						"ORDER BY priority DESC",
						[req.session.user.id],
						function(err, pluginInstances){
							if(err) return callback(err, null)

							pluginInstances.forEach(function(instance){
								var e = app.erdblocks[req.session.user.id]
								var pluginData = e.locals.pluginData[instance.id]

								var configId = ""
								if (pluginData.plugin.locals.configId){
									var c = pluginData.plugin.locals.configId()
									if (c != null && c != "") {
										configId = " (" + c + ")"
									}
								}
								instance.title = pluginData.plugin.locals.title + configId
							})
							callback(null, pluginInstances)
						}
					)
				},
				publisherInstances: function(callback) {
					connection.query(
						"SELECT i.id, i.publisherId, i.userId, p.npmName " +
						"FROM publisherInstances AS i, publishers AS p " +
						"WHERE userId = ? " +
						"AND i.publisherId = p.id ",
						[req.session.user.id],
						function(err, publisherInstances){
							if(err) return callback(err, null)
							publisherInstances.forEach(function(e){
								e.title = require(e.npmName)().title
							})
							callback(null, publisherInstances)
						}
					)
				}
			},
			function(err, results) {
				if (err != null) return next(err)

				res.locals.plugins = app.plugins
				res.locals.publishers = app.publishers
				res.locals.pluginInstances = results.pluginInstances
				res.locals.publisherInstances = results.publisherInstances

				next();
			}
		)
	} else {
		res.locals.plugins = app.plugins
		res.locals.publishers = app.publishers
		res.locals.pluginInstances = []
		res.locals.publisherInstances = []

		next()
	}
})

module.exports = router
