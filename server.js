import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import Stripe from "stripe";

import connectDB from "./config/db.js";
//dot env config
config();

//database connection
connectDB();

//STRIPE CONFIG
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//CLOUDINARY CONFIG
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//rest object
const app = express();

//middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:19006",
    credentials: true,
  })
);
app.use(cookieParser());

//routes import
import userRoutes from "./routes/userRoutes.js";
import bannerImageRoute from "./routes/bannerImageRoute.js";
import carpostRoutes from "./routes/carpostRoutes.js";
import postRoutes from "./routes/postRoutes.js";
//route
app.use("/api", userRoutes);
app.use("/api/banner", bannerImageRoute);
app.use("/api/post/car", carpostRoutes);
app.use("/api/post", postRoutes);

app.get("/", (req, res) => {
  return res.status(200).send("<h1>Welcome to node FlexShare</h1>");
});

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(
    `Server Running On PORT ${process.env.PORT} on ${process.env.NODE_ENV} mode`
      .bgMagenta.white
  );
});
