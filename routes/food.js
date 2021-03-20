const express = require("express");
const { getFood } = require("../controllers/food");
const router = express.Router();

router.route("/").get(getFood);

module.exports = router;
