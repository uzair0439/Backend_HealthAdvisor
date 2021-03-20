const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { addDiet, getDiet, deleteDiet } = require("../controllers/diet");

router
  .route("/")
  .put(protect, addDiet)
  .get(protect, getDiet)
  .delete(protect, deleteDiet);

module.exports = router;
