require('../../../configs/env.config');
const jwt = require('jsonwebtoken');
const { authenticateJWT } = require("../auth");
// This token_key is same to auth file token_key
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require('fs');
const User = require("../../models/User/User");
const UserRole = require("../../models/User/UserRole");
const uploadFile = require('../all_global_controllers/upload');
const development_mode = process.env.NODE_ENV === 'development';
console.log({development_mode});
const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.VERIFIER_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    }
});

// User login for getting token
exports.login_user = async (req, res) => {
    const {email, password, user_name} = req?.body;
    console.log({email, password});
    
    if(!email || !password) {
        return res.status(406).json({
            status: false,
            message: "Email or password are missing",
        })
    }
    try {
        const pipeline = [
            {
                $match: {
                    email: email,
                }
            },
            {
                $lookup: {
                    from: UserRole.collection.name,
                    localField: "role_id",
                    foreignField: "role_id",
                    as: "user_role"
                }
            },
            {
                $project: {
                    _id: 1,
                    email: 1,
                    user_name: 1,
                    password: 1,
                    phone: 1,
                    avatar: 1,
                    role_id: 1,
                    isVerified: 1,
                    address: 1,
                    gender: 1,
                    lat: 1,
                    lan: 1,
                    user_role: { $arrayElemAt: [ "$user_role.name", 0 ] },
                }
            }
        ];

        const user_ag_res = await User.aggregate(pipeline);
        const user = user_ag_res[0];
        // console.log({user: user});
        
        if(!user) {
            return res.status(404).json({status: false, massage: "User not found"});
        }
        if(!user?.isVerified){
            return res.status(400).json({
                status: false,
                message: "You email is not verified. Please resend your otp"
            })
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword) {
            return res.status(400).json({status: false, message: "Wrong password"});
        }
        const tokenObject = {email: user?.email, role_id: user?.role_id, name: user?.user_name, user_role: user?.user_role, avatar: user?.avatar};
        const accessToken = jwt.sign(tokenObject, accessTokenSecret);
        delete user.password;
        const dataObj = {
            remember_token: accessToken,
        };
        await User.updateOne({email}, dataObj);
        return res.status(200).json({status: true, data: {user, accessToken}})
        
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error?.message || "Server error"
        })
    }

};

// User registration
exports.sign_up_user = async (req, res) => {
    const {body, files} = req;
    console.log("====Body====", {body});
    // const now = new Timestamp(new Date());
    // console.log({now});
    const {password, confirm_password, email} = body;
    if( password !== confirm_password ){
        return res.status(406).json({
            status: false,
            message: password.length < 6 ? "Password length should be greater than 6 !!!" : "Your password and confirm password are matched"
        })
    }else{
        try {
            const already_exist_user = await User.findOne({email});
            if(already_exist_user){
                return res.status(409).json({
                    status: false,
                    message: "This email is already exist for another user",
                });
            } else{
                // console.log({files});
                const user_body = body;
                let img_folder = user_body?.email;
                const img_name = "avatar";
                const root_url =  development_mode ? process.env.DEV_URL : process.env.PROD_URL;
                if(files){
                    // let img_folder = Number(new Date());
                    img_path = `${root_url}/api/static/${img_folder}/${img_name}.png`;
                    user_body.avatar = img_path;
                }
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                const otp = Math.floor(1000 + Math.random() * 9000);
                // const host = req.get('host');
                // const link="http://"+req.get('host')+"/verify?id="+rand;
                const host = development_mode ? process.env.DEV_URL : process.env.PROD_URL;
                const link=`${host}/api/user/verify?otp=${otp}&email=${email}`;
                
                const mailOptions = {
                    from: process.env.VERIFIER_EMAIL,
                    to : email,
                    subject : "Please confirm your email account",
                    html : `<div>
                            <h3>Hello,</h3>
                            <h4>Please Click on the link To verify your email.</h4>
                            <a href="${link}" target="_blank">Click here to verify</a>
                            <h3>OR</h3>
                            <p>Please enter the verification code</p>
                            <h1 style="color: blue;">${otp}</h1>
                        </div>`
                }

                smtpTransport.sendMail(mailOptions);
                const otp_expired_at = new Date(new Date().getTime() + 3 * 60000);
                user_body.otp_expired_at = otp_expired_at.toISOString();
                user_body.password = hashedPassword;
                user_body.otp = otp;
                user_body.role_id = 2;
                delete user_body.confirm_password;
                const newUser = new User(user_body);

                const res_signup = await newUser.save();
                const result = res_signup?._doc;
                // console.log({result});
                if(result){
                    if(files){
                        console.log({file: files?.avatar});
                        // if(!fs.existsSync(appRoot+"/uploads")){
                        //     fs.mkdirSync(appRoot+"/uploads");
                        // }
                        const img_file = files?.image || files?.img || files?.uploadedImg || files?.avatar;

                        let root_path = "/"+ img_folder;
                        const img_url = await uploadFile(root_path, img_file, img_name);
                        console.log({img_url});
                        // if(!fs.existsSync(appRoot+root_path)){
                        //     fs.mkdirSync(appRoot+root_path);
                        // }
                        // root_path += "/" + img_name;
                        // const uploadPath = appRoot + root_path;
                        // await uploadedFile.mv(uploadPath);
                    }
                    
                    return res.status(200).json({
                        status: true,
                        message: "The user is successfully signed up. Please check your email for the verification code",
                        // data: result,
                    });
                }
                return res.status(500).json({
                    status: false,
                    message: "Server error"
                })
            }

        } catch (error) {
            res.status(500).json({
                status: false,
                message: error?.message || "Something wrong"
            })
        }
    }
};

