require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookiParser = require("cookie-parser");
const cors = require("cors");

// my routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRouters = require("./routes/product");
const orderRouters = require("./routes/order");

const app = express();

//database connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

//meddlewares
app.use(bodyParser.json());
app.use(cookiParser());
app.use(cors());

//routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRouters);
app.use("/api", orderRouters);

//port
const port = process.env.PORT || 8000;

//starting the server
app.listen(port, () => {
  console.log(`app is runing at ${port}`);
});
