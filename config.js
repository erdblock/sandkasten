module.exports = {


	/**
		Database
		Object is directly given to the mysql npm.
	*/
	database	:	{
		host		:	"",
		user		:	"",
		password	:	"",
		database	:	""
	},




	/**
		Password settings
	*/
	password	:	{
		/**
			salt
			Warning: changes with registered users in the database invalides all passwords.
		*/
		salt		:	"mysecret key"
	},




	/**
		Networking settings
		Settings for the HTTP module.
	*/
	network		:	{
		/**
			port
		*/
		port		:	3000,

		/**
			address
			IPv4/ IPv6 address to bin on. (BSP: "::1")
		*/
		address		: 	"127.0.0.1"
	},




	/**
		Registration mode
	*/
	registration:	{
		/**
			enable
			enable frontend user registration.
		*/
		enabled		:	true,

		/**
			invites
			requires a invite key to proccess registration. Only when registrations are enabled.
		*/
		invites		:	false,

		/**
			inviteCodes
			list invite codes to allow registration for limites users.
		*/
		inviteCodes	:	[
			"1", "2", "3", "4"
		]
	},



	/**
		Session
	*/
	session: {
		// The default server-side session storage, MemoryStore, is purposely not designed for a production environment. It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.
		//redis: {
		//	host: "127.0.0.1",
		//	port: "",
		//	pass: ""
		//}
	}
}