// User logout for removing token from db
exports.logout_user = async(req, res, next) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        const {token, user, remember_token} = req;
        try {
            // const filter_tokens = await remember_token?.filter(t => t != token);
            await User.updateOne({email: user?.email}, {remember_token: "", is_active: false});
            return res.status(200).json({
                status: true,
                message: "User is logged out successfully!!!",
            })
            
        } catch (error) {
            return res.json({
                status: false,
                message: error?.message || "Server error",
            })
        }
    }else{
        const err = new Error("User is not logged in");
        err.status = 401;
        return next(err);
    }
};

// User verification api for otp code
exports.verify_user = async(req, res) => {
    const {otp, email}  = req?.query;
    console.log({otp, email});
    if(!otp || !email) {
        return res.status(403).json({
            status: false,
            message: "Please send email or otp properly"
        })
    }
    try {
        const verify_user = await User.findOne({ email })
                            .select("-_id role_id user_name avatar email otp otp_expired_at isVerified address phone gender lat lan");
        if(!verify_user){
            return res.json(
                {
                    status: false,
                    message: "User is not found!!!"
                }
            ).status(404);
        }
        const {isVerified, otp: verify_otp, email: verify_email, user_name, role_id, otp_expired_at} = verify_user;
        console.log({verify_otp, verify_email});
        const result = verify_user?._doc;
        const now = new Date().toISOString();
        // console.log("now =Line:434= otp_expired_at: ", now < otp_expired_at);
        // console.log("now == otp_expired_at: ", now + "    "+ otp_expired_at);
        if(isVerified || (otp == verify_otp && email === verify_email && now < otp_expired_at)){
            // const tokenObject = {email, role_id, name: first_name};
            // const accessToken = jwt.sign(tokenObject, accessTokenSecret);
            if(!isVerified){
                await User.updateOne({email}, {isVerified: true, email_verified_at: new Date().toISOString()});
            }
            return res.json(
                {
                    status: true,
                    message: isVerified ? "Thank you, your email is already verified!!!" :  "Thank you, your email is verified!!!",
                    data: result,
                    // accessToken,
                }
            ).status(200);
        }
        return res.json(
            {
                status: false,
                message: !(now < otp_expired_at) ? "Your otp is expired. Please resend your otp!!!" : "Your otp isn't matched for this email"
            }
        ).status(400);
    } catch (error) {
        return res.send({
            status: false,
            message: error?.message || "Something wrong"
        }).status(400);
    }
}

