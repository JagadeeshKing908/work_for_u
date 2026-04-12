const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const jobRoutes = require("./routes/jobs");
const session = require("express-session");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("views"));

app.use(session({
  secret: "mysecret",
  resave: false,
  saveUninitialized: true
}));

app.use("/", jobRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
