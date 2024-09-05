const
    database = require('../controllers/database.server.controller');

module.exports = function(app) {
    app.route('/api/v1/reset')
        .post(database.resetDB);

    app.route('/api/v1/resample')
        .post(database.resampleDB);
};