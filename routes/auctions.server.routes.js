const auctions = require('../controllers/auction.server.controller');

module.exports = function(app) {
    app.route('/api/v1/auctions')
        .get(auctions.auctionViews)
        .post(auctions.auctionCreate);

    app.route('/api/v1/auctions/:id')
        .get(auctions.auctionViewById)
        .patch(auctions.auctionUpdateById);

    app.route('/api/v1/auctions/:id/bids')
        .get(auctions.bidViewById)
        .post(auctions.bidMakeById);
};
