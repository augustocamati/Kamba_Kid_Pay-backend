// routes/shopRoutes.js
const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const { authMiddleware } = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/items", shopController.listItems);
router.post("/purchase", shopController.purchase);

module.exports = router;