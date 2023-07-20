const express = require("express")
const router = express.Router();

const {  getOrder, verifyPayment} = require("../controllers/Payment")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/Auth")

 
router.post("/getOrder", auth, isStudent, getOrder)
router.post("/verifyPayment", auth, isStudent, verifyPayment)

module.exports = router