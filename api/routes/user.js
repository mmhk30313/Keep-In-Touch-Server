const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
require('./../../configs/env.config');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
// Just simple info for root api endpoint
router.get("/get/users", (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            res.json(err);
        } else {
            res.json(users);
        }
    });
});

// Update a user
router.post("/update/user", (req, res) => {
    User.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, user) => {
        if (err) {
            res.json({
                success: false,
                message: err
            });
        } else {
            res.json({
                success: true,
                message: "User updated successfully",
                user
            });
        }
    });
});

// Create a user / Register a user / Signup a user
router.post("/signup/user", async (req, res) => {
    const { username, email, mobile, password, confirm_password } = req.body;
    if(password !== confirm_password) {
        res.json({
            success: false,
            message: "Passwords do not match"
        });
    } else if(!email){
        res.json({
            success: false,
            message: "Email is required"
        });
    } else {
        try {
            const salt = await bcrypt.genSalt(10);
            // console.log({salt});
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password = hashedPassword;
            const cur_user = req.body;
            // console.log({cur_user});
            delete cur_user.confirm_password;
            const newUser = new User(cur_user);
            const result = await newUser.save();
            // console.log({result});
            if (!result) {
                res.status(400).json({
                    success: false,
                    message: "User not created", 
                });
            } else {
                const user = result;
                // console.log({user});
                // console.log({accessTokenSecret});
                // Generate an access token
                const { username, email, role, postList, img } = user;
                const tokenObject = { email, role };
                username && (tokenObject.username = username);
                const accessToken = jwt.sign(tokenObject, accessTokenSecret);
                // console.log({accessToken});
                delete user.password;
                // console.log({user});
                res.status(200.).json({
                    success: true,
                    message: "User created",
                    user: { username, email, role, postList, img },
                    accessToken,
                });
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
    }
});

//LOGIN
router.post("/user/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(!user) {
            return res.status(404).json({massage: "User not found", statusCode: 404});
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) {
            return res.status(400).json({message: "Wrong password", statusCode: 404});
        }
        console.log({user: user?._doc});
        return res.status(200).json({...user?._doc, userId: user?._id})
    } catch (err) {
      res.status(500).json(err)
    }
  });

module.exports = router;