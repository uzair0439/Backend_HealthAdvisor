const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const auth = require("./routes/auth");
const diet = require("./routes/diet");
const food = require("./routes/food");
const morgan = require("morgan");
const connectDB = require("./config/db");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const cors = require("cors");

dotenv.config({ path: "./config/config.env" });
connectDB();
const app = express();
//body parsar
app.use(express.json());
//Cookie Parser
app.use(cookieParser());
//dev logging middleware
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
//file upload
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));
//mount router
app.get("/check", (req, res) => {
  res.send("Server running fine");
});

app.use("/auth", auth);
app.use("/food", food);
app.use("/diet", diet);
app.use(errorHandler);
const PORT = process.env.PORT || 5002;
const server = app.listen(
  PORT,
  "192.168.100.111",
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
//promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
