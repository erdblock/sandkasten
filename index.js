/* @flow */

var async = require('async')
var bodyParser = require('body-parser')
var express = require("express")
var expressLess = require('express-less')
var session = require('express-session')
var flash = require("flash")
var http = require("http")

var app = express()
app.erdblocks = []
app.publisherInstances = []
app.locals.config = require('./config')

module.exports = app;

var routes = require("./routes")
var connection = require("./lib/connection")
var buildPlugin = require("./lib/buildPlugin")
var buildErdblock = require("./lib/buildErdblock")
var updateErdblock = require("./lib/updateErdblock")
var buildPublisher = require("./lib/buildPublisher");
var middleware = require("./middleware")



// Setup express

app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({
	extended: true
}))

// static files that dont need sessions:
app.use("/js/", express.static("./assets/js"))
app.use("/js/", express.static("./node_modules/jquery/dist"))
app.use("/css/", express.static("./assets/css"))
app.use("/png/", express.static("./assets/png"))
app.use("/css/", expressLess(__dirname + "/stylesheets"))
app.use("/fonts/", express.static("./node_modules/bootstrap/fonts"))

app.use(middleware.session);
app.use(flash());
app.use(middleware.database);
app.use("/logout", routes.logout);

app.get('/', function (req, res) {
	res.render("index")
});

app.use("/register", routes.register)
app.use("/login", routes.login)

// Check all further GETs/ POSTs for active session, otherwise redirect to
// login page
app.use(function(req, res, next){
	if(req.session.user==null){
		res.redirect("/login")
	} else {
		next();
	}
})

app.use("/assets/", routes.assets)
app.use("/user", routes.user);
app.use("/plugins", routes.plugins)
app.use("/publishers", routes.publishers)



// Set up instancess

connection.query(
	"SELECT * " +
	"FROM user",
	function(err, users, fields) {
		if (err) {
			console.log(err)
		}
		else {
			users.forEach(function(user){
				buildErdblock(user)
			})
			connection.query(
				"SELECT publisherInstances.id, publishers.`npmName`, publisherInstances.userId " +
				"FROM publisherInstances, publishers " +
				"WHERE publisherInstances.`publisherId` = publishers.id;",
				function(err, publisherInstances, fields) {
					if (err) {
						console.log(err)
					}
					else {
						publisherInstances.forEach(function(instances){
							buildPublisher(instances)
						})
					}
				}
			)
		}
	}
)



// cache some database stuff
async.parallel(
	{
		plugins: function(callback) {
			connection.query(
				"SELECT * " +
				"FROM plugins " +
				"WHERE 1",
				function(err, plugins){
					plugins.forEach(function(e){
						e.title = require(e.npmName)().locals.title;
					})
					callback(null, plugins)
				}
			)
		},
		publishers: function(callback) {
			connection.query(
				"SELECT * " +
				"FROM publishers " +
				"WHERE 1",
				function(err, publishers){
					publishers.forEach(function(e){
						e.title = require(e.npmName)().title
					})
					callback(null, publishers)
				}
			)
		}
	},
	function(err, results) {
		if (err != null) {
			console.log("err: " + err)
			return
		}
		app.plugins = results.plugins
		app.publishers = results.publishers

		var server = http.Server(app)
		server.listen(app.locals.config.network.port, app.locals.config.network.address)
		server.on('listening', function() {
			console.log('Express server started on at %s:%s', server.address().address, server.address().port)
		})
	}
)
