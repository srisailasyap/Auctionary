const
    Auction = require('../models/auctions.server.model'),
    User = require('../models/users.server.model'),
    dateTime = require('node-datetime');

function parseInteger(str, min) {
    return isNaN(parseInt(str, 10)) ? min : parseInt(str, 10);
}

exports.auctionViews = function(req, res) {
    try {
        let params = {
            "start": parseInteger(req.query.start, 0),
            "count": parseInteger(req.query.count, 25),
            "q": req.query.q || "",
            "category": parseInteger(req.query["category-id"], 0),
            "seller": parseInteger(req.query.seller, 0),
            "bidder": parseInteger(req.query.bidder, 0),
            "date": new Date().toISOString()
            //"winner": parseInteger(req.query.winner, 0)
        };
        Auction.auctionViews(params, function (result) {
            if (result.err) {
                res.status(result.status).send(result.err);
            } else {
                for (let i = 0; i < result.length; i++) {
                    result[i].startDateTime = dateTime.create(result[i].startDateTime).now();
                    result[i].endDateTime = dateTime.create(result[i].endDateTime).now();

                    if (result[i].currentBid === null) {
                        result[i].currentBid = 0;
                    }
                }
                res.status(200).json(result);
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
};

exports.auctionCreate = function(req, res) {
    try {
        let params = {
            "categoryId": parseInteger(req.body.categoryId, 0),
            "title": req.body.title || "",
            "description": req.body.description || "",
            "startDateTime": parseInteger(req.body.startDateTime, 0),
            "endDateTime": parseInteger(req.body.endDateTime, 0),
            "reservePrice": parseInteger(req.body.reservePrice, 0),
            "startingBid": parseInteger(req.body.startingBid, 0),
            "creationDate": new Date().toISOString(),
            "token": req.get('X-Authorization') || "",
            "id": 0
        };

        if (params.title === "" || params.startDateTime < new Date().getTime() || params.endDateTime <=
            params.startDateTime) {
            res.status(400).send("Bad request.");
        } else {
            User.auctionAuthenticate(params, function (result) {
                if (result.err) {
                    res.status(result.status).send(result.err);
                } else if (result.token === params.token && params.token !== "") {
                    if (params.reservePrice === 0) {
                        params.reservePrice = null;
                    }

                    if (params.description === "") {
                        params.description = null;
                    }
                    params.startDateTime = new Date(params.startDateTime).toISOString();
                    params.endDateTime = new Date(params.endDateTime).toISOString();
                    params.id = result.id;
                    Auction.auctionCreate(params, function (result) {
                        if (result.err) {
                            res.status(result.status).send(result.err);
                        } else {
                            res.status(201).json({ "id": result.insertId });
                        }
                    });
                } else {
                    res.status(401).send("Unauthorized");
                }
            });
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.auctionViewById = function(req, res) {
    try {
        let params = {
            "auctionId": parseInteger(req.params.id, 0)
        };

        if (params.auctionId !== 0) {
            Auction.auctionViewById(params, function (result) {
                if (result.err) {
                    res.status(result.status).send(result.err);
                } else {
                    result.startDateTime = dateTime.create(result.startDateTime).now();
                    result.endDateTime = dateTime.create(result.endDateTime).now();
                    result.creationDateTime = dateTime.create(result.creationDateTime).now();

                    for (let i = 0; i < result.bids.length; i++) {
                        result.bids[i].datetime = dateTime.create(result.bids[i].datetime).now();
                    }

                    if (result.reservePrice === null) {
                        result.reservePrice = 0;
                    }

                    if (result.description === null) {
                        result.description = "";
                    }
                    res.status(200).json(result);
                }
            });
        } else {
            res.status(400).send("Bad request.");
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.auctionUpdateById = function(req, res) {
    try {
        let params = {
            "auctionId": parseInteger(req.params.id, 0),
            "token": req.get('X-Authorization') || "",
            "id": 0,
            "categoryId": parseInteger(req.body.categoryId, 0),
            "title": req.body.title || "",
            "description": req.body.description || "",
            "startDateTime": parseInteger(req.body.startDateTime, 0),
            "endDateTime": parseInteger(req.body.endDateTime, 0),
            "reservePrice": parseInteger(req.body.reservePrice, 0),
            "startingBid": parseInteger(req.body.startingBid, 0),
            "date": new Date().getTime()
        };

        if (params.startDateTime !== 0) {
            try {
                if (new Date().getTime() < params.startDateTime) {
                    params.startDateTime = new Date(params.startDateTime).toISOString();
                } else {
                    params.startDateTime = 0;
                }
            } catch (err) {
                params.startDateTime = 0;
            }
        } else {
            params.startDateTime = 0;
        }

        if (params.endDateTime !== 0) {
            try {
                if (new Date().getTime() < params.endDateTime) {
                    if (params.startDateTime !== 0) {
                        if (dateTime.create(params.startDateTime).now() < params.endDateTime) {
                            params.endDateTime = new Date(params.endDateTime).toISOString();
                        } else {
                            params.endDateTime = 0;
                        }
                    }
                } else {
                    params.endDateTime = 0;
                }
            } catch (err) {
                params.endDateTime = 0;
            }
        }

        if (params.reservePrice === 0) {
            params.reservePrice = null;
        }

        if (params.description === "") {
            params.description = null;
        }

        if (params.auctionId !== 0) {
            User.auctionAuthenticate(params, function (result) {
                if (result.err) {
                    res.status(result.status).send(result.err);
                } else if (result.token === params.token && params.token !== "") {
                    params.id = result.id;
                    Auction.auctionHasBids(params, function (result) {
                        if (result.err) {
                            res.status(result.status).send(result.err);
                        } else if (result.length === 0) {
                            Auction.auctionUpdateById(params, function (result) {
                                if (result.err) {
                                    res.status(result.status).send(result.err);
                                } else {
                                    res.status(201).json("OK");
                                }
                            });
                        } else {
                            res.status(403).send("Forbidden - bidding has begun on the auction.");
                        }
                    });
                } else {
                    res.status(401).send("Unauthorized");
                }
            });
        } else {
            res.status(400).send("Bad request.");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
};

exports.bidViewById = function(req, res) {
    try {
        let params = {
            "auctionId": parseInteger(req.params.id, 0)
        };

        if (params.auctionId !== 0) {
            Auction.bidViewById(params, function (result) {
                if (result.err) {
                    res.status(result.status).send(result.err);
                } else {
                    for (let i = 0; i < result.length; i++) {
                        result[i].datetime = dateTime.create(result[i].datetime).now();
                    }
                    res.status(200).json(result);
                }
            });
        } else {
            res.status(400).send("Bad request.");
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.bidMakeById = function(req, res) {
    try {
        let params = {
            "amount": parseInteger(req.query.amount, 0),
            "auctionId": parseInteger(req.params.id, 0),
            "token": req.get('X-Authorization') || "",
            "bidDate": new Date().toISOString(),
            "id": 0
        };

        if (params.amount !== "") {
            User.auctionAuthenticate(params, function (result) {
                if (result.err) {
                    res.status(result.status).send(result.err);
                } else if (result.token === params.token && params.token !== "") {
                    params.id = result.id;
                    Auction.bidMakeById(params, function (result) {
                        if (result.err) {
                            res.status(result.status).send(result.err);
                        } else {
                            res.status(201).json("OK");
                        }
                    });
                } else {
                    res.status(401).send("Unauthorized.");
                }
            });
        } else {
            res.status(400).send("Bad request.");
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};