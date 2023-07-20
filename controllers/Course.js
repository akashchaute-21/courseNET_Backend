const course = require("./../models/Course")
const Category = require("../models/Category")
const user = require("./../models/UserSchema")
const ratingAndReview = require("./../models/RatingAndRaview")
const section = require("./../models/Section")
const subSection = require("./../models/SubSection")
const {uploadFile} = require("../utils/fileUploader")
const { default: mongoose } = require("mongoose")
const { delSec } = require("./Section")
const { destroyMedia } = require("../utils/destroyMedia")



//create course
exports.createCourse = async(req,res)=>{
    try {
        //fetchdata 
     const {courseName,courseDescription, price,whatYouWillLearn,category,status,instructions}=req.body;
        //get thumbnail
        const thumbNail = req.files.thumbnailImage;

        if(!courseName|| !courseDescription || !whatYouWillLearn || !category ||!price){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
               })
        }
        
        //find the instructor
         const userId = req.user.id;
         const InstructorDetails = await user.findById(userId) 
        
         if(!InstructorDetails){
            return res.status(500).json({
                success:false,
                message:"instructor detail not found"
               })
         }
     
        
         //check tag is valid or not
         const catDetails = await Category.findOne({name:category});
         if(!catDetails){
            return res.status(500).json({
                success:false,
                message:"cat not found"
               })
         }

         //upload image to cloudinary
         const thumbnailImage = await uploadFile(thumbNail,"Thumbnails")  
        
         //create an entry for new course 
         const newCourse= await course.create({
            courseName,
            courseDescription,
            instructor:new mongoose.Types.ObjectId(InstructorDetails._id),
            whatYouWillLearn,
            price,
            status,
            category:new mongoose.Types.ObjectId(catDetails._id),
            thumbnail:thumbnailImage.secure_url
         })

         //add the new course to the user (instrutor) 
         await user.findByIdAndUpdate(InstructorDetails,{
            $push:{
                courses:newCourse._id
            }
         })
         //update the tag schema 
         await Category.findByIdAndUpdate(catDetails._id,{
            $push:{
                courses:newCourse._id
            }
         })
         // send res
         return res.status(200).json({
            success:true,
            message:"course created",
            data:newCourse
           })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
           })
    }
}  

exports.getInstructorCourses = async(req,res)=>{
   try {
      const userId = req.user.id;
      const courseDet = await user.findById(userId).populate("courses")
     // const courseDet =  await course.findBy(userDet).populate("category").populate("studentsEnrolled");
      if(!courseDet){
        return res.status(403).json({
            success:false,
            message:"course not found"
           })
      }

      return res.status(200).json({
        success:true,
        data:courseDet.courses
       })
   } catch (error) {
    console.log(error)
    return res.status(500).json({
        success:false,
        message:error.message
       })
   }
}

exports.delCourse = async(courseId)=>{
     try
   { const courseDet = await course.findByIdAndDelete(courseId)
    courseDet.studentsEnrolled.push(courseDet.instructor)
    await user.updateMany({_id:{$in:courseDet.studentsEnrolled}},{
        $pull:{
            courses:courseId
        }
    },{multi:true})
    courseDet.courseContent.map((secId)=>{delSec(secId)});
    return true;
}catch(error){
    return false
}
   
}
exports.deleteCourse=async(req,res)=>{
    try {
        const{ courseId} = req.body;
     const response = await this.delCourse(courseId);
     if(!response){
       
        return res.status(400).json({
            success:false,
            message:"could not delete course"
           })
     }
   
     return res.status(200).json({
         success:true,
         message:"course deleted successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"something went wrong"
           })
    }
}
//get all courses
exports.getAllCourses = async(req,res)=>{
  try {
        const courses = await course.find({}).populate("instructor").exec()
       if(!courses){
           return res.status(400).json({
               success:false,
               message:"no course found"
              })
       }
       return res.status(200).json({
        success:true,
        message:"courses fetched sucessfully",
        courses
       })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
        success:false,
        message:error.message
       })
  }
}

exports.getCourseDetails = async (req,res)=>{
    try {
        //fetch course id
        const {courseId} = req.body;
        //find course
        const courseDetails = await course.findById(courseId).populate({
            path:"instructor",
            populate:{
                path:"aditionaldetails"
            }
        }).populate("category").populate("ratingAndReviews").populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        }).exec()
        if(!courseDetails){
            return res.json({
                success:false,
                message:"course not found"
            })   
        }
          //return response
          return res.status(200).json({
            success:true,
            message:"data fetched",
            courseDetails
        })

    } catch (error) {
        console.log(error)
         return res.status(500).json({
            success:false,
            message:error.message,
            
        })
    }
}

exports.editCourse=async(req,res)=>{
    try {
        const data= req.body;
        const courseId = data.courseId;
        delete data.courseId

        const courseDet = course.findById(courseId)
        if(data.category){ 
           await Category.findByIdAndUpdate(courseDet.category,{
                $pull:{
                    courses:courseId
                }
            });
          const cat = Category.findOne({name:data.category})
          data.category=cat._id

      }
       let imageUrl = courseDet.thumbnail
      if(req.files.thumbnail){
            await destroyMedia(imageUrl)
           const cloudRes= await uploadFile(req.files.thumbnail,"Thumbnails")
           imageUrl = cloudRes.secure_url
      }

    
      const updatedCourse=  await course.findByIdAndUpdate(courseId,{
        $set:{
            ...data,
            thumbnail:imageUrl
        }
      },{new:true}).populate({
        path:"instructor",
        populate:{
            path:"aditionaldetails"
        }
    }).populate("category").populate("ratingAndReviews").populate({
        path:"courseContent",
        populate:{
            path:"subSection"
        }
    });
       
    
  
      if(!updatedCourse){
        return res.status(400).json({
            success:false,
            message:"could not edit course"
           })
      }
      return res.status(200).json({
        success:true,
        data:updatedCourse
       })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
           })
    }
}

exports.getCatCourses  = async(req,res)=>{
    try {
        const {category}=req.body;
        let catDet=[];
        
        if(category==="ALL"){
              catDet=await course.find({}).populate("instructor")
        }
        else{
            const cat =await  Category.findOne({name:category})
            console.log(cat)
        catDet = await course.find({category:cat._id}).populate({
            path:"instructor",
            populate:{
                path:"aditionaldetails"
            }
        }).populate("category").populate("ratingAndReviews").populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        })
        }
        
        if(!catDet){
            return res.status(400).json({
                success:false,
                message:"no course found"
               })
        }
      
        return res.status(200).json({
            success:true,
            message:"courses fectched successfully",
            data:catDet
           })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
           })
    }
}

exports.getCat  = async(req,res)=>{
    try {
       
        const catDet = await Category.find({})
        if(!catDet){
            return res.status(400).json({
                success:false,
                message:"no category found"
               })
        }
    //   console.log(catDet)
        return res.status(200).json({
            success:true,
            message:"category fectched successfully",
            data:catDet
           })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
           })
    }
}