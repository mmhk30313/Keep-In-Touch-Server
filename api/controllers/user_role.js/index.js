const fs = require('fs');
const User = require("../../models/User/User");
const UserRole = require("../../models/User/UserRole");

exports.create_user_role = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin" || req?.user?.role_id === 2){
            try {
                const {role_id, name, slug} = req?.body;
                const already_exits_role = await UserRole.findOne({role_id});
                if(!already_exits_role?._doc?.role_id){
                    // console.log("=====line:142:====", {already_exits_role});
                    const user_role_body = {role_id, name};
                    slug && (user_role_body.slug = slug);
                    const newUserRole = new UserRole(user_role_body);
                    const role_res = await newUserRole.save();
                    // console.log({role_res});
                    if(role_res){
                        return res.status(200).json({
                            status: true,
                            message: "The user role is successfully created!!!",
                            data: role_res?._doc,
                        });
                    }
                    return res.status(403).json({
                        status: false,
                        message: "The user role isn't created!!!"
                    })
                }
                return res.status(400).json({
                    status: false,
                    message: "The role is already exists by this role_id"
                })
    
            } catch (error) {
                return res.status(404).json({
                    status: false,
                    message: error?.message || "Server error!!!"
                })
            }
        }
        return res.status(401).json({
            status: false,
            message: "User isn't authorized to create user role!!!"
        })
    }
}

exports.find_all_user_roles = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        // const {email: auth_user_email} = req?.user;
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
            try {
                const user_roles = await UserRole.find({})
                                   .select("-_id role_id name slug");
                
                console.log("====246====",{user_role_length: user_roles?.length});
                if(user_roles?.length){
                    return res.status(200).json({
                        status: true,
                        data: user_roles,
                    })
                }
                return res.status(400).json({
                    status: false,
                    message: "There is no user role!!!"
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
            message: "User isn't authorized to to find user!!!"
        })
    }else {
        return res.status(401).json({
            status: false,
            message: "User isn unauthorized!!!"
        })
    }
    
    
}

exports.find_user_role = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
            try {
                let {role_id} = req?.query;
                const user_role = await UserRole.findOne({role_id})
                                .select("_id role_id name slug");
                
                if(user_role){
                    return res.status(200).json({
                        status: true,
                        data: user_role,
                    })
                }
                return res.status(400).json({
                    status: false,
                    message: "There is no user role by this role_id!!!"
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
            message: "User isn't authorized to to find user role!!!"
        })
    }else{
        return res.status(400).json({
            status: false,
            message: "User isn unauthorized!!!"
        })
    }
}

exports.update_user_role = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
        // if(user_role_res?.name === "Admin" || user_role_res?.name === "admin"){
            try {
                const {role_id, name, slug} = req?.body;
                const already_exits_role = await UserRole.findOne({role_id});
                if(already_exits_role?._doc?.role_id){
                    // console.log("=====line:142:====", {already_exits_role});
                    const user_role_body = {role_id, name};
                    slug && (user_role_body.slug = slug);
                    const role_res = await UserRole.updateOne({role_id}, user_role_body);
                    // console.log({role_res});
                    if(role_res){
                        return res.status(200).json({
                            status: true,
                            message: "The user role is successfully updated!!!",
                            data: role_res?._doc,
                        });
                    }
                    return res.status(403).json({
                        status: false,
                        message: "The user role isn't created!!!"
                    })
                }
                return res.status(400).json({
                    status: false,
                    message: "The role isn't exists to update by this role_id"
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
    }else{
        return res.status(400).json({
            status: false,
            message: "User isn unauthorized!!!"
        })
    }
}

exports.delete_user_role = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
        // if(user_role_res?.name === "Admin" || user_role_res?.name === "admin"){
            try {
                let {role_id} = req?.body;
                if(!role_id){
                    role_id = req?.params?.role_id; 
                }
                if(!role_id){
                    role_id = req?.query?.role_id;
                }
                const already_exits_role = await UserRole.findOne({role_id});
                if(already_exits_role?._doc?.role_id){
                    const role_res = await UserRole.deleteOne({role_id});
                    // console.log({role_res});
                    if(role_res){
                        return res.status(200).json({
                            status: true,
                            message: "The user role is successfully deleted!!!",
                        });
                    }
                    return res.status(403).json({
                        status: false,
                        message: "The user role isn't deleted!!!"
                    })
                }
                return res.status(400).json({
                    status: false,
                    message: "The user role isn't exists to delete by this role_id"
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
    }else{
        return res.status(40).json({
            status: false,
            message: "User isn't authorized to update user role!!!"
        })
    }
}

exports.make_admin = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
        // if(user_role_res?.name === "Admin" || user_role_res?.name === "admin"){
            try {
                let {email} = req?.body;
                const exits_user = await User.findOne({email});
                if(exits_user){
                    const role_res = await User.updateOne({email}, {role_id: user_role_res?.role_id});
                    // console.log({role_res});
                    if(role_res){
                        return res.status(200).json({
                            status: true,
                            message: "The user is successfully made an admin!!!",
                        });
                    }
                    return res.status(403).json({
                        status: false,
                        message: "The user isn't made an admin!!!"
                    })
                }
                return res.status(400).json({
                    status: false,
                    message: "The user isn't exists to make admin by this email"
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
            message: "User isn't authorized to make admin user!!!"
        })
    }else{
        return res.status(400).json({
            status: false,
            message: "User isn unauthorized!!!"
        })
    }

}