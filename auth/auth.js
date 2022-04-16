const jwt = require('jsonwebtoken');
require('./configs/env.config');
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.st
    }
};

exports.authenticateJWT = authenticateJWT;