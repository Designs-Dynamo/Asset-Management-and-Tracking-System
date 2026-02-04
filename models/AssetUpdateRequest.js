import mongoose from "mongoose";

const assetUpdateRequestSchema = new mongoose.Schema(
  {
    /* ================= RELATION ================= */

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true
    },

    branchId: {
      type: String,
      required: true,
      index: true
    },

    requestedemployee:{
      type: String,
    },

    requestedBy: {
      type: String,
      ref: "User",
      required: true
    },

    requestedBranchId: {
      type: String,   // branch user wants to move asset to
      index: true
    },

    /* ================= ASSET META UPDATES ================= */

    updatedAssetMeta: {
      assetType: {
        type: String           // Laptop, Desktop, Printer
      },
      assetCompany: {
        type: String           // Dell, HP, Lenovo
      },
      purchaseDate: {
        type: Date
      },
      assignedTo:{
      type: String,
    },

      department:
      {
        type: String,
      },
    },

    updatedextraprice:{
      pram: String,
      pssd: String,
      phdd: String,
      pother: String,
    },

    /* ================= DEVICE DETAILS UPDATES ================= */

    updatedDeviceDetails: {
      deviceName: String,
      cpu: String,
      ram: String,
      ssd: String,
      hdd: String,
      os: String,
      currentStatus: {
        type: String,
        enum: ["Assigned", "Unassigned", "Maintenance"]
      }
    },

    /* ================= OPTIONAL NOTES ================= */

    notes: {
      type: String,
      trim: true
    },

    /* ================= REQUEST STATUS ================= */

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },

    updatedImages: [
    {
      url: String
    }
      ],
    
    /* ================= NEW: AUTO-DELETE LOGIC ================= */
    // This field is set ONLY when status becomes APPROVED or REJECTED
    resolvedAt: { 
      type: Date, 
      default: null 
    }

  },
  { timestamps: true }
);

assetUpdateRequestSchema.index({ resolvedAt: 1 }, { expireAfterSeconds: 2592000 });

const AssetUpdateRequest = mongoose.model('AssetUpdateRequest',assetUpdateRequestSchema);

export default AssetUpdateRequest;
