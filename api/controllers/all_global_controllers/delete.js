const fs = require('fs');
require('../../../configs/env.config');

const deleteFile = async (previous_path, folder_path) => {
    let prev_img_path = "/uploads" + previous_path?.match(`/api/static(.*)`)[1];
    console.log({prev_img_path});
    console.log({folder_path});
    if (folder_path) {
        let img_path = "/uploads/" + folder_path;
        if (img_path && fs?.existsSync(appRoot + img_path)) {
            //file exists
            console.log({img_path});
            fs?.rmdirSync(appRoot + img_path, { recursive: true });
        }
    } else if (prev_img_path && fs?.existsSync(appRoot + prev_img_path)) {
        //file exists
        fs?.unlinkSync(appRoot + prev_img_path);
    }
}

module.exports = deleteFile;