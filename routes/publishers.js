var express = require("express");
var router = express.Router();
var connection = require("../lib/connection")
var fs = require("fs")
var buildPublisher = require("../lib/buildPublisher")
var app = require("../")
var path = require("path")

// Publishers: GET/ POST new plugin

router.get("/new/:id", function(req, res, next){
	// needs for unknown reason imported at this point
	var markedm = require("../markedm")

	connection.query(
		"SELECT * " +
		"FROM publishers " +
		"WHERE id = ?",
		[req.params.id],
		function(err, publishers){
			if (publishers[0]) {
				res.locals.newPublisher = require(publishers[0].npmName)();

				var readmePath = path.join(__dirname, ".." , "node_modules", publishers[0].npmName, "README-sandkasten.md")
				fs.readFile(readmePath, 'utf8', function (err, data) {
					if (err) {
						console.error(err)
					} else {
						app.locals.readme = data ? markedm(data) : null
					}
					// In booth cases render plugins/new. It can handle locals.readme = NULL.
					res.render("publishers/new")
				 })
			} else {
				next()
			}
		}
	)
})

router.post("/new/:id", function(req, res, next){
	connection.query(
		"CALL addPublisherInstance( ?, ? )",
		[req.params.id, req.session.user.id],
		function(err, instanceId){
			if(err) return next(err);
			connection.query(
				"SELECT publisherInstances.id, publisherInstances.userId, publishers.`npmName` " +
				"FROM publisherInstances, publishers " +
				"WHERE publisherInstances.`id` = ? " +
				"AND publisherInstances.`publisherId` = publishers.id;",
				[ instanceId[0][0].ai ],
				function(err, instance){
					if(err) return next(err);
					var publisher = buildPublisher(instance[0])

					req.flash("info", "Added Publisher " +publisher.title);
					res.redirect("/publishers/" + instance[0].id + "/");
				}
			)
		}
	)
});



// Publishers: GET plugin

router.get("/:id/", function(req, res, next){
	if (app.publisherInstances[req.params.id]){
		res.locals.activePublisherInstance = app.publisherInstances[req.params.id]
		res.locals.instanceId = req.params.id
		res.render("publishers/view_edit")
	}
	else {
		next()
	}
})



// Publishers: GET/ POST delete plugin

router.get('/:id/delete', function(req, res, next){
	res.locals.activePublisherInstance = app.publisherInstances[req.params.id]

	res.locals.instanceId = req.params.id
	res.render("publishers/view_delete")
})

router.post('/:id/delete', function(req, res, next){
	connection.query(
		"DELETE FROM publisherInstances " +
		"WHERE id = ? " +
		"AND userId = ? " +
		"LIMIT 1",
		[req.params.id, req.session.user.id],
		function(err, users, fields) {
			if (err) return next(err)

			// TODO: Tell Publisher to destroy?
			app.publisherInstances[req.params.id].close()
			app.publisherInstances[req.params.id] = null

			res.redirect("/publishers/")
		}
	);
})



// Publishers: POST plugin setting

router.post('/:id/', function(req, res, next){
	var publisher = app.publisherInstances[req.params.id]

	var values = []
	for (var key in req.body) {
		var config = publisher.config[key]
		// Set Var to publisher
		// TODO Method diffConf with values as a return
		if (publisher != null) {
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
			"SELECT COUNT(publisherId) AS c " +
			"FROM publisherInstances " +
			"WHERE id = ? " +
			"AND userId = ?",
			[req.params.id, req.session.user.id],
			function(err, sqlres, fields){
				if(err) return next(err)
				if(sqlres[0].c !== 1) next(new Error("Invalid"))

				var query = connection.query(
					"REPLACE INTO publisherConfig (userId, publisherInstanceId, `key`, value) " +
					"VALUES ?",
					[values], function(err) {
					if (err) return next(err)
					res.locals.activePublisherInstance = publisher
					res.locals.instanceId = req.params.id
					res.render("publishers/view_edit")
				});
			}
		);
	}
	else {
		res.locals.activePublisherInstance = publisher
		res.locals.instanceId = req.params.id
		res.render("publishers/view_edit")
	}
});

router.get("/", function(req, res, next){
	res.render("publishers/clear")
})

// Plugins: GET redirect

router.get('/', function(req, res, next){
	res.render("publishers/clear")
})


module.exports = router
