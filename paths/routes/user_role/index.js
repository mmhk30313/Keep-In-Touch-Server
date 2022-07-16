const express = require("express");
const { create_user_role, find_all_user_roles, find_user_role, update_user_role, make_admin, delete_user_role } = require("../../../api/controllers/user_role.js/index.js");
const router = express.Router();

// User role create only for admin
router.post('/user-role/create', create_user_role);

// Get all user-roles only from frontend
router.get('/user-role/all', find_all_user_roles);

// Get all user-roles only for admin
// router.get('/user-role/all', async(req, res) => {
//     try {
//         const user_roles = await UserRole.find({name: {$nin: ["Admin", "admin"]}})
//                            .select("-_id role_id name slug");
        
//         console.log("====284====",{user_role_length: user_roles?.length});
//         if(user_roles?.length){
//             return res.status(200).json({
//                 status: true,
//                 data: user_roles,
//             })
//         }
//         return res.status(400).json({
//             status: false,
//             message: "There is no user role!!!"
//         })

//     } catch (error) {
//         return res.status(404).json({
//             status: false,
//             message: error?.message || "Server error!!!"
//         })
//     }
// });

// find user_role by user role_id for admin
router.get('/user-role/find-one', find_user_role);

// User role update only for admin
router.post('/user-role/update', update_user_role);

// User role update only for admin
router.delete('/user-role/delete', delete_user_role);

// Admin can make a user as an admin
router.post('/user-make/admin', make_admin);

module.exports = router;
