var express = require("express");
var router = express.Router();
var fs = require("fs")
var path = require("path")

// For preview images in /user/about.
router.get("/user/*", function(req, res, next){
	var lPath = path.resolve(__dirname, "..", "user", "" + req.session.user.id, req.path.split('/').pop())
	res.sendFile(lPath)
})

module.exports = router
