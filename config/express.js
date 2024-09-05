const
    express = require('express'),
    bodyParser = require('body-parser');

module.exports = function() {
    const app = express();

    app.use(bodyParser.json());

    require('../routes/users.server.routes.js')(app);
    require('../routes/auctions.server.routes.js')(app);
    require('../routes/database.server.routes.js')(app);
    require('../routes/photos.server.routes.js')(app);

    return app;
};