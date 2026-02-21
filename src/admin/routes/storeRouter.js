const { Router } = require("express");
const auth = require("../../middleware/adminauth");
const upload = require("../../middleware/img");
const {
    addSaloonStore,
    viewSaloon,
    deleteSaloon,
    getSaloonAddress,
    saloonRegister,
    businessProfile,
    businessBankInfoAdmin,
    businessUplodeDocumentAdmin,
    findSaloonByUser,
    findAdminAllSaloon,
    addImagesInSaloon,
    businessOtpSent,
    businessOtpVerify,
} = require("../controller/storeController");

const router = Router();

const uploadBusinessDocuments = upload.fields([
    { name: "BannerLogo", maxCount: 1 },
    { name: "logoImage", maxCount: 1 },
    { name: "panImage", maxCount: 1 },
    { name: "businessCertificate", maxCount: 1 },
]);

// Store setup and details
router.get("/add-saloon", auth, saloonRegister);
router.post("/business-otp-sent", auth, businessOtpSent);
router.post("/business-otp-verify", auth, businessOtpVerify);
router.post("/add-saloon-store", auth, addSaloonStore);
router.post("/business-profile-info-by-admin", auth, businessProfile);
router.post("/business-bank-information-admin", auth, businessBankInfoAdmin);
router.post("/business-uplode-document-admin", auth, uploadBusinessDocuments, businessUplodeDocumentAdmin);
router.post("/add-images-in-saloon", auth, upload.array("image"), addImagesInSaloon);

// Store query/actions
router.get("/view-saloon", auth, viewSaloon);
router.get("/delete-saloon", auth, deleteSaloon);
router.get("/get-saloon-address", auth, getSaloonAddress);
router.get("/find-admin-all-saloon", auth, findAdminAllSaloon);
router.get("/find-saloon-by-user", auth, findSaloonByUser);

module.exports = router;


