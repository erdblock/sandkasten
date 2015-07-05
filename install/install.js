var connection = require("../lib/connection")
var fs = require("fs")
fs.readFile(__dirname + "/install.sql", "utf8", function(err, data){
	connection.query(
		data,
		function(err, response) {
			if (err) {
				console.log(err)
			}
			else {
				console.log("Database has been installed.")
			}
			process.exit()
		}
	)
})
