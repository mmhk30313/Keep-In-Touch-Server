const User = require("../../models/User/User");
const fs = require('fs');
const UserRole = require("../../models/User/UserRole");
const { authenticateJWT } = require("../auth");
const uploadFile = require("../all_global_controllers/upload");
const deleteFile = require("../all_global_controllers/delete");

// User update only for user
exports.user_update_by_user = async (req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        const {body: user_body, files} = req;
        const user_email = req?.user?.email;
        try {
            let img_folder = user_email;
            const random_val = Number(new Date());
            const img_name = `avatar-${random_val}`;
            // const prev_avatar = req?.user?.avatar;
            const img_file = files?.image || files?.img || files?.uploadedImg || files?.avatar;
            if(files){
                const root_url = process.env.DEV_URL || process.env.PROD_URL;
                img_path = `${root_url}/api/static/${img_folder}/${img_name}.png`;
                // console.log({img_path});
                user_body.avatar = img_path;
            }
            const result = await User.findOneAndUpdate({email: user_email}, user_body, {returnOriginal: true}).select("-password -remember-token");
            console.log({result});
            if(result){
                if(files){
                    let root_path = "/" + img_folder;
                    const image_url = await uploadFile(root_path, img_file, img_name, result?.avatar);
                    console.log({image_url});
                    // if(!fs.existsSync(appRoot+"/uploads")){
                    //     fs.mkdirSync(appRoot+"/uploads");
                    // }
                    // const uploadedFile = files?.uploadedImg || files?.avatar;
                    // if(!fs.existsSync(appRoot+root_path)){
                    //     fs.mkdirSync(appRoot+root_path);
                    // }
                    // root_path += "/" + img_name;
                    // // console.log({root_path});
                    // const uploadPath = appRoot + root_path;
                    // await uploadedFile.mv(uploadPath);
                }
                const updated_user = await User.findOne({email: user_email}).select("-password -remember_token");
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
    }else{
        return res.status(401).json({
            status: false,
            message: "User is unauthorized!!!"
        })
    }
};

// User will find his/her details by accessToken
exports.find_user_details = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        let email = req?.query?.email || req?.user?.email;
        console.log({email});
        try {
            const user = await User.findOne({email})
                            .select("-password -remember_token");
            
            if(user){
                return res.status(200).json({
                    status: true,
                    data: user,
                });
            }
            return res.status(404).json({
                status: false,
                message: "There is no user by this email!!!"
            })

        } catch (error) {
            return res.status(404).json({
                status: false,
                message: error?.message || "Server error!!!"
            })
        }
    }else{
        return res.status(401).json({
            status: false,
            message: "User is unauthorized!!!"
        })
    }
}

// Find all users
exports.find_all_users = async(req, res) => {
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
    }else{
        return res.status(401).json({
            status: false,
            message: "User is unauthorized!!!"
        })
    }
}

// Find user by user email
exports.find_user_by_email = async (req, res) => {
    await authenticateJWT(req, res);
    if (req?.auth) {
        const { email: user_email } = req?.body;
        console.log({ user_email: req?.body });
        const  { email: query_email } = req?.query;
        const {email: param_email} = req?.params;
        const email = user_email || query_email || param_email;
        try {
            const findObj = {email};
            console.log({findObj});
            const user = await User.findOne(findObj)
                .select("-password -remember_token");

            console.log({ user_length: user });
            if (user) {
                return res.status(200).json({
                    status: true,
                    data: user,
                })
            }
            return res.status(404).json({
                status: false,
                message: "There is no user by this email!!!"
            })

        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error?.message || "Server error!!!"
            })
        }
    }else{
        return res.status(401).json({
            status: false,
            message: "User is unauthorized to find user!!!",
        });
    }
}

// User make admin by admin
exports.make_admin = async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth && req?.user?.role_id === 1){
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
            return res.status(404).json({
                status: false,
                message: "The user isn't exists to make admin by this email"
            })

        } catch (error) {
            return res.status(404).json({
                status: false,
                message: error?.message || "Server error!!!"
            })
        }
    } else{
        return res.status(401).json({
            status: false,
            message: "User is unauthorized!!!"
        })
    }

}

// User delete
exports.delete_user = async (req, res) => {
    await authenticateJWT(req, res);
    if (req?.auth && req?.user?.role_id === 1) {
        try {
            let {email} = req?.query;
            console.log(email);
            // const exits_user_res = await User.findOne({ email });
            // console.log({exits_user_res});
            const user_delete_res = await User.findOneAndDelete({ email });
            console.log({user_delete_res});
            if (user_delete_res) {
                if (user_delete_res) {
                    if(user_delete_res?.avatar){
                        await deleteFile(user_delete_res?.avatar, email);
                    }
                    return res.status(200).json({
                        status: true,
                        message: "The user is successfully deleted!!!",
                    });
                }
                return res.json({
                    status: false,
                    message: "Something wrong to delete user!!"
                })
            }
            return res.status(404).json({
                status: false,
                message: "The user isn't exists to delete by this email"
            })

        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error?.message || "Server error!!!"
            })
        }
    }else{
        return res.status(401).json({
            status: false,
            message: "User is unauthorized!!!"
        })
    }
}