// User resend otp
exports.resend_otp = async(req, res) => {
    const {email} = req?.query;
    if(!email){
        return res.status(400).json({
            status: false,
            message: "Please send your email properly!!!"
        })
    }
    try {
        
        const user = await User.findOne({ email })
                    .select("-_id isVerified email otp");
    
        if(!user){
            return res.status(404).json({status: false, massage: "User not found"});
        }
        if(user?.isVerified){
            return res.status(200).json({
                status: false,
                message: "Your email is already verified!!!"
            })
        }
        const otp = Math.floor(1000 + Math.random() * 9000);
        const host = development_mode ? process.env.DEV_URL : process.env.PROD_URL;
        const link = `${host}/api/user/verify?otp=${otp}&email=${email}`;
        const mailOptions = {
            from: process.env.VERIFIER_EMAIL,
            to : email,
            subject : "Please confirm your email account",
            html : `<div>
                        <h3>Hello,</h3>
                        <h4>Please Click on the link To verify your email.</h4>
                        <a href="${link}" target="_blank">Click here to verify</a>
                        <h3>OR</h3>
                        <p>Please enter the verification code</p>
                        <h1 style="color: blue;">${otp}</h1>
                    </div>`
        }
        // console.log(mailOptions);
        smtpTransport.sendMail(mailOptions);
        const otp_expired_at = new Date(new Date().getTime() + 3 * 60000).toISOString();;
        await User.updateOne({email}, {otp, otp_expired_at});
        return res.status(200).json({
            status: true,
            message: "Generated new otp",
            data: {otp}
        })
    } catch (error) {
        return res.send(
            {
                status: false,
                message: error?.message || "Some thing wrong"
            }
        ).status(400);
    }

}

// Direct link api for verification
exports.direct_verify_user = async(req, res) => {
    const {otp, email} = req?.query;
    console.log({otp, email});
    if(!otp || !email){
        return res.status(403).sendFile('/api/views/user_verify/user_forbidden.html', {root: appRoot});
    }
    try {
        const verify_user = await User.findOne({email}).select("isVerified otp otp_expired_at email");
        console.log({verify_user});
        if(!verify_user){
            return res.status(400).sendFile('/api/views/user_verify/user_not_found.html', {root: appRoot});
        }
        const {isVerified, otp: verify_otp, email: verify_email, otp_expired_at} = verify_user;
        console.log({verify_otp, verify_email});
        const now = new Date().toISOString();
        console.log("now =Line:434= otp_expired_at: ", now < otp_expired_at);
        console.log("now == otp_expired_at: ", now + "    "+ otp_expired_at);
        if(isVerified){
            return res.status(200).sendFile("/api/views/user_verify/user_already_verified.html",{root: appRoot});
        }else if(otp == verify_otp && email === verify_email && now < otp_expired_at){
            await User.updateOne({email}, {isVerified: true, email_verified_at: new Date().toISOString()});
            return res.status(200).sendFile("/api/views/user_verify/user_verified.html",{root: appRoot});
        }
        // await User.deleteOne({email});
        return res.status(400).send(
            `<!DOCTYPE html>
            <html>
                <head>
                    <title>KEEP IN TOUCH SERVER - BAD REQUEST</title>
                </head>
            <style>
                *, *:before, *:after {
                    -webkit-box-sizing: border-box;
                    -moz-box-sizing: border-box;
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                body {
                    background: #435363;
                    -webkit-animation: bg 5s infinite alternate;
                    -moz-animation: bg 5s infinite alternate;
                    -o-animation: bg 5s infinite alternate;
                    animation: bg 5s infinite alternate;
                }
                
                @-webkit-keyframes bg {
                    0%   { background: #984D6F; }
                    100% { background: #435363; }
                }

                @-moz-keyframes bg {
                    0%   { background: #984D6F; }
                    100% { background: #435363; }
                }

                @-o-keyframes bg {
                    0%   { background: #984D6F; }
                    100% { background: #435363; }
                }

                @keyframes bg {
                    0%   { background: #984D6F; }
                    100% { background: #435363; }
                }
                
                h1 {
                    padding-top: 380px;
                    font-family: 'Joti One', cursive;
                    font-size: 3.5em;
                    text-align: center;
                    color: #FFF;
                    text-shadow: rgba(0,0,0,0.6) 1px 0, rgba(0,0,0,0.6) 1px 0, rgba(0,0,0,0.6) 0 1px, rgba(0,0,0,0.6) 0 1px;
                }

            </style>
            <body>
                <h1 
                    style="padding-top: 100px;
                    align-items: center;
                    height: 90%;
                    overflow-y: hidden;
                    text-transform: uppercase;
                    font-weight: 600;
                    font-family: monospace;
                    font-size: 30pt;">
                    <img src="https://www.animatedimages.org/data/media/1551/animated-sorry-and-apology-image-0073.gif" alt="sorry">
                    <p>Your ${!(now < otp_expired_at) ? "otp is expired " : "otp didn't match"} for your email. Please resend otp again!!!</p>
                </h1>
            </body>
            </html>
        `
        );
    } catch (error) {
        return res.status(500).sendFile("/api/views/user_verify/user_verify_error.html", {root: appRoot});
    }
}
