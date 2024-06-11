const express = require("express");

const shopController = require("../controllers/shop");
const { postDeleteProduct } = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get(
  "/",
  shopController.getIndex
  //middleware is reached from top to bottom so if no path is matched for a requested url then the "/" path middleware is triggered
  // console.log(adminData.products);
  // res.sendFile(path.join(__dirname, "../", "views", "shop.html"));
);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);

router.get("/checkout/cancel", isAuth, shopController.getCheckout);

router.get("/orders", isAuth, shopController.getOrders);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
