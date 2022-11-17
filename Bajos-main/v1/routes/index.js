
const express = require("express");
const router = express();


const adminRoute = require("./Admin");


router.use("/admin", adminRoute);

module.exports = router;
