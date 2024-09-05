const
    photos = require('../controllers/photo.server.controller');

module.exports = function(app) {
    app.route('/api/v1/auctions/:id/photos')
        .get(photos.photoViewURIs)
        .post(photos.photoPost)
        .delete(photos.photoDelete);
};