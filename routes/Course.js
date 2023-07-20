const express = require("express")
const router = express.Router();

const {
    createCourse,
   getCatCourses,
   getCat,
    editCourse,
    getCourseDetails,
    getInstructorCourses,
    deleteCourse
  } = require("../controllers/Course")
  
  
//   // Categories Controllers Import
//   // const {
//   //   showAllCategories,
//   //   createCategory,
//   //   categoryPageDetails,
//   // } = require("../controllers/Category")
  
//   // Sections Controllers Import
  const {
    createSection,
    updateSection,
    deleteSection,
  } = require("../controllers/Section")
  
//   // Sub-Sections Controllers Import
  const {
    createSubSec,
    updateSubSec,
    deleteSubSec,
  } = require("../controllers/Subsection")
  
//   // Rating Controllers Import
//   const {
//     createRating,
//     getAverageRating,
//     getAllRating,
//   } = require("../controllers/RatingAndReview")
  
//   // Importing Middlewares
  const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/Auth")
  
//   // ********************************************************************************************************
//   //                                      Course routes
//   // ********************************************************************************************************
  
//   // Courses can Only be Created by Instructors
  router.post("/createCourse", auth, isInstructor, createCourse)
  router.post("/getCatCourses", auth, isStudent, getCatCourses)
  router.get("/getCat", auth, getCat)
  router.get("/getInstructorCourses", auth, isInstructor,getInstructorCourses)
//   //Add a Section to a Course
//router.post("/addSection", auth, isInstructor, createSection)
router.delete("/deleteCourse",auth , isInstructor,deleteCourse)

router.post("/getCourseDetails",auth, getCourseDetails)
//   // Update a Section
router.post("/addSection", auth, isInstructor, createSection)

router.post("/updateSection", auth, isInstructor, updateSection)
//   // Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)
//   // Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSec)
//   // Delete Sub Section
 router.post("/deleteSubSection", auth, isInstructor, deleteSubSec)
//   // Add a Sub Section to a Section
 router.post("/addSubSection", auth, isInstructor, createSubSec)
//   // Get all Registered Courses
router.post("/editCourse", auth, isInstructor, editCourse)
//   router.get("/getAllCourses", getAllCourses)
//   // Get Details for a Specific Courses
//  
  
//   // ********************************************************************************************************
//   //                                      Category routes (Only by Admin)
//   // ********************************************************************************************************
//   // // Category can Only be Created by Admin
//   // // TODO: Put IsAdmin Middleware here
//   // router.post("/createCategory", auth, isAdmin, createCategory)
//   // router.get("/showAllCategories", showAllCategories)
//   // router.post("/getCategoryPageDetails", categoryPageDetails)
  
//   // ********************************************************************************************************
//   //                                      Rating and Review
//   // ********************************************************************************************************
//   router.post("/createRating", auth, isStudent, createRating)
//   router.get("/getAverageRating", getAverageRating)
//   router.get("/getReviews", getAllRatingReview)
  
  module.exports = router