var express = require("express")
var session = require("express-session")
var RedisStore = require("connect-redis")(session)
var router = express.Router()
var app = require("../index")
var config = require("../config").session


var sessionConfig = {
	secret: "secret",
	name: "session",
	proxy: true,
	resave: false,
	saveUninitialized: true,
	unset: 'destroy'
}

if(config.redis){
	sessionConfig.store = new RedisStore(config.redis)
	console.log("Use Redis Storage.")
} else {
	console.warn("The default server-side session storage, MemoryStore, is purposely not designed for a production environment. It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.")
}

router.use(session(sessionConfig));

router.use(function(req, res, next){
	if(!req.session){
		next(new Error("Session Error"))
	} else {
		next()
	}
})

router.use(function(req, res, next){
	res.locals.req = req;
	res.locals.user = req.session.user
	if(res.locals.user){
		res.locals.user.password = null
		res.locals.user.erdblock = app.erdblocks[req.session.user.id];
	}
	next();
});

module.exports = router
