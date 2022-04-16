const express = require("express");
const path = require("path");
// const axios = require("axios");
// const redis = require("redis");
const app = express();
const dotenv = require("dotenv");
const cors = require('cors');
const bodyParser = require("body-parser");
// API PATH
const rootPath = require("./api/routes/root");
const userPath = require("./api/routes/user");
dotenv.config();

//middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(cors({origin: true}));
app.use(rootPath);
app.use('/api', userPath);

// MongoDB Connection With Mongoose
require("./configs/db.config");
global.appRoot = path.resolve(__dirname);
app.use('/api/static', express.static('uploads'));
app.listen(process.env.PORT || 3000, () => {
    console.log("Node server started at http://localhost:" + process.env.PORT || 3000);
});