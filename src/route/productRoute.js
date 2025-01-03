const express = require("express");
const router = express.Router();

const productController = require("../controller/productController");

router.post("/postProduct", productController.createProduct);
router.get("/getProducts", productController.getProducts);
router.delete("/deleteProduct/:id", productController.deleteProduct);
router.get("/getProductById/:id", productController.getProductById);

module.exports = router;
