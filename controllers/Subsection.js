const SubSec = require("../models/SubSection");
const Sec = require("../models/Section");
const {  uploadFile } = require("../utils/fileUploader");
const { destroyMedia } = require("../utils/destroyMedia");


exports.createSubSec = async(req,res)=>{
  try {
      //fetch data
      const {sectionId,title, description }=req.body;
      //extract video
      const video =req.files.video;
      //validation
      if(!sectionId ||  !title ||!description||!video){
          return res.status(500).json({
              success:false,
              message:"all fields are required"
          })
      }
      //upload video to cloudinary
      const uploadVideo = await  uploadFile (video,"Lecture_Videos")
      //create a subsection
      const newSubSec = await SubSec.create({
          title,
          description,
          videoUrl:uploadVideo.secure_url
      })
      //push subsec id in section 
      const updateSec = await Sec.findByIdAndUpdate(sectionId,{
          $push:{
              subSection:newSubSec._id
          }
      },{new:true}).populate("subSection")
      //return response
      return res.status(200).json({
          success:true,
          message:"new sub section created successfully",
          data:updateSec
      })
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:error.message
    })
  }
}

//upadate subsection
exports.updateSubSec = async(req,res)=>{
    try {
        const data=req.body;
        //validate 
        const secId = data.sectionId;
        const subSecId = data.subSectionId;
        delete  data.sectionId
        delete data.subSectionId
        
        const subSecDet = await SubSec.findById(subSecId);
        let Vurl = subSecDet.videoUrl
        if(req.files?.video){
            console.log("this is running")
            const cloudRes = await uploadFile(req.files.video,"Lecture_Videos");
            await destroyMedia(subSecDet.videoUrl,'video');
            Vurl = cloudRes.secure_url
          //  delete data.video
            
        }
        // if(!sectionId ||  !title ||!timeDuration ||!description||!video){
        //     return res.status(500).json({
        //         success:false,
        //         message:"all fields are required"
        //     })
        // }

        //update the subsection
        await SubSec.findByIdAndUpdate(subSecId,{
            $set:{
                ...data,
                videoUrl:Vurl
            }
        })

        const updatedSec = await Sec.findById(secId).populate("subSection")
        return res.status(200).json({
            success:true,
            message:"subsection updated success  fully",
            data:updatedSec
        })
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.deleteSubSec = async(req,res)=>{
    try {
        const { subSectionId, sectionId} = req.body;
        //delete from db
        const subsecDet = await SubSec.findByIdAndDelete(subSectionId)
      // console.log(subSectionId)
        await destroyMedia(subsecDet.videoUrl,"video")
      const UpdatedSec =   await Sec.findByIdAndUpdate(sectionId,{
        $pull:{
            subSection:subSectionId
        }
      }).populate("subSection");
      if(!UpdatedSec){
        return res.status(500).json({
            success:false,
            message:"could not delete subsection"
        })
      }
       // return res
        return res.status(200).json({
            success:true,
            message:"subsection deleted success  fully",
            data:UpdatedSec
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}