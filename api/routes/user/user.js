const express = require("express");
const router = express.Router();
const fs = require('fs');
const User = require("../../models/User/User");
const UserRole = require("../../models/User/UserRole");
// const user_role_enum = require("../../enums/user_role_enum");
const { authenticateJWT } = require("../auth/auth");

// User update only for user
router.post('/user/update', async (req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        const {body: user_body, files} = req;
        let {email: user_email} = user_body;
        delete user_body.email;
        // console.log({user_body, email});
        if(user_email != req?.user?.email){
            user_email = req?.user?.email;
            return res.status(404).json({
                status: false,
                message: "User is unauthorized!!!"
            })
        }
        try {
            let img_folder = user_email;
            const img_name = "avatar.png";
            if(files){
                const root_url = process.env.DEV_URL || process.env.PROD_URL;
                img_path = `${root_url}/api/static/${img_folder}/${img_name}`;
                // console.log({img_path});
                user_body.avatar = img_path;
            }
            const result = await User.updateOne({email: user_email}, user_body, {returnOriginal: false});
            if(result?.modifiedCount){
                if(files){
                    let root_path = "/uploads/" + img_folder;
                    if(!fs.existsSync(appRoot+"/uploads")){
                        fs.mkdirSync(appRoot+"/uploads");
                    }
                    const uploadedFile = files?.uploadedImg || files?.avatar;
                    if(!fs.existsSync(appRoot+root_path)){
                        fs.mkdirSync(appRoot+root_path);
                    }
                    root_path += "/" + img_name;
                    // console.log({root_path});
                    const uploadPath = appRoot + root_path;
                    await uploadedFile.mv(uploadPath);
                }
                const updated_user = await User.findOne({email: user_email}).select("-_id first_name email avatar");
                // console.log({updated_user});
                return res.status(404).json({
                    status: true,
                    message: "User is updated!!!",
                    data: updated_user,
                });

            }
            return res.status(404).json({
                status: false,
                message: "User isn't found to update!!!"
            });
        } catch (error) {
            return res.status(503).json({
                success: false,
                message: error?.message || "Something wrong to update this user"
            })
            
        }
    }
});

// Get all users only for admin
router.get('/user/all', async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        try {
            const users = await User.find({})
                            .select("_id user_name avatar address gender phone email lat lan isVerified role_id is_active email_verified_at");
            
            console.log({user_length: users?.length});
            if(users?.length){
                return res.status(200).json({
                    status: true,
                    data: users,
                })
            }
            return res.status(400).json({
                status: false,
                message: "There is no user!!!"
            })

        } catch (error) {
            return res.status(404).json({
                status: false,
                message: error?.message || "Server error!!!"
            })
        }
    }
});

// find user by user email for admin and that user
router.get('/user/find-one', async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        let {email} = req?.query;
        try {
            const user = await User.findOne({email})
                            .select("_id user_name avatar address gender phone email lat lan is_active email_verified_at");
            
            console.log({user_length: user});
            if(user){
                return res.status(200).json({
                    status: true,
                    data: user,
                })
            }
            return res.status(400).json({
                status: false,
                message: "There is no user by this email!!!"
            })

        } catch (error) {
            return res.status(404).json({
                status: false,
                message: error?.message || "Server error!!!"
            })
        }
    }
});

// User delete only for admin
router.delete('/user/delete', async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin" || req?.user?.role_id === 30313){

            try {
                let {email} = req?.body;
                if(!email){
                    email = req?.params?.email; 
                }
                if(!role_id){
                    email = req?.query?.email;
                }
                const exits_user_res = await User.findOne({email});
                if(exits_user_res?._doc?.email){
                    const user_delete_res = await User.deleteOne({email});
                    // console.log({role_res});
                    if(user_delete_res){
                        return res.status(200).json({
                            status: true,
                            message: "The user is successfully deleted!!!",
                        });
                    }
                    return res.status(403).json({
                        status: false,
                        message: "The user isn't deleted!!!"
                    })
                }
                return res.status(400).json({
                    status: false,
                    message: "The user isn't exists to delete by this email"
                })
    
            } catch (error) {
                return res.status(404).json({
                    status: false,
                    message: error?.message || "Server error!!!"
                })
            }
        }
        return res.status(400).json({
            status: false,
            message: "User isn't authorized to update user role!!!"
        })
    }
});

