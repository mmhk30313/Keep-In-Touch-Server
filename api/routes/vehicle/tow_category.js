const express = require("express");
const router = express.Router();
const fs = require('fs');
const User = require("../../models/User/User");
const UserRole = require("../../models/User/UserRole");
const Vehicle = require('../../models/vehicle/vehicle');
const TowCategory = require('../../models/Vehicle/TowCategory')
const { authenticateJWT } = require("../auth/auth");
const uploadFile = require("../../upload-file/upload");

// Tow category add by admin
router.post('/tow-category/create', async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
            try {
                const {body: tow_category_body, files} = req;
                const {slug, title} = tow_category_body;
                const tow_cat_slug_res = await TowCategory.findOne({slug});
                if(tow_cat_slug_res){
                    return res.status(403).json({
                        status: false,
                        message: "The slug is already exists for another category"
                    })
                }
                let tow_slug  = slug || title;
                tow_slug = tow_slug.replace(/\s/g, "_");
                const destination = "/tow_category";
                if(files){
                    const root_path = process.env.DEV_URL || process.env.DEV_URL;
                    const img_path = (root_path+"/api/static"+destination+"/"+tow_slug+".png");
                    console.log({img_path});
                    tow_category_body.img = img_path;
                }
                tow_category_body.slug = tow_slug;
                const NewTowCategory = new TowCategory(tow_category_body);
                const tow_category_res = await NewTowCategory.save();
                if(tow_category_res){
                    if(files){
                        const img = files?.image || files?.img;
                        const img_name = tow_slug;
                        await uploadFile(destination, img, img_name);
                    }
                    return res.status(200).json({
                        status: true,
                        message: "The tow category is successfully created!!!",
                        data: tow_category_res,
                    })
                }
                return res.status(404).json({
                    status: false,
                    message: "Sorry!!! the tow category isn't created"
                })
            } catch (error) {
                return res.status(400).json({
                    status: false,
                    message: error?.message || "Server error"
                })
            }
        }
        return res.status(403).json({
            status: false,
            message: "User is unauthorized to create tow category!!!"
        })
    }
});

// Tow category update by admin
router.post('/tow-category/update', async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
            try {
                const {body: tow_category_body, files} = req;
                const {id: _id, slug: tow_slug} = tow_category_body;
                const tow_category_res = await TowCategory.findOne({_id})
                                        .select("_id title slug img");
                // For duplicate check
                const tow_cat_slug_res = await TowCategory.findOne({slug: tow_slug})
                                        .select("_id title slug img");
                // console.log({length: tow_cat_slug_res});
                if( tow_cat_slug_res && tow_cat_slug_res?._id != _id){
                    return res.status(403).json({
                        status: false,
                        message: "The slug is already exists for another category"
                    })
                }
                // console.log({tow_category_body});
                if(!tow_category_res){
                    return res.status(404).json({
                        status: false,
                        message: "Tow category isn't found to update by this id!!!"
                    })
                }
                let slug = tow_slug || tow_category_res?.slug || tow_category_res?.title;
                slug = slug.replace(/\s/g, "_");
                const destination = "/tow_category";
                if(files){
                    const root_path = process.env.DEV_URL || process.env.DEV_URL;
                    const img_path = (root_path+"/api/static"+destination+"/"+slug+".png");
                    tow_category_body.img = img_path;
                    tow_category_body.slug = slug;
                }else if(tow_category_res?.img){
                    delete tow_category_body.slug;
                }
                delete tow_category_body.id;
                const tow_category_update_res = await TowCategory.updateOne({_id}, tow_category_body);
                if(tow_category_update_res?.modifiedCount){
                    if(files){
                        const img = files?.image || files?.img;
                        // slug = slug.split(/(\s+)/).filter( e => e.trim().length > 0);
                        const img_name = slug;
                        await uploadFile(destination, img, img_name, tow_category_res?.img);
                    }
                    return res.status(200).json({
                        status: true,
                        message: "The tow category is successfully updated!!!",
                    })
                }
                return res.status(404).json({
                    status: false,
                    message: "Sorry!!! the tow category isn't updated"
                })
            } catch (error) {
                return res.status(400).json({
                    status: false,
                    message: error?.message || "Server error"
                })
            }
        }
        return res.status(403).json({
            status: false,
            message: "User is unauthorized to update tow category!!!"
        })
    }
});

// Get all tow categories from app or admin panel
router.get('/tow-category/all', async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        try {
            const tow_categories_res = await TowCategory.find({}).select("_id title slug img");
            if(tow_categories_res?.length){
                return res.status(200).json({
                    status: true,
                    message: "Tow categories found " + tow_categories_res?.length,
                    data: tow_categories_res,
                })
            }
            return res.status(404).json({
                status: false,
                message: "There is no category in db!!!"
            })
        } catch (error) {
            return res.status(403).json({
                status: false,
                message: error?.message || "Server error"
            })
        }
    }
});

// Find a tow category by _id from app or admin panel
router.get('/tow-category/find-one', async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        try {
            const {id: _id, slug} = req?.query;
            const filter = _id ? {_id} : slug ? {slug} : null;
            if(!filter){
                return res.status(403).json({
                    status: false,
                    message: `Please send proper tow-category ${_id ? "id" : slug ? "slug" : "id or slug"} by query params`
                });
            }
            const tow_categories_res = await TowCategory.findOne(filter).select("_id title slug img");
            if(tow_categories_res){
                return res.status(200).json({
                    status: true,
                    message: "Tow category found",
                    data: tow_categories_res,
                })
            }
            return res.status(404).json({
                status: false,
                message: `There is no category by this ${_id ? "id" : "slug"}!!!`
            })
        } catch (error) {
            return res.status(403).json({
                status: false,
                message: error?.message || "Server error"
            })
        }
    }
});

// Delete a tow category by _id or slug by admin
router.delete('/tow-category/delete-one', async(req, res) => {
    await authenticateJWT(req, res);
    if(req?.auth){
        if(req?.user?.user_role === "Admin" || req?.user?.user_role === "admin"){
            try {
                const {id: _id, slug} = req?.query;
                let filter = _id ? {_id} : slug ? {slug} : null;
                const tow_category_res = await TowCategory.findOneAndDelete(filter)
                                        .select("_id title slug img");
                
                console.log({tow_category_res});
                if(tow_category_res){
                    const previous_path = tow_category_res?.img;
                    if(previous_path){
                        let prev_img_path = "/uploads" + previous_path.match(`/api/static(.*)`)[1];
                        console.log({prev_img_path});
                        if (fs.existsSync(appRoot+prev_img_path)) {
                            //file exists
                            fs.unlinkSync(appRoot+prev_img_path);
                        }
                    }
                    return res.status(200).json({
                        status: true,
                        message: "The tow category is successfully deleted!!!",
                    })
                }
                return res.status(404).json({
                    status: false,
                    message: "Sorry!!! the tow category isn't found to delete"
                })
            } catch (error) {
                return res.status(400).json({
                    status: false,
                    message: error?.message || "Server error"
                })
            }
        }
        return res.status(403).json({
            status: false,
            message: "User is unauthorized to delete tow category!!!"
        })
    }
});

module.exports = router;