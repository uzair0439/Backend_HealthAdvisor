const mongoose = require("mongoose");

const dietSchema = mongoose.Schema({
  data: [
    {
      userDiet: {
        type: Object,
        required: [true, "Please add a diet"],
      },
    },
  ],
});

module.exports = mongoose.model("Diet", dietSchema);
