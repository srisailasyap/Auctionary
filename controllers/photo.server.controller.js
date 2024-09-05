const
    Photo = require('../models/photos.server.model'),
    User = require('../models/users.server.model'),
    path = require('path'),
    dirName = path.dirname(require.main.filename),
    fs = require("fs");

function parseInteger(str, min) {
    return !isNaN(parseInt(str, 10)) && str >= min ? parseInt(str, 10) : "";
}

exports.photoViewURIs = function(req, res) {
    try {
        let params = {
            "auctionId": parseInteger(req.params.id, 0),
            "type": req.get('Content-Type') || ""
        };
        if (params.auctionId !== 0) {
            Photo.primaryPhotoViewURIs(params, function (result) {
                if (result.err) {
                    res.status(result.status).send(result.err);
                } else if (result[0].auction_primaryphoto_URI === null) {
                    if (params.type === 'image/jpeg') {
                        res.set('Content-Type', "image/jpeg");
                        res.status(200).sendFile(dirName + "/Images/default.jpeg");
                    } else if (params.type === 'image/png') {
                        res.set('Content-Type', "image/png");
                        res.status(200).sendFile(dirName + "/Images/default.png");
                    }
                } else {
                    res.set('Content-Type', "image/" + result[0].auction_primaryphoto_URI.split(".")[1]);
                    res.status(200).sendFile(dirName + result[0].auction_primaryphoto_URI);
                }
            });
        } else {
            res.status(400).send("Bad request.");
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.photoPost = function(req, res) {
    try {
        let auctionId = parseInteger(req.params.id, 0);
        let type = req.get('Content-Type') || "";
        let token = req.get('X-Authorization') || "";

        if ((type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') && auctionId !== 0) {
            if (type === 'image/png') {
                type = 'Auction' + auctionId + '.png';
            } else if (type === 'image/jpeg') {
                type = 'Auction' + auctionId + '.jpeg';
            } else {
                type = 'Auction' + auctionId + '.jpg';
            }
            User.auctionAuthenticate(params, function (result) {
                if (result.err) {
                    res.status(result.status).send(result.err);
                } else if (result.token === params.token && params.token !== "") {
                    params.id = result.id;
                    let params = {
                        "auctionId": auctionId,
                        "image": '/Images/' + type,
                        "token": token,
                        "date": new Date().getTime(),
                        "id": 0
                    };
                    req.pipe(fs.createWriteStream(params.image));
                    Photo.primaryPhotoPost(params, function (result) {
                        if (result.err) {
                            fs.unlink("."+params.image);
                            res.status(result.status).send(result.err);
                        } else {
                            res.status(201).send("OK");
                        }
                    });
                } else {
                    fs.unlink("."+params.image);
                    res.status(401).send("Unauthorized");
                }
            });
        } else {
            res.status(400).send("Bad request.");
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.photoDelete = function(req, res) {
    try {
        let params = {
            "auctionId": parseInteger(req.params.id, 0),
            "token": req.get('X-Authorization') || "",
            "date": new Date().getTime(),
            "id": 0
        };
        User.auctionAuthenticate(params, function (result) {
            if (result.err) {
                res.status(result.status).send(result.err);
            } else if (result.token === params.token && params.token !== "") {
                params.id = result.id;
                Photo.primaryPhotoDelete(params, function (result) {
                    if (result.err) {
                        res.status(result.status).send(result.err);
                    } else {
                        fs.unlink("."+result[0].link);
                        res.status(201).send("OK");
                    }
                });
            } else {
                res.status(401).send("Unauthorized");
            }
        });
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};