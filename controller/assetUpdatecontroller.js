import Asset from "../models/Asset.js";
import AssetUpdateRequest from "../models/AssetUpdateRequest.js";

/* CREATE UPDATE REQUEST (BRANCH USER) */
export const createAssetUpdateRequest = async (req, res) => {
  try {
    const { assetId } = req.params;
    
    const {
      updatedAssetMeta,
      updatedextraprice,
      updatedDeviceDetails,
      notes
    } = req.body;

    /* ================= VALIDATE ================= */
    if (!assetId) {
      return res.status(400).json({ message: "assetId is required" });
    }

    /* ================= CHECK ASSET ================= */
    const asset = await Asset.findOne({
      _id: assetId,
      branchId: req.user.branchId
    });

    if (!asset) {
      return res.status(403).json({
        message: "Unauthorized asset access"
      });
    }

    /* ================= CHECK PENDING ================= */
    const pending = await AssetUpdateRequest.findOne({
      assetId: assetId,
      status: "PENDING"
    });

    if (pending) {
      return res.status(400).json({
        message: "Update request already pending"
      });
    }

    /* ================= IMAGES ================= */
    const images =
      req.files?.map(file => ({ url: file.path })) || [];

    /* ================= CREATE REQUEST ================= */
    const request = await AssetUpdateRequest.create({
      assetId: assetId,
      branchId: asset.branchId,
      requestedBy: req.user.branchId,
      updatedAssetMeta:
        typeof updatedAssetMeta === "string"
          ? JSON.parse(updatedAssetMeta)
          : updatedAssetMeta,
      updatedextraprice:
        typeof updatedextraprice === "string"
          ? JSON.parse(updatedextraprice)
          : updatedextraprice,
      updatedDeviceDetails:
        typeof updatedDeviceDetails === "string"
          ? JSON.parse(updatedDeviceDetails)
          : updatedDeviceDetails,
      updatedImages: images,
      notes
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


/* ADMIN – GET ALL PENDING REQUESTS */
export const getPendingRequests = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }

  const requests = await AssetUpdateRequest.find({
    status: "PENDING"
  })
    .populate("assetId")

  res.json(requests);
};

/* ADMIN – APPROVE REQUEST */
export const approveUpdateRequest = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const request = await AssetUpdateRequest.findById(req.params.id)
      .populate("assetId");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const asset = request.assetId;

     if (request.requestedBranchId) {
      const oldBranch = asset.branchId;
      const newBranch = request.requestedBranchId;

      asset.branchId = newBranch;

      asset.activity.push({
        action: "BRANCH_TRANSFER",
        description: `Asset moved from ${oldBranch} to ${newBranch}`,
        performedBy: req.user.userId
      });
    }

    /* ================= SAFE UPDATE: ASSET META ================= */
    if (request.updatedAssetMeta) {
      Object.keys(request.updatedAssetMeta).forEach(key => {
        if (request.updatedAssetMeta[key] !== undefined) {
          asset[key] = request.updatedAssetMeta[key];
        }
      });
    }

    /* ================= SAFE UPDATE: DEVICE DETAILS ================= */
    if (request.updatedDeviceDetails) {
      Object.keys(request.updatedDeviceDetails).forEach(key => {
        if (request.updatedDeviceDetails[key] !== undefined) {
          asset.deviceDetails[key] =
            request.updatedDeviceDetails[key];
        }
        
      });
    }

    if (request.updatedextraprice) {
        // Initialize if it doesn't exist
        if (!asset.Extraprice) asset.Extraprice = {};

        // Merge updated prices
        if (request.updatedextraprice.pram) asset.Extraprice.pram = request.updatedextraprice.pram;
        if (request.updatedextraprice.pssd) asset.Extraprice.pssd = request.updatedextraprice.pssd;
        if (request.updatedextraprice.phdd) asset.Extraprice.phdd = request.updatedextraprice.phdd;
        if (request.updatedextraprice.pother) asset.Extraprice.pother = request.updatedextraprice.pother;
    }

    /* ================= IMAGES ================= */
    if (request.updatedImages?.length) {
      asset.images.push(...request.updatedImages);
    }

    /* ================= ACTIVITY ================= */
    asset.activity.push({
      action: "UPDATED",
      description: "Asset updated after admin approval",
      performedBy: req.user.userId
    });

    await asset.save(); // ✅ SAFE SAVE

    request.status = "APPROVED";
    request.resolvedAt = new Date();
    await request.save();



    res.json({ message: "Asset update approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
/* ADMIN – REJECT REQUEST */
export const rejectUpdateRequest = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const request = await AssetUpdateRequest.findById(req.params.id)
      .populate("assetId");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        message: `Request already ${request.status}`
      });
    }

    /* ================= MARK AS REJECTED ================= */
    request.status = "REJECTED";
    request.resolvedAt = new Date();
    await request.save();

    /* ================= OPTIONAL: LOG ACTIVITY ================= */
    if (request.assetId) {
      request.assetId.activity.push({
        action: "UPDATE_REJECTED",
        description: "Asset update request rejected by admin",
        performedBy: req.user.userId
      });

      await request.assetId.save();
    }

    res.json({
      message: "Update rejected. Asset data unchanged.",
      requestStatus: request.status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const createadminAssetUpdateRequest = async (req, res) => {
  try {
    const { assetId } = req.params;
    
    const {
      updatedAssetMeta,
      updatedextraprice,
      updatedDeviceDetails,
      notes
    } = req.body;

    /* ================= VALIDATE ================= */
    if (!assetId) {
      return res.status(400).json({ message: "assetId is required" });
    }

    /* ================= CHECK ASSET ================= */
    const asset = await Asset.findOne({
      _id: assetId
    });




    if (!asset) {
      return res.status(403).json({
        message: "Unauthorized asset access"
      });
    }

        //const branchId = await Asset.findOne({ branchId: branchId});

    /* ================= CHECK PENDING ================= */
    const pending = await AssetUpdateRequest.findOne({
      assetId: assetId,
      status: "PENDING"
    });

    if (pending) {
      return res.status(400).json({
        message: "Update request already pending"
      });
    }

    /* ================= IMAGES ================= */
    const images =
      req.files?.map(file => ({ url: file.path })) || [];

    /* ================= CREATE REQUEST ================= */
    const request = await AssetUpdateRequest.create({
      assetId: assetId,
      branchId: asset.branchId,
      requestedBy: req.user.branchId,
      updatedAssetMeta:
        typeof updatedAssetMeta === "string"
          ? JSON.parse(updatedAssetMeta)
          : updatedAssetMeta,
      updatedextraprice:
        typeof updatedextraprice === "string"
          ? JSON.parse(updatedextraprice)
          : updatedextraprice,
      updatedDeviceDetails:
        typeof updatedDeviceDetails === "string"
          ? JSON.parse(updatedDeviceDetails)
          : updatedDeviceDetails,
      updatedImages: images,
      notes
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const createBranchChangeRequest = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { requestedBranchId } = req.body;

    if (!requestedBranchId) {
      return res.status(400).json({
        message: "requestedBranchId is required"
      });
    }

    const asset = await Asset.findOne({
      _id: assetId,
    });

    if (!asset) {
      return res.status(403).json({
        message: "Unauthorized asset access"
      });
    }

    if (asset.branchId === requestedBranchId) {
      return res.status(400).json({
        message: "Asset already belongs to this branch"
      });
    }

    const pending = await AssetUpdateRequest.findOne({
      assetId,
      status: "PENDING"
    });

    if (pending) {
      return res.status(400).json({
        message: "Another request is already pending"
      });
    }

    const request = await AssetUpdateRequest.create({
      assetId,
      branchId: asset.branchId,           // current branch
      requestedBy: req.user.userId,
      requestedBranchId: requestedBranchId                  // 🔴 NEW FIELD
    });

    res.status(201).json({
      message: "Branch change request submitted",
      requestId: request._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* GET REQUESTS FOR LOGGED-IN BRANCH */
export const branchrequests = async (req, res) => {
  try {
    // 1. Get the branchId from the logged-in user's token
    const userBranch = req.user.branchId; 

    if (!userBranch) {
      return res.status(400).json({ message: "User branch not identified" });
    }

    // 2. Find requests matching this Branch ID
    const requests = await AssetUpdateRequest.find({ 
      branchId: userBranch 
    })
    .populate("assetId", "assetName assetCode") // Populate asset details
    .sort({ createdAt: -1 }); // Newest first

    // 3. Return results
    res.json(requests);

  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: err.message });
  }
};