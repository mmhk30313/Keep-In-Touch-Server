const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
// const axios = require("axios");
// const redis = require("redis");
const app = express();
require("./configs/env.config");
const cors = require('cors');
const bodyParser = require("body-parser");

// API PATH
const route_paths = require("./paths/route_path.js");
const rootPath = require("./api/routes/root");

//middleware
app.use(express.json());
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(cors({origin: true}));
// console.log({paths});
app.use(rootPath);
route_paths?.map(route_path => app.use('/api', route_path));

// MongoDB Connection With Mongoose
require("./configs/db.config");
global.appRoot = path.resolve(__dirname);
app.use('/api/static', express.static('uploads'));
app.listen(process.env.PORT || 3000, () => {
    console.log("Node server started at http://localhost:" + process.env.PORT || 3000);
});