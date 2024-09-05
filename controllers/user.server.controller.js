const
    User = require('../models/users.server.model'),
    Math = require('mathjs');

function parseInteger(str, def) {
    return isNaN(parseInt(str, 10)) ? def : parseInt(str, 10);
}

function testEmail(email) {
    return email.indexOf("@") > 0 && email.length > 2 && email.length <= 320;
}

exports.userCreate = function(req, res) {
    try {
        let params = {
            "username": req.body.username || "",
            "givenName": req.body.givenName || "",
            "familyName": req.body.familyName || "",
            "email": req.body.email || "",
            "password": req.body.password || "", // Should accept an empty string ""
            "token": (Math.random() * 1e20).toString(36)
        };
        if (params.username === "" || params.givenName === "" || params.familyName === "" || !testEmail(params.email)
            || params.password === "") {
            res.status(400).send("Malformed request");
        } else {
            User.isUser(params, function (result) {
                if (result === 1) {
                    User.create(params, function (result) {
                        if (result.err) {
                            res.status(result.status).send(result.err);
                        } else {
                            res.set('X-Authorization', params.token)
                            res.status(201).json({"id": result.insertId});
                        }
                    });
                } else if (result.err) {
                    res.status(result.status).send(result.err);
                } else {
                    res.status(400).send("Malformed request");
                }
            });
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.userLogin = function(req, res) {
    try {
        let params = {
            "username": req.query.username || "",
            "email": req.query.email || "",
            "password": req.query.password || "",
            "token": (Math.random() * 1e20).toString(36)
        };

        if ((params.username.length > 0) || (testEmail(params.email))) {
            User.logIn(params, function (result) {
                if (result.err) {
                    res.status(result.status).send(result.err)
                } else {
                    res.set('X-Authorization', params.token);
                    res.status(200).json({"id": result, "token": params.token});
                }
            });
        } else {
            res.status(400).send("Invalid username/email/password supplied");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
};

exports.userLogout = function(req, res) {
    try {
        let params = {
            "token": req.get('X-Authorization') || ""
        };

        if (params.token === "") {
            res.status(401).send("Unauthorized");
        } else {
            User.logOut(params, function (result) {
                if (result.err) {
                    res.status(result.status).send(result.err)
                } else {
                    res.set('X-Authorization', "");
                    params.token = "";
                    res.status(200).send("OK");
                }
            });
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.userViewById = function(req, res) {
    try {
        let params = {
            "id": parseInteger(req.params.id, 0),
            "token": req.get('X-Authorization') || ""
        };

        if (params.id === 0) {
            res.status(404).send("Not found");
        } else {
            User.tokenAuthorized(params, function (result) {
                if (result.length === 1 && result[0].id === params.id) {
                    User.viewByIdAuthorized(params, function (result) {
                        if (result.err) {
                            res.status(result.status).send(result.err);
                        } else {
                            res.status(200).json(result[0]);
                        }
                    });
                } else if (result.length === 1) {
                    User.viewById(params, function (result) {
                        if (result.err) {
                            res.status(result.status).send(result.err);
                        } else {
                            res.status(200).json(result[0]);
                        }
                    });
                } else if (result.err) {
                    res.status(result.status).send(result.err);
                } else {
                    res.status(401).send("Unauthorized");
                }
            });
        }
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.userUpdateById = function(req, res) {
    try {
        let params = {
            "id": parseInteger(req.params.id, 0),
            "token": req.get('X-Authorization') || "",
            "username": req.body.username || "",
            "givenName": req.body.givenName || "",
            "familyName": req.body.familyName || "",
            "email": req.body.email || "",
            "password": req.body.password || ""
        };

        if (!testEmail(params.email)) { params.email = ""; }
        if (params.token === "") {
            res.status(401).send("Unauthorized");
        } else {
            User.tokenAuthorized(params, function (result) {
                if (result.length === 1 && result[0].id === params.id) {
                    User.updateById(params, function (result) {
                        if (result.err) {
                            res.status(result.status).send(result.err);
                        } else {
                            res.status(201).send("OK");
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