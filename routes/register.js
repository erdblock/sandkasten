var express = require("express");
var router = express.Router();
var connection = require("../lib/connection")
var app = require("../index")
var hash = require("../lib/hash")
var buildErdblock = require("../lib/buildErdblock")

router.get("/", function(req, res, next){
	if(req.session.user==null){
			res.render("register")
		} else {
			next()
		}
})

router.post('/', function(req, res, next){
	if (app.locals.config.registration.enabled == false){
		next()
	} else if(req.session.user!=null){
		next()
	} else  if (req.body.password != req.body.passwordValidate) {
		req.flash("danger", "The passwords do not match.")
		res.render("register")
	} else  if (req.body.username == "") {
		req.flash("danger", "Empty username.")
		res.render("register")
	} else {
		if (app.locals.config.registration.inviteCodes.indexOf(req.body.inviteCode) >= 0 || app.locals.config.registration.invites == false){
			connection.query(
				"SELECT * FROM user WHERE username = ? LIMIT 1",
				[req.body.username],
				function(err, rows, fields) {
					if (err) return next(err)
					console.log("ddd "+rows.length)
					if(rows.length != 0){
						req.flash("danger", "Username is already being used.")
						res.render("register")
					} else {
						connection.query(
							"INSERT INTO user (username, password) VALUES (?, ?)",
							[ req.body.username, hash(req.body.password) ],
							function(err, rows, fields) {
								if (err) return next(err);
								connection.query(
									"SELECT * " +
									"FROM user " +
									"WHERE `username` = ?",
									[req.body.username],
									function(err, users){
										if(err) next(err)
										buildErdblock(users[0]);
										req.flash("info", "Successfully registered.")
										res.redirect("/login")
									}
								)
							}
						)
					}
				}
			)
		} else {
			req.flash("danger", "Wrong invite code.")
			res.render("register")
		}


	}
})


module.exports = router
