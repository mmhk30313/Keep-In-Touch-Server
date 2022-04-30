const express = require("express");
const router = express.Router();
router.post('/upload', (req, res) => {
    const files = req?.files;
    // const data = req.data.name;
    const {body} = req;
    console.log("====Files====", files);
    console.log("===Body====", body);
    console.log("")
    res.status(200).json({
        message: "Api hits for file uploading"
    })
})
module.exports = router;
