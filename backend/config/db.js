const mongoose = require("mongoose");

const connectToDb = () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  const dbConnection = mongoose.connection;

  dbConnection.once("open", (_) => {
    console.log("Database connected Successfully ");
  });

  dbConnection.on("error", (error) => {
    console.error(`connection error: ${error}`);
  });

  return;
};

module.exports=connectToDb;