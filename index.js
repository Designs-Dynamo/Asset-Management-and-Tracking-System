import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authroutes from "./routes/authroute.js";
import assetroutes from "./routes/Assetsroute.js";
import assetUpdaterotes from "./routes/assetUpdateroutes.js";


const app= express();

app.use(cors());
app.use(express.json());

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URL, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// 🔴 CRITICAL: wait for DB BEFORE routes
await connectDB();

app.use("/api/auth", authroutes);
app.use("/api/assets", assetroutes);
app.use("/api/asset-update", assetUpdaterotes);

app.get("/", (req, res) => {
  res.send("ässet management backend");
});

export default app;

// mongoose.connect(process.env.MONGO_URL)
//   .then(() => console.log('MongoDB Atlas connected successfully!'))
//   .catch(err => console.error('MongoDB connection error:', err));


// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`)
// });
