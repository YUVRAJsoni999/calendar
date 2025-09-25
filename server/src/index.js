import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import holidayRoutes from "./routes/holidayRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Vacation Calendar API 🚀"));
app.use("/api/holidays", holidayRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`✅ Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error("❌ MongoDB error:", err));
