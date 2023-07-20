const { default: mongoose } = require("mongoose");
const User = require("./../models/UserSchema")
const OTP = require("./../models/OTP")
const profile = require("./../models/Profile")
const OTPGenerator = require("otp-generator")
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken")

require("dotenv").config();

//send OTP function
exports.sendotp = async (req,res)=>{
  try {
      //fetch email from request
      const {email }=req.body;
     
      //chech user exist or not
      const response = await User.findOne({email});
      if(response){
          return res.status(401).json({
              success:false,
              message:"User email already exist"
          })
        }
   //generate OTP
   var otp = OTPGenerator.generate(6);
   
  // check unique otp
 // let checkotp = OTP.findOne({otp});
//   while(checkotp){
//      otp = OTPGenerator.generate(6);
   
//      checkotp = OTP.findOne({otp});
//   }

  //save otp in database
  const otpPayload = {email,otp};
  const otpbody = await OTP.create(otpPayload);
  if(otpbody){
    console.log(otpbody.otp)
  return res.status(200).json({
    success:true,
    message:"OTP sent successfully"
  })
}
 return res.status(200).json({
    success:false,
    message:"could not send mail"
  })


  } catch (error) {
    console.log(error);
    res.status(500).json({
        success:false,
        message:"error.message"
      })
    
  }

}

//singup function 
exports.signup = async (req,res)=>{
    try {
        
        //fetch data fron req body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp
        }=req.body

        //validate data
       
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"please enter all the fields"
            }
            )
        }
      
        //password match
        if(password!==confirmPassword){
            res.status(400).json({
                success:false,
                message:"password doesnt match"
              })
        }
     
        // fetch most recent otp from db
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
       // console.log(recentOTP)
        if(recentOTP.length==0){
           return res.status(400).json({
                success:false,
                message:"OTP not found"
              })
        }
       console.log(recentOTP[0].otp," ",otp)
        //validate OTP
        if(otp!==recentOTP[0].otp){
         return res.status(400).json({
                success:false,
                message:"OTP is invalid"
              })
        }
      
        //hash password
        const hashedPassword = await bcrypt.hash(password,10);
       
         const profiledata = await profile.create({
            gender:null,
            dob:null,
            about:null,
            contactnumber:null
         })
        
        //save data in db
        const userbody = await User.create({
            firstname:firstName,
           lastname: lastName,
            email:  email,
            password:hashedPassword,
            accounttype: accountType ,
            aditionaldetails: profiledata._id,
          //  image:"",
            courseprogress:[],
            courses:[],

        })

        res.status(200).json({
            success:true,
            message:"User registered Successfully"
          })
        
    }catch(e){
        console.log(e)
        res.status(400).json({
            success:false,
            message:"error User registration failed"
          })
    }
}

exports.login = async(req,res)=>{
    try {
        //get data from req body
        const {email,password} = req.body;
    
        // validate data
        if(!email ||!password){
          return  res.status(403).json({
                success:false,
                message:"please enter all the fields"
              })
        }
        
        //check user exist or not
        const userexist = await User.findOne({email});
        if(!userexist){
           return   res.status(403).json({
            success:false,
            message:"user not registered please signup first"
          })
        }
        //password check and //gnenrate jwt token 
        const payload = {
            email:userexist.email,
            id:userexist._id,
            role:userexist.accounttype,
        }
       
        if(await bcrypt.compare(password,userexist.password)){
           
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            }) 

           // console.log(userexist)
            //create cookie ans send response
           return res.cookie("token",token,{
                expires : new Date(Date.now()+24*60*60*1000)
            }).status(200).json({
                success:true,
                message:"User login Successfully",
                token:token,
                user:userexist
              
              })
        }
       
        else{
            res.status(403).json({
                success:false,
                message:"Password is incorrect try again"
              })
        }
        
        
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:"Login failed"
          })
        
      
        
    }
}

exports.changePassword = async(req,res)=>{
    try {
      const {oldPassword, newPassword}= req.body;
      if(!oldPassword || !newPassword){
        return res.status(403).json({
          success:false,
          message:"please enter all the fields"
        })
      }
      const userId= req.user.id;
      const userDet = await User.findById(userId)
     // console.log(userId)
      if(!userDet){
        return res.status(403).json({
          success:false,
          message:"User not found"
        })
      }
      if(await bcrypt.compare(oldPassword,userDet.password)){
        const hashedPass = await bcrypt.hash(newPassword,10);
       await User.findByIdAndUpdate(userId,{$set:{password:hashedPass}});
        return  res.status(200).json({
          success:true,
          message:"Password updated Successfully"
        })
      }
      else{
        return res.status(403).json({
          success:false,
          message:"password not correct"
        })
      }



    } catch (error) {
      console.log(error)
        res.status(500).json({
          success:false,
          message:"something went wrong"
        })
      
    }
}