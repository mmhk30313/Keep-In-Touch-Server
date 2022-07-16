const fs = require('fs');
const deleteFile = require('./delete');
require('../../../configs/env.config');

// Upload any image file by
const uploadFile = async(destination, imageFile, image_name, previous_path = "", mimeType = ".png", size) => {
    console.log({image_destination: destination});
    // console.log({previous_path});
    if(previous_path){
        await deleteFile(previous_path);
    }
    const des_array = destination.split("/").slice(1);
    console.log({des_array});
    let img_path = appRoot+"/uploads";
    if(!fs.existsSync(img_path)){
        fs.mkdirSync(img_path);
    }
    
    await des_array.forEach(async(path) => {
        img_path += "/"+path;
        console.log({img_path});
        if(!fs.existsSync(img_path)){
            fs.mkdirSync(img_path);
        }
    });
    const image = img_path + "/" + image_name + mimeType;
    await imageFile.mv(image);
    const root_path = process.env.DEV_URL || process.env.PROD_URL;
    return (root_path+"/api/static"+destination+"/"+image_name+mimeType);
}

module.exports = uploadFile;