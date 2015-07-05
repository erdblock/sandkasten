var express = require("express");
var router = express.Router();
var connection = require("../lib/connection")
var hash = require("../lib/hash")

router.get("/", function(req, res){
	res.render("login")
})

router.post('/', function(req, res, next){
	connection.query(
		"SELECT `id`, `username`, `title`, `subtitle`, `profileImagePath`, " +
		"`coverImagePath` " +
		"FROM user " +
		"WHERE username = ? " +
		"AND password = ? " +
		"LIMIT 1",
		[req.body.username, hash(req.body.password)],
		function(err, users, fields) {
			if (err) return next(err);
			if (users[0] != null) {
				req.session.user = users[0]
				res.redirect('/user/about');
			} else {
				req.flash("danger", "Wrong user/ password combination")
				res.render("login");
			}
		}
	)
});

module.exports = router
