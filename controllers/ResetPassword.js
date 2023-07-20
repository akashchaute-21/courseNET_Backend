const User = require("./../models/UserSchema")
const sendMail = require("./../utils/sendMail")
const bcrypt = require("bcrypt")
//reset password function
exports.resetPasswordToken = async (req,res)=>{
  try {
      //get email from req
      const {email}= req.body;

    
      // check usert exist or not 
      const checkuser = await User.findOne({email});
      if(!checkuser){
          return res.status(403).json({
              success:true,
              message:"this email is not registered with us"
          })
      }
      
      //generate token
      const token = crypto.randomUUID()
      //update user by adding toke and expiration time
      const details = await User.findOneAndUpdate({email},{
          token:token,
          restPasswotdExpiry:Date.now()+2*60*60*1000
      },{new:true})
      //create url
      const url = `http://localhost:3000/reset-password/${token}`
  
      //send mail containing link 
      await sendMail(email,"Reset Password Link", `Password Reset link ${url}`)
      //return response
     return res.json({
      success:true,
      message:"Email sent successfully, please check mail "
     })
  } catch (error) {
    return res.json({
        success:false,
        message:"something went wrong "
       })
  }
}


//reset password function
exports.resetPassword= async(req,res)=>{
   try {
     //data fetch 
     const {password, confirmPassword, token } = req.body
     //validtion
     if(password!==confirmPassword){
         return res.json({
             success:false,
             message:"something went wrong "
            })
     }
     //get userdetails from db 
     const userdetails = await User.findOne({token})
     if(!userdetails){
         return res.json({
             success:false,
             message:"something went wrong "
            })
     }
     //token time check
     if(userdetails.restPasswotdExpiry<Date.now()){
         return res.json({
             success:false,
             message:"ytoken expired "
            })
     }
     //hash pasword , update password 
     const hashedPass = bcrypt(password,10);
     await User.findOneAndUpdate(
         {token},
         {password:hashedPass},
         {new:true}
     )
     return res.json({
         success:true,
         message:"password reset successfull "
        })
   } catch (error) {
    return res.json({
        success:false,
        message:"something went wrong "
       })
    }
} 