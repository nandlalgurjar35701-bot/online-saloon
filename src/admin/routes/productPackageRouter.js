const { Router } = require("express");
const auth = require("../../middleware/adminauth");
const upload = require("../../middleware/img");
const {
  addProductPackagePage,
  createOrUpdateProductPackage,
  viewProductPackagePage,
  deleteProductPackage,
  findServicesForProductPackage,
  findProductPackageServices,
} = require("../controller/productPackageController");

const router = Router();

router.get("/add-product-package", auth, addProductPackagePage);
router.post("/add-product-package", auth, upload.single("file"), createOrUpdateProductPackage);
router.get("/view-product-package", auth, viewProductPackagePage);
router.get("/delete-product-package", auth, deleteProductPackage);
router.get("/find-services-for-product-package", auth, findServicesForProductPackage);
router.get("/find-product-package-services", auth, findProductPackageServices);

module.exports = router;
