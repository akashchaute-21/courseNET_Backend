const Profile = require("../models/Profile")
const User = require("../models/UserSchema")
const Course = require("../models/Course")
const cloudinary =require("cloudinary").v2
const {uploadFile} = require("../utils/fileUploader")
const { destroyMedia } = require("../utils/destroyMedia")
const { default: mongoose } = require("mongoose")
const { delCourse } = require("./Course")



exports.updateProfile = async(req,res)=>{
   try {
     //get data
     const {firstName, lastName, dateOfBirth="",about="" , contactNumber, gender}=req.body;
     //get user id
     const userId=req.user.id
     //validate
     //find profile id
     const userDetail = await User.findByIdAndUpdate(userId,{
        firstname:firstName,
        lastname:lastName
     },{new:true});
     console.log(userDetail)
     
     const profileId = userDetail.aditionaldetails 
       //update profile
   const updatedPro=  await Profile.findByIdAndUpdate(profileId,{
         dob:dateOfBirth,
       about,
       contactnumber:contactNumber,
       gender
     },{new:true})
     console.log(updatedPro)
    
  const  updatedUserDetails= await User.findById(userId).populate("aditionaldetails")
     //return res
     return res.status(200).json({
        success:true,
        message:"profile updated successfully",
        updatedUserDetails
    },)

   } catch (error) {
    console.log(error)
    return res.status(500).json({
        success:false,
        message:error.message
    })
   }
}

//delete account 
exports.deleteAccount = async(req,res)=>{
    try {
        //get user id
    const userId = req.user.id;
    //check valid id
    const userDetail = await User.findByIdAndDelete(userId);
    console.log(userDetail)
    if(!userDetail){
        return res.status(404).json({
            success:false,
            message:"no user found"
    })
}
  // delete profile
    const profileId = userDetail.aditionaldetails;
    await Profile.findByIdAndDelete(profileId);
    if(userDetail.image) 
    await destroyMedia(userDetail.image)
    //delete user from enrolled courses
    const coursesId =userDetail.courses.map((course)=> new mongoose.Types.ObjectId(course));

     if(userDetail.accounttype==="Student"){
    await Course.updateMany({$in:coursesId},{
        $pull:{
            studentsEnrolled:new mongoose.Types.ObjectId(userId)
        }
    },{multi:true})
  }
  else if(userDetail.accounttype==="Instructor"){
     coursesId.map(async(cid)=>{if(!await delCourse(cid)){
      return res.status(500).json({
            success:false,
             message:"could not delete one of courses"
     })
    }
    })
  }

    //return user
    return res.status(200).json({
        success:true,
        message:" account deleted "
    })
    } catch (error) {
      console.log(error)
        return res.status(500).json({
            success:false,
            message:"could not delete profile"
        })
    }
}

// const uploadFile=async (path,folder)=>{
//     options={folder}
//     options.resource_type="auto";
//   return  await cloudinary.uploader.upload(path,options,(err,res)=>{
//     if(err){ console.log(err)}
//     else console.log(res);
//   })
// }

exports.updateDisplayPicture = async(req,res)=>{
     try {
         const {displayPicture}=req.files;
        
         let userDet = await User.findById(req.user.id)
      //   console.log(userDet.image)
         if(userDet?.image){
            const arr = userDet.image.split("/")
          
          const public_id = (arr[arr.length-2] +"/"+arr[arr.length-1].split(".")[0]).replace("%20"," ")
          console.log(public_id);
         await cloudinary.uploader.destroy(public_id).then((err,re)=>{
            if(err)
            console.log(err)  
            else console.log(re);
          });
         }

      console.log(displayPicture);
    
   const result= await uploadFile(displayPicture,"Display_Photos");
      userDet = await User.findByIdAndUpdate(req.user.id,{$set:{image:result.secure_url}},{new:true}).populate("aditionaldetails")
     console.log(userDet)

       return res.status(200).json({
        success:true,
        message:"DP uploaded successfully",
        data:userDet
       });
    
     } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
        
     }
}


  exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }

exports.getEnrolledCourses = async(req,res)=>{
     try {
        const userId = req.user.id;
      //  console.log("id",userId)
        const userDet = await User.findById(userId).populate("courses");
     
        if(!userDet){
          return res.status(400).json({
            success:false,
            message:"could not get data"
        })
        }
     
        return res.status(200).json({
          success:true,
          message:"enrolled Courses fetched successfully",
          data: userDet.courses
      })
     } catch (error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:error.message
      })
     }
}
    