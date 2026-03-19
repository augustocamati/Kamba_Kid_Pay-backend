const express = require("express")

const router = express.Router()

const FinanceController = require("../controllers/accaofinanceiraController") 

router.post("/poupar",FinanceController.poupar)

router.post("/gastar",FinanceController.gastar)

//router.post("/doar",FinanceController.doar)

router.post("/bonus",FinanceController.bonusPoupanca)

module.exports = router