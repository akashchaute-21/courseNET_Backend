const express = require("express")
const router = express.Router();

const { auth,isInstructor, isStudent } = require("../middlewares/Auth")
const {
  deleteAccount,
  updateProfile,
//  getAllUserDetails,
  updateDisplayPicture,
  instructorDashboard,
  getEnrolledCourses,
} = require("../controllers/Profile")


// Delet User Account



router.put("/updateProfile", auth, updateProfile)


//router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses

router.get("/getEnrolledCourses", auth,isStudent, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard",auth,isInstructor,instructorDashboard)
router.delete("/deleteProfile",auth, deleteAccount)
module.exports = router