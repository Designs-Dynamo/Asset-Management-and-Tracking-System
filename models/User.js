import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,        // 🔑 IMPORTANT
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["ADMIN", "BRANCH_USER"],
      default: "BRANCH_USER"
    },

    branchId: {
      type: String,
      required: true,
      index: true           // 🔑 Faster branch queries
    },

    /* ================= OPTIONAL (RECOMMENDED) ================= */
    
  },
  { timestamps: true }
);


const User = mongoose.model('User', userSchema);

export default User;