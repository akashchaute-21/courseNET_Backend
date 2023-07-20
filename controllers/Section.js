const Section = require ("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");
const { destroyMedia } = require("../utils/destroyMedia");

exports.createSection = async(req,res)=>{
    try {
        //data fetch for req
        const {sectionName,courseId}=req.body;

        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            })
        }
        //create section
        const newSec = await Section.create({
            sectionName,
            courseId
        })
        if(!newSec){
            return res.status(500).json({
                success:false,
                message:"new section could not be created"
            })
        }
        //update course with section id
       updatedCourse = await Course.findByIdAndUpdate(courseId,{
            $push:{
courseContent:newSec._id
            }},{new:true}
        ).populate("courseContent")
        // return response
        return res.status(200).json({
            success:true,
            message:"section created successfully",
            updatedCourse
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.updateSection = async (req,res)=>{
    try {
        //data fetch
        const {sectionName,sectionId,courseId}=req.body;

        // data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            })
        }
        //upadte the  db 
          await Section.findByIdAndUpdate(sectionId,{$set:{
            sectionName
        }});
       const updatedCourse = await Course.findById(courseId).populate({
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
        return res.status(200).json({
            success:true,
            message:"section updated success  fully",
            data:updatedCourse
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
exports.delSec = async(sectionId)=>{
    try {
         const secDet = await Section.findByIdAndDelete(sectionId)
         secDet.subSection.map(async(subSecId)=>{
            const subsecDet = await SubSection.findByIdAndDelete(subSecId)
            //console.log(subSectionId)
             await destroyMedia(subsecDet.videoUrl,'video')
         })
    //  await Section.findByIdAndRemove(sectionId)
    } catch (error) {
        console.log(error)
    }
}
exports.deleteSection = async(req,res)=>{
    try {
        //fetch data
        const {courseId,sectionId} = req.body;
        //delete the secc
        
        const courseDet = await Course.findByIdAndUpdate(courseId,{
            $pull:{
                courseContent: sectionId
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
        })
      
     await this.delSec(sectionId);
        return res.status(200).json({
            success:true,
            message:"section deleted successfully",
            data:courseDet
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}