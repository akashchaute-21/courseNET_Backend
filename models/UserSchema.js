const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        trim:true 
    },
    lastname:{
        type:String,
        required:true,
        trim:true 
    },
   email:{
        type:String,
        required:true,
        trim:true 
    },
    password:{
        type:String,
        required:true,
 
    },
    accounttype:{
        type:String,
        required:true,
        enum:["Admin", "Student","Instructor"],
    },
    aditionaldetails:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true,
        ref:"Profile" 
    },
    courses:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"Course"
    }],
    image:{
        type:String,
        required:false
    },
    courseprogress:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"CourseProgress"
    }],


})

module.exports= mongoose.model("User",userSchema);