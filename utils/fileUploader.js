const cloudinary = require("cloudinary").v2

exports.uploadFile = async (file,folder,quality)=>{
    const options={folder}

    if(quality){
        options.quality = quality;

    }
    options.resource_type="auto";
    return await cloudinary.uploader.upload(file.tempFilePath,options,((err,res)=>{
        if(err){ console.log(err)}
        else console.log(res);
      }));
}