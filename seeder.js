const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const Food = require("./modals/Food");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
const food = JSON.parse(
  fs.readFileSync(`${__dirname}/config/data.json`, "utf-8")
);

const importData = async () => {
  try {
    await Food.create(food);

    console.log("data imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.log("data import", err);
  }
};
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
}
