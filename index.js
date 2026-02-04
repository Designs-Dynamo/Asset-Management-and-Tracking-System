import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authroutes from "./routes/authroute.js";
import assetroutes from "./routes/Assetsroute.js";
import assetUpdaterotes from "./routes/assetUpdateroutes.js";


const app= express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let isconneted = false;

async function connectmongodb(){
  try {
    await mongoose.connect(process.env.MONGO_URL)
    isconneted = true;
    console.log('MongoDB Atlas connected successfully!');
    
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}
app.use((req,res,next) => {
  if (!isconneted) {
    connectmongodb();
  }
  next();
});

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
