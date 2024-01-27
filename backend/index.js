const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connnectToDb = require("./config/db");
const routes = require("./routes/route");


const app = express();

app.use(cors());

app.use(express.json());

app.use("/v1", routes);

app.listen(process.env.PORT, () => {
  connnectToDb();
  console.log(`Server is running @PORT ${process.env.PORT}`);
});
