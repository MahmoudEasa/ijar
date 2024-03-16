import mongoose from "mongoose";
import express from "express";
import apiRouter from "./routes/apiRoutes";
import authRouter from "./routes/authRoutes";
import cors from "cors";
import swaggerDocs from "./utils/swagger";
import cartRouter from "./routes/cartRoutes";

const port = 5000;
const app = express();

// Middleware
app.use(express.json());

// CORS
app.use(cors());

app.disable("x-powered-by");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/Ijar", {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

// Event listeners for MongoDB connection
mongoose.connection.on("connected", () => {
  // Start the server after successful connection
  try {
    app.listen(port, () => {
      console.log(`Server connected to http://localhost:${port}`);
    });
    swaggerDocs(app, port);
  } catch (error) {
    console.log("Cannot connect to the server");
  }
});

mongoose.connection.on("error", (err) => {
  console.error("Failed to connect to MongoDB:", err);
});

// Routes
app.use("/api", apiRouter);
app.use("/api", cartRouter);
app.use("/auth", authRouter);