// User role create only for admin
// router.post('/user-role/create', async(req, res) => {
//     await authenticateJWT(req, res);
//     if(req?.auth){
//         if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin" || req?.user?.role_id === 30313){
//             try {
//                 const {role_id, name, slug} = req?.body;
//                 const already_exits_role = await UserRole.findOne({role_id});
//                 if(!already_exits_role?._doc?.role_id){
//                     // console.log("=====line:142:====", {already_exits_role});
//                     const user_role_body = {role_id, name};
//                     slug && (user_role_body.slug = slug);
//                     const newUserRole = new UserRole(user_role_body);
//                     const role_res = await newUserRole.save();
//                     // console.log({role_res});
//                     if(role_res){
//                         return res.status(200).json({
//                             status: true,
//                             message: "The user role is successfully created!!!",
//                             data: role_res?._doc,
//                         });
//                     }
//                     return res.status(403).json({
//                         status: false,
//                         message: "The user role isn't created!!!"
//                     })
//                 }
//                 return res.status(400).json({
//                     status: false,
//                     message: "The role is already exists by this role_id"
//                 })
    
//             } catch (error) {
//                 return res.status(404).json({
//                     status: false,
//                     message: error?.message || "Server error!!!"
//                 })
//             }
//         }
//         return res.status(400).json({
//             status: false,
//             message: "User isn't authorized to create user role!!!"
//         })
//     }
// });

// Get all user-roles only from frontend
// router.get('/user-role/admin/all', async(req, res) => {
//     await authenticateJWT(req, res);
//     if(req?.auth){
//         // const {email: auth_user_email} = req?.user;
//         if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
//             try {
//                 const user_roles = await UserRole.find({})
//                                    .select("-_id role_id name slug");
                
//                 console.log("====246====",{user_role_length: user_roles?.length});
//                 if(user_roles?.length){
//                     return res.status(200).json({
//                         status: true,
//                         data: user_roles,
//                     })
//                 }
//                 return res.status(400).json({
//                     status: false,
//                     message: "There is no user role!!!"
//                 })
        
//             } catch (error) {
//                 return res.status(404).json({
//                     status: false,
//                     message: error?.message || "Server error!!!"
//                 })
//             }
//         }
//         return res.status(400).json({
//             status: false,
//             message: "User isn't authorized to to find user!!!"
//         })
//     }
    
// });

//  Get all user-roles only for admin
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
// router.get('/user-role/find-one', async(req, res) => {
//     await authenticateJWT(req, res);
//     if(req?.auth){
//         if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
//             try {
//                 let {role_id} = req?.query;
//                 const user_role = await UserRole.findOne({role_id})
//                                 .select("_id role_id name slug");
                
//                 if(user_role){
//                     return res.status(200).json({
//                         status: true,
//                         data: user_role,
//                     })
//                 }
//                 return res.status(400).json({
//                     status: false,
//                     message: "There is no user role by this role_id!!!"
//                 })
    
//             } catch (error) {
//                 return res.status(404).json({
//                     status: false,
//                     message: error?.message || "Server error!!!"
//                 })
//             }
//         }
//         return res.status(400).json({
//             status: false,
//             message: "User isn't authorized to to find user role!!!"
//         })
//     }
// });

