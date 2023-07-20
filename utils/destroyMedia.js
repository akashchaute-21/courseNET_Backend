const cloudinary = require("cloudinary").v2;

exports.destroyMedia= async(url,resource_type)=>{
    const arr = url.split("/")
    options={}
    if(resource_type){
      options.resource_type = resource_type
    }
    console.log(options)
   const public_id = (arr[arr.length-2] +"/"+arr[arr.length-1].split(".")[0]).replace("%20"," ")
   console.log(public_id);
  await cloudinary.uploader.destroy(public_id,options).then((err)=>console.log(err))
     
}