const
    users = require('../controllers/user.server.controller');

module.exports = function (app) {
    app.route('/api/v1/users')
        .post(users.userCreate);

    app.route('/api/v1/users/login')
        .post(users.userLogin);

    app.route('/api/v1/users/logout')
        .post(users.userLogout);

    app.route('/api/v1/users/:id')
        .get(users.userViewById)
        .patch(users.userUpdateById);
};