// User role update only for admin
// router.post('/user-role/update', async(req, res) => {
//     await authenticateJWT(req, res);
//     if(req?.auth){
//         if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
//         // if(user_role_res?.name === "Admin" || user_role_res?.name === "admin"){
//             try {
//                 const {role_id, name, slug} = req?.body;
//                 const already_exits_role = await UserRole.findOne({role_id});
//                 if(already_exits_role?._doc?.role_id){
//                     // console.log("=====line:142:====", {already_exits_role});
//                     const user_role_body = {role_id, name};
//                     slug && (user_role_body.slug = slug);
//                     const role_res = await UserRole.updateOne({role_id}, user_role_body);
//                     // console.log({role_res});
//                     if(role_res){
//                         return res.status(200).json({
//                             status: true,
//                             message: "The user role is successfully updated!!!",
//                             data: role_res?._doc,
//                         });
//                     }
//                     return res.status(403).json({
//                         status: false,
//                         message: "The user role isn't created!!!"
//                     })
//                 }
//                 return res.status(400).json({
//                     status: false,
//                     message: "The role isn't exists to update by this role_id"
//                 })
    
//             } catch (error) {
//                 return res.status(404).json({
//                     status: false,
//                     message: error?.message || "Server error!!!"
//                 })
//             }
//         }
//         return res.status(400).json({
//             status: false,
//             message: "User isn't authorized to update user role!!!"
//         })
//     }
// });

// User role update only for admin
// router.delete('/user-role/delete', async(req, res) => {
//     await authenticateJWT(req, res);
//     if(req?.auth){
//         if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
//         // if(user_role_res?.name === "Admin" || user_role_res?.name === "admin"){
//             try {
//                 let {role_id} = req?.body;
//                 if(!role_id){
//                     role_id = req?.params?.role_id; 
//                 }
//                 if(!role_id){
//                     role_id = req?.query?.role_id;
//                 }
//                 const already_exits_role = await UserRole.findOne({role_id});
//                 if(already_exits_role?._doc?.role_id){
//                     const role_res = await UserRole.deleteOne({role_id});
//                     // console.log({role_res});
//                     if(role_res){
//                         return res.status(200).json({
//                             status: true,
//                             message: "The user role is successfully deleted!!!",
//                         });
//                     }
//                     return res.status(403).json({
//                         status: false,
//                         message: "The user role isn't deleted!!!"
//                     })
//                 }
//                 return res.status(400).json({
//                     status: false,
//                     message: "The user role isn't exists to delete by this role_id"
//                 })
    
//             } catch (error) {
//                 return res.status(404).json({
//                     status: false,
//                     message: error?.message || "Server error!!!"
//                 })
//             }
//         }
//         return res.status(400).json({
//             status: false,
//             message: "User isn't authorized to update user role!!!"
//         })
//     }
// });

// Admin can make a user as an admin
// router.post('/user-make/admin', async(req, res) => {
//     await authenticateJWT(req, res);
//     if(req?.auth){
//         if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
//         // if(user_role_res?.name === "Admin" || user_role_res?.name === "admin"){
//             try {
//                 let {email} = req?.body;
//                 const exits_user = await User.findOne({email});
//                 if(exits_user){
//                     const role_res = await User.updateOne({email}, {role_id: user_role_res?.role_id});
//                     // console.log({role_res});
//                     if(role_res){
//                         return res.status(200).json({
//                             status: true,
//                             message: "The user is successfully made an admin!!!",
//                         });
//                     }
//                     return res.status(403).json({
//                         status: false,
//                         message: "The user isn't made an admin!!!"
//                     })
//                 }
//                 return res.status(400).json({
//                     status: false,
//                     message: "The user isn't exists to make admin by this email"
//                 })
    
//             } catch (error) {
//                 return res.status(404).json({
//                     status: false,
//                     message: error?.message || "Server error!!!"
//                 })
//             }
//         }
//         return res.status(400).json({
//             status: false,
//             message: "User isn't authorized to make admin user!!!"
//         })
//     }

// });

module.exports = router;
