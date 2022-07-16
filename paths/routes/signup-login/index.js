const express = require("express");
const router = express.Router();
const { login_user, sign_up_user, verify_user, resend_otp, direct_verify_user, logout_user } = require("../../../api/controllers/signup-login");

// User login 
router.post('/user/login', login_user);

// User logout
router.post('/user/logout', logout_user);

// User sign_up
router.post('/user/signup', sign_up_user);

// User verification api for otp code
router.get('/user-verify', verify_user);

// User resend otp
router.get('/user/otp-resend', resend_otp);

// Direct link api for verification 
router.get('/user/verify', direct_verify_user);

module.exports = router;