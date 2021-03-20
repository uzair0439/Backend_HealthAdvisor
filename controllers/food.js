const Food = require("../modals/Food");
const ErrorResponse = require("../utills/errorResponse");
const asyncHandler = require("../middleware/async");
exports.getFood = asyncHandler(async (req, res, next) => {
  console.log("object");
  const food = await Food.find();
  res.status(200).json({ success: true, data: food });
});
