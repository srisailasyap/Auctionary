const
    db = require('../config/db'),
    dateTime = require('node-datetime');

exports.auctionHasBids = function(params, done) {
    try {
        db.get_pool().query('SELECT * FROM bid WHERE bid_auctionid = ?', [params.auctionId], function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            done(result);
        });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};

exports.auctionViews = function(params, done) {
    try {
        let values;
        let sql = 'SELECT a.auction_id as id, c.category_title as categoryTitle, a.auction_reserveprice as ' +
            'reservePrice, a.auction_startingdate as startDateTime, a.auction_title as title, a.auction_endingdate as ' +
            'endDateTime FROM bid as b RIGHT OUTER JOIN auction as a ON b.bid_auctionid = a.auction_id LEFT OUTER JOIN ' +
            'category as c ON a.auction_categoryid = c.category_id ';

        if (params.category !== 0) {
            if (params.q === "") {
                if (params.seller === 0 && params.bidder !== 0) {
                    values = [params.bidder, params.category, params.start, params.count]; sql += 'WHERE b.bid_userid = ' +
                        '? AND a.auction_categoryid = ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else if (params.bidder === 0 && params.seller !== 0) {
                    values = [params.seller, params.category, params.start, params.count]; sql += 'WHERE a.auction_userid' +
                        ' = ? AND a.auction_categoryid = ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else if (params.bidder !== 0 && params.seller !== 0) {
                    values = [params.seller, params.bidder, params.category, params.start, params.count];
                    sql += 'WHERE a.auction_userid = ? AND b.bid_userid = ? AND a.auction_categoryid ' +
                        '= ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else {
                    values = [params.category, params.start, params.count]; sql += 'WHERE a.auction_categoryid = ? ' +
                        'GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                }
            } else {
                if (params.seller === 0 && params.bidder !== 0) {
                    values = ["%" + params.q + "%", params.bidder, params.category, params.start, params.count];
                    sql += 'WHERE a.auction_title LIKE ? AND b.bid_userid = ? AND a.auction_categoryid ' +
                        '= ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else if (params.bidder === 0 && params.seller !== 0) {
                    values = ["%" + params.q + "%", params.seller, params.category, params.start, params.count];
                    sql +=  'WHERE a.auction_title LIKE ? AND a.auction_userid = ? AND a.auction_categoryid = ? ' +
                        'GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else if (params.bidder !== 0 && params.seller !== 0) {
                    values = ["%" + params.q + "%", params.seller, params.bidder, params.category, params.start, params.count];
                    sql += 'WHERE a.auction_title LIKE ? AND a.auction_userid = ? AND b.bid_userid = ? ' +
                        'AND a.auction_categoryid = ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else {
                    values = ["%" + params.q + "%", params.category, params.start, params.count];
                    sql += 'WHERE a.auction_title LIKE ? AND a.auction_categoryid = ? AND ' +
                        'GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                }
            }
        } else {
            if (params.q === "") {
                if (params.seller === 0 && params.bidder !== 0) {
                    values = [params.bidder, params.start, params.count];
                    sql += 'WHERE b.bid_userid = ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else if (params.bidder === 0 && params.seller !== 0) {
                    values = [params.seller, params.start, params.count];
                    sql += 'WHERE a.auction_userid = ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else if (params.bidder !== 0 && params.seller !== 0) {
                    values = [params.seller, params.bidder, params.start, params.count]; sql += 'WHERE a.auction_userid' +
                        ' = ? AND b.bid_userid = ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else {
                    values = [params.start, params.count];
                    sql += 'GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                }
            } else {
                if (params.seller === 0 && params.bidder !== 0) {
                    values = ["%" + params.q + "%", params.bidder, params.start, params.count]; sql += 'WHERE a.auction_title' +
                        ' LIKE ? AND b.bid_userid = ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else if (params.bidder === 0 && params.seller !== 0) {
                    values = ["%" + params.q + "%", params.seller, params.start, params.count]; sql += 'WHERE a.auction_title' +
                        ' LIKE ? AND a.auction_userid = ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else if (params.bidder !== 0 && params.seller !== 0) {
                    values = ["%" + params.q + "%", params.seller, params.bidder, params.start, params.count];
                    sql += 'WHERE a.auction_title LIKE ? AND a.auction_userid = ? AND b.bid_userid = ? ' +
                        'GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                } else {
                    values = ["%" + params.q + "%", params.start, params.count];
                    sql += 'WHERE a.auction_title LIKE ? GROUP BY a.auction_id ORDER BY a.auction_startingdate DESC LIMIT ?, ?';
                }
            }
        }
        db.get_pool().query(sql, values, function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            if (result.length === 0) return done({err: "Bad request.", status: 400});
            done(result);
        });
    } catch (err) {
        console.log(err);
        done({err: "Internal server error", status: 500});
    }
};

exports.auctionCreate = function(params, done) {
    try {
        let values = [[params.title, params.categoryId, params.description, params.reservePrice, params.startingBid,
                params.creationDate, params.startDateTime, params.endDateTime, params.id]];

        db.get_pool().query('INSERT INTO auction (auction_title, auction_categoryid, auction_description, ' +
            'auction_reserveprice, auction_startingprice, auction_creationdate, auction_startingdate, ' +
            'auction_endingdate, auction_userid) VALUES (?)', values, function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            if (result.affectedRows === 0) return done({err: "Bad request.", status: 400});
            done(result);
        });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};

exports.auctionViewById = function(params, done) {
    try {
        let auctionId = [params.auctionId], auction;

        db.get_pool().query('SELECT a.auction_categoryid as categoryId, c.category_title as categoryTitle, a.auction_title' +
            ' as title, a.auction_reserveprice as reservePrice, a.auction_startingdate as startDateTime, ' +
            'a.auction_endingdate as endDateTime, a.auction_description as description, a.auction_creationdate as ' +
            'creationDateTime, a.auction_userid as id, u.user_username as username FROM auction as a, category as c,' +
            ' auction_user as u WHERE a.auction_categoryid = c.category_id AND a.auction_userid = u.user_id AND ' +
            'a.auction_id = ?', auctionId, function (err, result) {
            if (err) {
                return done({err: "Internal server error", status: 500});
            } else if (result.length === 0) {
                return done({err: "Not found", status: 404});
            }

            db.get_pool().query('SELECT MIN(bid_amount) as startingBid, MAX(bid_amount) as currentBid FROM bid ' +
                'WHERE bid_auctionid = ?', auctionId, function(err, bidTest) {
                if (err) {
                    return done({err: "Internal server error", status: 500});
                } else if (bidTest[0].startingBid === null && bidTest[0].currentBid === null) {
                    auction = {
                        "categoryId": result[0].categoryId,
                        "categoryTitle": result[0].categoryTitle,
                        "title": result[0].title,
                        "reservePrice": result[0].reservePrice,
                        "startDateTime": result[0].startDateTime,
                        "endDateTime": result[0].endDateTime,
                        "description": result[0].description,
                        "creationDateTime": result[0].creationDateTime,
                        "seller": { "id": result[0].id, "username": result[0].username },
                        "startingBid": 0,
                        "currentBid": 0,
                        "bids": []
                    };
                    done(auction);
                } else {
                    db.get_pool().query('SELECT b.bid_amount as amount, b.bid_datetime as datetime, b.bid_userid as buyerId' +
                        ', u.user_username as buyerUsername FROM bid as b, auction_user as u WHERE b.bid_userid = u.user_id' +
                        ' AND b.bid_auctionid = ? ORDER BY bid_datetime DESC', auctionId, function (err, bids) {
                        if (err) return done({err: "Internal server error", status: 500});
                        auction = {
                            "categoryId": result[0].categoryId,
                            "categoryTitle": result[0].categoryTitle,
                            "title": result[0].title,
                            "reservePrice": result[0].reservePrice,
                            "startDateTime": result[0].startDateTime,
                            "endDateTime": result[0].endDateTime,
                            "description": result[0].description,
                            "creationDateTime": result[0].creationDateTime,
                            "seller": {"id": result[0].id, "username": result[0].username},
                            "startingBid": bidTest[0].startingBid,
                            "currentBid": bidTest[0].currentBid,
                            "bids": bids
                        };
                        done(auction);
                    });
                }
            });
        });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};

exports.auctionUpdateById = function(params, done) {
    try {
        let auctionId = params.auctionId, found = false, values, field;

        db.get_pool().query('SELECT auction_startingdate as start, auction_endingdate as end FROM auction WHERE ' +
            'auction_id = ?', [auctionId], function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            else if (result.length === 0) return done({err: "Not found.", status: 404});
            let dates = result;

            if (dateTime.create(dates[0].end).now() + 86400000 > params.date) { // is behind by one day after DB entry?
                db.get_pool().query('SELECT * FROM category', function (err, categories) {
                    if (err) return done({err: "Internal server error", status: 500});

                    for (let i = 3; i < 10; i++) {
                        if (params[Object.keys(params)[i]] !== "") {
                            values = [params[Object.keys(params)[i]], auctionId];
                            field = Object.keys(params)[i];

                            switch (field) {
                                case "categoryId":
                                    for (let i = 0; i < categories.length; i++) {
                                        if (categories[i].category_id === params.categoryId) {
                                            found = true;
                                        }
                                    }

                                    if (found === true && field === "categoryId" && values[0] === params.categoryId) {
                                        db.get_pool().query('UPDATE auction SET auction_categoryid = ? WHERE auction_id = ?',
                                            values, function (err, result) {
                                                if (err) return done({err: "Internal server error", status: 500});
                                            });
                                    }
                                    break;
                                case "title":
                                    if (values[0] !== "") {
                                        db.get_pool().query('UPDATE auction SET auction_title = ? WHERE auction_id = ?', values,
                                            function (err, result) {
                                                if (err) return done({err: "Internal server error", status: 500});
                                            });
                                    }
                                    break;
                                case "description":
                                    db.get_pool().query('UPDATE auction SET auction_description = ? WHERE auction_id = ?', values,
                                        function (err, result) {
                                            if (err) return done({err: "Internal server error", status: 500});
                                        });
                                    break;
                                case "startDateTime":
                                    if (values[0] !== "") {
                                        if (dateTime.create(values[0]).now() < dateTime.create(dates[0].end).now()) {
                                            db.get_pool().query('UPDATE auction SET auction_startingdate = ? WHERE auction_id = ?', values,
                                                 function (err, result) {
                                             if (err) return done({err: "Internal server error", status: 500});
                                            });
                                        } else if ((params.endDateTime !== "") && (dateTime.create(values[0]).now() <
                                                dateTime.create(params.endDateTime).now())) {
                                            db.get_pool().query('UPDATE auction SET auction_startingdate = ? WHERE auction_id = ?', values,
                                                function (err, result) {
                                                if (err) return done({err: "Internal server error", status: 500});
                                            });
                                        }
                                    }
                                    break;
                                case "endDateTime":
                                    if (values[0] !== "") {
                                        if (dateTime.create(values[0]).now() > dateTime.create(dates[0].start).now()) {
                                            db.get_pool().query('UPDATE auction SET auction_endingdate = ? WHERE auction_id = ?', values,
                                                function (err, result) {
                                                if (err) return done({err: "Internal server error", status: 500});
                                            });
                                        } else if ((params.startDateTime !== "") && (dateTime.create(values[0]).now() >
                                                dateTime.create(params.startDateTime).now())) {
                                            db.get_pool().query('UPDATE auction SET auction_endingdate = ? WHERE auction_id = ?', values,
                                                function (err, result) {
                                                if (err) return done({err: "Internal server error", status: 500});
                                            });
                                        }
                                    }
                                    break;
                                case "reservePrice":
                                    db.get_pool().query('UPDATE auction SET auction_reserveprice = ? WHERE auction_id = ?', values,
                                        function (err, result) {
                                            if (err) return done({err: "Internal server error", status: 500});
                                        });
                                    break;
                                case "startingBid":
                                    if (values[0] !== "") {
                                        db.get_pool().query('UPDATE auction SET auction_startingprice = ? WHERE auction_id = ?', values,
                                            function (err, result) {
                                                if (err) return done({err: "Internal server error", status: 500});
                                            });
                                    }
                                    break;
                            }
                        }
                    }
                    done(1);
                });
            } else {
                return done({err: "Bad request.", status: 400});
            }
        });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};

exports.bidViewById = function(params, done) {
    try {
        let auctionId = params.auctionId;

        db.get_pool().query('SELECT b.bid_amount as amount, b.bid_datetime as datetime, b.bid_userid as buyerId, ' +
            'u.user_username as buyerUsername FROM bid as b, auction_user as u WHERE b.bid_userid = u.user_id AND ' +
            'b.bid_auctionid = ? ORDER BY b.bid_datetime DESC', [auctionId], function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            if (result.length === 0) return done({err: "Not found", status: 404});
            done(result);
        });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};

exports.bidMakeById = function(params, done) {
    try {
        if (params.auctionId === "") return done({err: "Not found", status: 404});
        let values = [[params.id, params.auctionId, params.amount, params.bidDate]];

        db.get_pool().query('SELECT auction_startingprice as min, auction_userid as id, auction_startingdate as start,' +
            ' auction_endingdate as end FROM auction WHERE auction_id = ?', [params.auctionId], function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            if (result.length === 0) return done({err: "Not found", status: 404});
            if (result[0].min > params.amount || dateTime.create(params.bidDate).getTime() <
                dateTime.create(result[0].start).getTime() ||
                dateTime.create(params.bidDate).getTime() > dateTime.create(result[0].end).now()) {
                return done({err: "Bad request.", status: 400});
            } else if (result[0].id === params.id) {
                return done({err: "Unauthorized.", status: 401});
            } else {
                db.get_pool().query('SELECT MAX(bid_amount) as currentBid FROM bid WHERE bid_auctionid = ?', [params.auctionId],
                    function (err, result) {
                    if (err) return done({err: "Internal server error", status: 500});
                    if ((result.length) === 0 || (result[0].currentBid < params.amount)) {
                        db.get_pool().query('INSERT INTO bid (bid_userid, bid_auctionid, bid_amount, bid_datetime) VALUES (?)',
                            values, function (err, result) {
                            if (err) return done({err: "Internal server error", status: 500});
                            if (result.affectedRows === 0) return done({err: "Bad request.", status: 400});
                            done(result);
                        });
                    } else {
                        return done({err: "Bad request.", status: 400});
                    }
                });
            }
        });
    } catch (err) {
        return done({err: "Internal server error", status: 500});
    }
};