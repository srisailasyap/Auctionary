const
    db = require('./config/db'),
    //bodyParser = require('body-parser'),
    express = require('./config/express');

var app = express();

// Connect to MySQL on start
db.connect(function(err) {
    if (err) {
        console.log("Unable to connect to MySQL.");
        process.exit(1);
    } else {
        app.listen(4941, function () {
            console.log("Listening on port: " + 4941);
        });
    }
});