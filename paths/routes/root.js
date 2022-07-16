const express = require("express");
// var fs = require('fs');
// const root = require("../../api/views/root/index.html");
const router = express.Router();
// Just simple info for root api endpoint
router.get("/", (_, res) => {
  res.status(200).sendFile('/api/views/root/index.html', {root: appRoot })
  // let path = appRoot + "/api/views/root/index.html";
  // console.log({path});
  // fs.readFile(path, 'utf8', function(err, file){
  //   if(err){
  //     console.log(err);
  //     return res.status(500).send("Error");
  //   }
  //   res.send(file);
  // });
});

module.exports = router;