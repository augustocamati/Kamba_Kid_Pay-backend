const express = require("express")
const router = express.Router()
const doacaoController = require("../controllers/doacaoController")

router.post("/doar", doacaoController.doar)

module.exports = router