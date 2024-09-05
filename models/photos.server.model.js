const
    db = require('../config/db'),
    dateTime = require('node-datetime');

exports.primaryPhotoViewURIs = function(params, done) {
    try {
        let auctionId = [params.auctionId];

        db.get_pool().query('SELECT auction_primaryphoto_URI FROM auction WHERE auction_id = ?', auctionId, function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            if (result.length === 0) return done({err: "Not found", status: 404});
            done(result);
        });
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.primaryPhotoPost = function(params, done) {
    try {
        db.get_pool().query('SELECT auction_userid as user, auction_startingdate as start FROM auction WHERE auction_id = ?',
            [params.auctionId], function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            if (result.length === 0) return done({err: "Not found", status: 404});
            if (result[0].user !== params.id) {
                return done({err: "Unauthorized.", status: 401});
            }
            db.get_pool().query('DELETE FROM photo WHERE photo_auctionid = ?', [params.auctionId], function(err, result) {
                if (err) return done({err: "Internal server error", status: 500});
                let values = [[params.auctionId, params.image]];
                db.get_pool().query('INSERT INTO photo (photo_auctionid, photo_image_URI) VALUES (?)', values,
                    function(err, result) {
                    if (err) return done({err: "Internal server error", status: 500});
                    if (result.affectedRows === 0) return done({err: "Internal server error", status: 500});

                    db.get_pool().query('UPDATE auction SET auction_primaryphoto_URI = ? WHERE auction_id = ?',
                        [params.image, params.auctionId], function (err, result) {
                        if (err) return done({err: "Internal server error", status: 500});
                        if (result.affectedRows === 0) return done({err: "Internal server error", status: 500});
                        done(result);
                    });
                });
            });
        });
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.primaryPhotoDelete = function(params, done) {
    try {
        let auctionId = [params.auctionId];

        db.get_pool().query('SELECT auction_userid as user, auction_startingdate as start, auction_primaryphoto_URI as' +
            ' link FROM auction WHERE auction_id = ?', [params.auctionId], function (err, result) {
                if (err) return done({err: "Internal server error", status: 500});
                if (result.length === 0) return done({err: "Not found", status: 404});
                if (result[0].user !== params.id) {
                    return done({err: "Unauthorized.", status: 401});
                }
                let link = result;

                db.get_pool().query('DELETE FROM photo WHERE photo_auctionid = ?', auctionId, function (err, result) {
                    if (err) return done({err: "Internal server error", status: 500});
                    if (result.affectedRows === 0) return done({err: "Not found", status: 404});

                    db.get_pool().query('UPDATE auction SET auction_primaryphoto_URI = NULL WHERE auction_id = ?',
                        [params.auctionId], function (err, result) {
                            if (err) return done({err: "Internal server error", status: 500});
                            if (result.affectedRows === 0) return done({err: "Internal server error", status: 500});
                            done(link);
                        });
                });
        });
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};