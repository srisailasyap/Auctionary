const
    db = require('../config/db');

exports.tokenAuthorized = function(params, done) {
    let values = [params.token];

    db.get_pool().query("SELECT user_id as id FROM auction_user WHERE user_token = ?", values,
        function (err, result) {
        if (err) return done({err:"Internal server error", status:500});
        return done(result);
    });
};

exports.isUser = function(params, done) {
    let values = [params.username, params.email];

    db.get_pool().query("SELECT user_id FROM auction_user WHERE user_username = ? OR user_email = ?", values,
        function (err, result) {
        if (err) return done({err:"Internal server error", status:500});
        if (result.length === 1) return done(0);
        return done(1);
    });
};

exports.auctionAuthenticate = function(params, done) {
    let values = [params.token];

    db.get_pool().query("SELECT user_id as id, user_token as token FROM auction_user WHERE user_token = ?", values,
        function(err, result) {
        if (err) return done({err:"Internal server error", status:500});
        if (result.length === 0) return done(0);
        return done(result[0]);
    });
};

exports.create = function(params, done) {
    db.get_pool().query("SELECT * FROM auction_user WHERE user_username = ? OR user_email = ?",
        [params.username, params.email], function(err, result) {
        if (err) return done({err:"Internal server error", status:500});
        if (result.length !== 0) return done({err:"Malformed request", status:400});
        let values = [[params.username, params.givenName, params.familyName, params.email, params.password, params.token]];

        db.get_pool().query("INSERT INTO auction_user (user_username, user_givenname, user_familyname, user_email," +
            " user_password, user_token) VALUES (?)", values, function(err, result) {
            if (err) return done({err:"Internal server error", status:500});
            done(result);
        });
    });
};

exports.viewByIdAuthorized = function(params, done) {
    let values = [params.id, params.token];

    db.get_pool().query('SELECT user_username as username, user_givenname as givenName, user_familyname as ' +
        'familyName, user_email as email, user_accountbalance as accountBalance FROM auction_user WHERE user_id = ?' +
        ' AND user_token = ?', values, function(err, result) {
        if (err) return done({err:"Internal server error", status:500});
        if (result.length === 0) return done({err:"Not found", status:404});
        done(result);
    });
};

exports.viewById = function(params, done) {
    try {
        let searchId = params.id;

        db.get_pool().query('SELECT user_username as username, user_givenname as givenName, user_familyname as ' +
            'familyName FROM auction_user WHERE user_id = ?', [searchId], function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            if (result.length === 0) return done({err: "Not found", status: 404});
            done(result);
        });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};

exports.updateById = function(params, done) {
    try {
        let userId = [params.id], values, field;

        for (let i = 2; i <= 7; i++) {
            values = [params[Object.keys(params)[i]], userId];
            field = Object.keys(params)[i];

            switch (field) {
                case "username":
                    if (values[0].length > 0) {
                        db.get_pool().query('UPDATE auction_user SET user_username = ? WHERE user_id = ?', values,
                            function (err, result) {
                                if (err) return done({ERROR: "Internal server error", status: 500});
                            });
                    }
                    break;
                case "givenName":
                    if (values[0].length > 0) {
                        db.get_pool().query('UPDATE auction_user SET user_givenname = ? WHERE user_id = ?', values,
                            function (err, result) {
                                if (err) return done({ERROR: "Internal server error", status: 500});
                            });
                    }
                    break;
                case "familyName":
                    if (values[0].length > 0) {
                        db.get_pool().query('UPDATE auction_user SET user_familyname = ? WHERE user_id = ?', values,
                            function (err, result) {
                                if (err) return done({ERROR: "Internal server error", status: 500});
                            });
                    }
                    break;
                case "email":
                    if (values[0].length > 0) {
                        db.get_pool().query('UPDATE auction_user SET user_email = ? WHERE user_id = ?', values,
                            function (err, result) {
                                if (err) return done({ERROR: "Internal server error", status: 500});
                            });
                    }
                    break;
                case "password":
                    if (values[0].length > 0)
                    db.get_pool().query('UPDATE auction_user SET user_password = ? WHERE user_id = ?', values,
                        function (err, result) {
                            if (err) return done({ERROR: "Internal server error", status: 500});
                    });
                    break;
            }
        }
        done(1);
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};

exports.logIn = function(params, done) {
    try {
        let search = params.username, email = params.email, password = params.password, token = params.token, sql;

        if (search.length === 0 && email.length > 0) {
            search = email;
            sql = "SELECT user_id as id FROM auction_user WHERE user_email = ? AND user_password = ?";
        } else {
            sql = "SELECT user_id as id FROM auction_user WHERE user_username = ? AND user_password = ?";
        }

        db.get_pool().query(sql, [search, password], function (err, result) {
            if (err) return done({err: "Internal server error", status: 500});
            if (result.length !== 1) return done({ERROR: "Invalid username/email/password supplied", status: 400});
            let id = result[0].id;

            db.get_pool().query("UPDATE auction_user SET user_token = ? WHERE user_id = ?", [token, id],
                function (err, res) {
                    if (err) return done({err: "Internal server error", status: 500});
                    done(id);
                });
        });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};

exports.logOut = function(params, done) {
    try {
        let token = params.token, new_token = null;

        db.get_pool().query('UPDATE auction_user SET user_token = ? WHERE user_token = ?', [new_token, token],
            function (err, result) {
                if (err) return done({err: "Internal server error", status: 500});
                if (result.affectedRows !== 1) return done({err: "Unauthorized", status: 401});
                done(1);
            });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};