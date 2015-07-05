var express = require("express");
var router = express.Router();
var connection = require("../lib/connection")
var multer = require("multer")
var fs = require("fs")
var is = require("is_js")
var hash = require("../lib/hash")
var erdblock = require("erdblock")
var updateErdblock = require("../lib/updateErdblock")
var async = require('async')

router.get("/about", function(req, res, next){
	res.render("user/about")
})

router.post('/about',
	multer({
		dest: "./user/",
		onFileUploadComplete: function(file, req, res) {
			if(req.body.deleteProfileImage == null && req.body.deleteCoverImage == null){
				connection.query(
					"UPDATE `user` " +
					"SET ?? = ? " +
					"WHERE `id` = ?;",
					[file.fieldname, file.path, req.session.user.id],
					function(err){
						if(err) return next(err);
						req.session.user[file.fieldname] =  file.path
						res.locals.user[file.fieldname] = file.path
						updateErdblock(erdblock, req.session.user)
					}
				)
			}
		},
		rename: function (fieldname, filename, req, res) {
			return fieldname
		},
		changeDest: function(dest, req, res) {
			dest += req.session.user.id + "/"
			try {
				var stat = fs.statSync(dest);
			} catch(err) {
				fs.mkdirSync(dest);
			}
			return dest
		}
	}),
	function(req, res, next) {


		async.parallel(
			{
				profileImage: function(callback) {
					if(req.body.deleteProfileImage){
						fs.unlink(req.session.user.profileImagePath, function (err) {
							if (err) console.log(err)
						})

						req.session.user.profileImagePath = null

						connection.query(
							"UPDATE `user` " +
							"SET `profileImagePath` = NULL " +
							"WHERE `id` = ?;",
							[req.session.user.id],
							function(err){
								if(err) return next(err)

								callback(null, null)
							}
						)
					}
					else callback(null, null)
				},
				coverImage: function(callback) {
					if(req.body.deleteCoverImage){
						fs.unlink(req.session.user.coverImagePath, function (err) {
							if (err) console.log(err)
						})

						req.session.user.coverImagePath = null

						connection.query(
							"UPDATE `user` " +
							"SET `coverImagePath` = NULL " +
							"WHERE `id` = ?;",
							[req.session.user.id],
							function(err){
								if(err) return next(err)

								callback(null, null)
							}
						)
					}
					else callback(null, null)
				},
				userInfo: function(callback) {
					connection.query(
						"UPDATE `user` " +
						"SET `title` = ?, `subtitle` = ? " +
						"WHERE `id` = ?;",
						[req.body.title, req.body.subtitle, req.session.user.id],
						function(err){
							if(err) return next(err)

							req.session.user.title = req.body.title
							req.session.user.subtitle = req.body.subtitle
							res.locals.user.title = req.body.title
							res.locals.user.subtitle = req.body.subtitle

							callback(null, null)
						}
					)
				}
			},
			function(err, results) {
				updateErdblock(erdblock, req.session.user)

				req.flash("info", "Changed")
				res.render("user/about")
			}
		)
	}
)



// User: security

router.get("/security", function(req, res, next){
	res.render("user/security")
})

router.post("/security", function(req, res, next){
	if (req.body.password != req.body.passwordRe) {
		req.flash("danger", "Passwords are not matching")
		res.render("user/security")
	}
	else if(req.body.password.length == 0){
		req.flash("danger", "Password to short")
		res.render("user/security")
	} else if(is.string(req.body.password) == false){
		req.flash("danger", "Error")
		res.render("user/security")
	}	else {
		connection.query(
			"UPDATE `user` " +
			"SET `password` = ? " +
			"WHERE `id` = ?;",
			[hash(req.body.password), req.session.user.id],
			function(err){
				if(err) return next(err);
				req.flash("info", "Changed")
				res.render("user/security")
			}
		)
	}
})



// User: delete

router.get("/delete", function(req, res, next){
	res.render("user/delete")
})

router.post("/delete", function(req, res, next){
	if (req.body.username != req.session.user.username) {
		req.flash("danger", "Username is wrong.")
		res.render("user/delete")
	} else{
		connection.query(
			"DELETE FROM pluginConfig " +
			"WHERE pluginConfig.userId = ? ",
			[req.session.user.id],
			function(err){
				if(err) next(err);
			}
		)
		connection.query(
			"DELETE FROM pluginInstances " +
			"WHERE pluginInstances.userId = ? ",
			[req.session.user.id],
			function(err){
				if(err) next(err);
			}
		)


		connection.query(
			"DELETE FROM publisherConfig " +
			"WHERE publisherConfig.userId = ? ",
			[req.session.user.id],
			function(err){
				if(err) next(err);
			}
		)
		connection.query(
			"DELETE FROM publisherInstances " +
			"WHERE publisherInstances.userId = ? ",
			[req.session.user.id],
			function(err){
				if(err) next(err);
			}
		)


		connection.query(
			"DELETE FROM user " +
			"WHERE user.id = ? ",
			[req.session.user.id],
			function(err){
				if(err) next(err);
			}
		)

		res.redirect("/logout")
	}
})


module.exports = router
