const { Router } = require("express");
const auth = require("../../middleware/adminauth");
const upload = require("../../middleware/img");
const {
  addProductPage,
  addProductStore,
  viewProductPage,
  deleteProduct,
  getProductCategoryOptions,
  findSaloon,
} = require("../controller/productController");

const router = Router();

router.get("/add-product", auth, addProductPage);
router.post("/add-product-store", auth, upload.array("image"), addProductStore);
router.get("/view-product", auth, viewProductPage);
router.get("/delete-product", auth, deleteProduct);
router.get("/product-category-options", auth, getProductCategoryOptions);
router.get("/find-saloon", auth, findSaloon);

module.exports = router;
