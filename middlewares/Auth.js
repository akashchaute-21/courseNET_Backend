const { default: mongoose } = require("mongoose");
const User = require("./../models/UserSchema")

const jwt = require("jsonwebtoken")

exports.auth = async(req,res,next)=> {

   try {
    const token = req.header("Authorization").replace("Bearer ","");
//    console.log(token)
    if(!token){
        return  res.status(403).json({
            success:false,
            message:"token is missing"
          })
    }
    try { const decode = jwt.verify(token,process.env.JWT_SECRET);
     req.user=decode;
   //  console.log(decode)
    }catch(e){
        console.log(e)
        return res.status(403).json({
            success:false,
            message:"token is invalid"
          })
        
       }
       next();
    }

    catch (error) {
        console.log(error)
    res.status(403).json({
        success:false,
        message:error.message
      })
    
   }

}

//isStudent check
exports.isStudent = async (req,res,next)=>{
    try {
        if(req.user.role!=="Student"){
            return res.status(401).json({
                success:false,
                message:"not a student"
              })
            
        }
        next();
    } catch (error) {
        res.status(403).json({
            success:false,
            message:error.message
          })
        
    }
}

//isInstructor
exports.isInstructor = async (req,res,next)=>{
    try {
        if(req.user.role!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"not a Instructor"
              })
            
        }
        next();
    } catch (error) {
        res.status(403).json({
            success:false,
            message:error.message
          })
        
    }
}

//is Admin
exports.isAdmin = async (req,res,next)=>{
    try {
        if(req.user.role!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"not a admin"
              })
            
        }
        next();
    } catch (error) {
        res.status(403).json({
            success:false,
            message:error.message
          })
        
    }
}