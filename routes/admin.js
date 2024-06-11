const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");

const router = express.Router(); //importing the router function from express

router.get(
  "/add-product",
  isAuth,
  adminController.getAddProduct
  //assigning the name router as this will notify the use function that it is imported and the will be used as per its need
  //path is provided to different middleware to send response for different route
  // res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
);

router.get("/products", isAuth, adminController.getProducts);

router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }),
    // body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 5 }),
  ],
  isAuth,
  adminController.postAddProduct
  //only active if a post request is made
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }),
    // body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 5 }),
  ],
  isAuth,
  adminController.postEditProduct
);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router; //exporting the router
