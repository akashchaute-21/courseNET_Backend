const Rating = require("../models/RatingAndRaview")
const User = require("../models/UserSchema")
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");
const RatingAndRaview = require("../models/RatingAndRaview");

exports.createRatings = async(req,res)=>{
  try {
      //get user id
      const userId = req.user.id;
    //data fetch 
    const {courseId, rating,review} = req.body
    //validate data 
    if(!courseId ||!rating ||! review){
        return res.status(400).json({
            success:false,
            message:"all fields are required"
        })
    }
    //check user is enrolled or not
    const userDetails = await User.findById(userId);
    if(!userDetails.courses.includes(courseId)){
        return res.status(400).json({
            success:false,
            message:"student not enrolled in the course can not rate this "
        })
    }
    //check user has already reviewed or nnot
    const userRating = await Rating.find({user:userId,course:courseId});
    if(userRating){
        return res.status(400).json({
            success:false,
            message:"user has already reviewed the course"
        })
    }
    // create rating in db
    const newRating = await Rating.create({
        user:userId,
        course:courseId,
        rating,
        review,

    })
    //update the course with rating
    await Course.findByIdAndUpdate(courseId,{
        $push:{ ratingAndReviews:newRating._id}
    })
    //return response
    return res.status(400).json({
        success:true,
        message:"review submitted successfully"
    })
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"something went wrong"
    })
  }
}

exports.getAvgRating = async(req,res)=>{
    try {
        //get courseId
        const courseId = req.body.courseId;
        //calulate avg rating
        const avgRating = await Rating.aggregate([{
            $match:{
                course:new mongoose.Types.ObjectId(courseId),
            }
        },
        {
            $group:{
                _id:null,
                averageRating:{ $avg:"$rating"}
            }
        }
    ])

        //return res
        if(avgRating.lengt >0){
            return res.status(200).json({
                success:true,
                message:"rating fetched successfully",
                averageRating:avgRating[0].averageRating
            })
        }

        // if no rating
        return res.status(200).json({
            success:true,
            message:"no rating given",
            averageRating:0        })

    } catch (error) {
        return res.status(400).json({
            success:false,
            message:message.error
        })
    }
}

exports.getAllRating = async(req,res)=>{
    try {
        const allReviews = await RatingAndRaview.find({}).sort({rating:"desc"}).populate({
            path:"user",
            select:"firstName lastName email image"
        }).populate({
            path:"course",
            select:"courseName",
        }).exec()
    } catch (error) {
        return res.status(200).json({
            success:true,
            message:error.message
        })
    }
}