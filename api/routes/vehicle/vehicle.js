const express = require("express");
const router = express.Router();
const fs = require('fs');
const User = require("../../models/User/User");
const UserRole = require("../../models/User/UserRole");
const Vehicle = require('../../routes/vehicle/vehicle');
const { authenticateJWT } = require("../auth/auth");

// Vehicle add by technician
router.post('/vehicle/add', async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Technician" || req?.user?.role_id === 2){

        }
        return res.status(403).json({
            status: false,
            message: "User isn't authorized to add tow category vehicle!!!"
        })
    }
});
module.exports = router;