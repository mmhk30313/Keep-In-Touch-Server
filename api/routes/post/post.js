const express = require("express");
const router = express.Router();
const fs = require('fs');
const User = require("../../models/User/User");
const UserRole = require("../../models/User/UserRole");
const { authenticateJWT } = require("../auth/auth");

router.get('/post/get/all', (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: "Error getting users",
                error: err
            });
        }
        return res.status(200).json({
            status: true,
            message: "Users fetched successfully",
            users: users
        });
    });
})

module.exports = router;