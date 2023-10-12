require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConnection");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const taskRoutes = require("./routes/taskRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const port = process.env.PORT || 5000;

const app = express();

console.log(process.env.NODE_ENV);

// connect to mongodb
connectDB();

// middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// routes
app.use("/api/team", teamRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "Sorry, this route does not exist" });
});

// check connection to the db and listen to requests to the server
mongoose.connection.once("open", () => {
  console.log("connected to MongoDB");
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${port}`)
  );
});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error: ", err);
});
