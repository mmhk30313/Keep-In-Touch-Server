const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
require('../../../configs/env.config');
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

// User Login for getting token
const authenticateJWT = (req, res) => {
    const authHeader = req?.headers?.authorization;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.status(403).json({
                    status: false,
                    message: "User is unauthorized"
                });
            }
            
            req.user = user;
            req.auth = true;
            console.log({user: user});
            console.log("====Token====", token);
            // next();
        });
    } else {
        res.status(401).json({
            status: false,
            message: "User is unauthorized"
        })
    }
};

exports.authenticateJWT = authenticateJWT;