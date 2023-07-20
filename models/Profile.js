const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    gender:{
        type:String,
       
    },
    dob:{
        type:String,
        
    },
    about:{
        type:String,
       trim:true
        
    },
  contactnumber:{
        type:Number,
        trim:true
           },
   
})

module.exports= mongoose.model("Profile",userSchema);