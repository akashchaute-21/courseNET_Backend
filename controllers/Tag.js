const Tags = require("./../models/Tags");
const Tag = require("./../models/Tags");

//create tag handler for admin
exports.createTag = async(req,res)=>{
    try {
         //fech data from req
         const {name,description} = req.body;
         //validation
         if(!name ||!description){
            return res.status(500).json({
                success:false,
                message:"all fields are  required"
               })
         }
         //create tag entry in DB
         const tagDetails = await Tags.create({
            name:name,
            description:description
         })

         //return res
         return res.status(200).json({
            success:true,
            message:"tag created succesfully"
           })
    } catch (error) {
       return res.status(500).json({
        success:false,
        message:erro.message
       })
    }
}

exports.showAllTags = async (req,res) =>{
    try {
        const alltags = await Tag.find({},{name:true,description:true})
        return res.status(200).json({
            success:false,
            message:"all tags fetched",
        alltags
           })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:erro.message
           })
    }

}

exports.tagPageDetails = async(req,res)=>{
    try {
        //get TagId
        const {TagId} = req.body;
        //get courses for specified TagId
        const selectedTag = await Tag.findById(TagId)
                                        .populate("courses")
                                        .exec();
        //validation
        if(!selectedTag) {
            return res.status(404).json({
                success:false,
                message:'Data Not Found',
            });
        }
        //get coursesfor different Tags
        const differentTags = await Tag.find({
                                     _id: {$ne: TagId},
                                     })
                                     .populate("courses")
                                     .exec();


        //return response
        return res.status(200).json({
            success:true,
            data: {
                selectedTag,
                differentTags,
            },
        });
    } catch (error) {
        return res.status(200).json({
            success:false,
            message:error.message,
           
        })
    }
}