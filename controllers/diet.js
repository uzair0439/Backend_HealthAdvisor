const Diet = require("../modals/Diet");
const ErrorResponse = require("../utills/errorResponse");
const asyncHandler = require("../middleware/async");
const path = require("path");

// @desc        AddBuddy
// @method      Put
// @Access      Private
// route        /buddies

exports.addDiet = asyncHandler(async (req, res, next) => {
  const data = { userDiet: req.body };
  const userId = req.user.id;
  console.log("USER ID", userId);
  // const diet = {
  //   userId: userId,
  //   toy_id: toyId,
  //   toyData: toyData,
  // };
  let alreadyCreated = await Diet.findById(userId);
  console.log(alreadyCreated);
  if (alreadyCreated) {
    alreadyCreated.data.push(data);
    console.log(alreadyCreated);
    await Diet.findByIdAndUpdate(userId, alreadyCreated);
    return res.status(200).json({ success: true, data: alreadyCreated });
  }
  const diet = Diet.create({ _id: userId, data: data });
  // if (!buddy) return next(new ErrorResponse("not done", 400));
  res.status(200).json({ success: true, data: diet });
});

exports.getDiet = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const diet = await Diet.findById(userId);
  res.status(200).json({ success: true, data: diet });
});

exports.deleteDiet = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const diet = await Diet.findByIdAndRemove(userId);
  res
    .status(200)
    .json({ success: true, message: "Diet Plan deleted success fully" });
});
