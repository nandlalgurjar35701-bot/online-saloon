const auth = require("../../middleware/adminauth")
const Upload = require("../../middleware/img");
const { Router } = require("express");
const app = Router();
const { ADD_SALOON_STORE, VIEW_SALOON, DELETE_SALOON,
    GetSaloonAddress, saloonRegister, businessProfile,
    businessBankInfoAdmin,
    businessUplodeDocumentAdmin, findSaloonByUser, FindAdminAllSaloon,
    addImagesInSaloon } = require("../controller/storeController");

app.get("/view-saloon", auth, VIEW_SALOON)
app.get("/delete-saloon", auth, DELETE_SALOON)
app.get("/get-saloon-address", auth, GetSaloonAddress)

app.get("/add-saloon", auth, saloonRegister)
app.post("/add-saloon-store", auth, ADD_SALOON_STORE)
app.post("/business-profile-info-by-admin", auth, businessProfile)
app.post("/business-bank-information-admin", auth, businessBankInfoAdmin)

app.post("/business-uplode-document-admin", auth, Upload.fields([{
    name: 'BannerLogo', maxCount: 1
}, {
    name: 'logoImage', maxCount: 1
}, {
    name: 'panImage', maxCount: 1
}, {
    name: 'businessCertificate', maxCount: 1
}]), businessUplodeDocumentAdmin)


app.post("/add-images-in-saloon", auth, Upload.array("image"), addImagesInSaloon)


app.get("/find-admin-all-saloon", auth, FindAdminAllSaloon)

app.get("/find-saloon-by-user", auth, findSaloonByUser)
module.exports = app


