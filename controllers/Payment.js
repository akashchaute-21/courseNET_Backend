const User  = require("../models/UserSchema")
const Course  = require("../models/Course")
const sendMail = require("../utils/sendMail")
const { default: mongoose} = require("mongoose")
const Razorpay = require("razorpay") 
const crypto = require("crypto-js")
require("dotenv").config()

RP_inst= new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})


//capture the payment and initiate the razor pay 

exports.getOrder= async (req,res)=>{
    //get course ID and userID
    const userId = req.user.id;
    const {amount}= req.body;
    //valid course id
//     if(!courseId){
//         return res.json({
//             success:false,
//             message:"Invalid course ID"
//         })
//     }
//     //valid course details
//     let course;
//     try {
//          course = await Course.findById({courseId});
//         if(!course){
//             return res.json({
//                 success:false,
//                 message:"no course found"
//             })
//         }
        
//    //user already paid or enrolled inthe course
//      const uid = new mongoose.Types.ObjectId(userId);
//      if(course.studentsEnrolled.includes(uid)){
//         return res.json({
//             success:false,
//             message:"student already enrolled in the course"
//         })
//      }
  

//     } catch (error) {
//         return res.json({
//             success:false,
//             message:error.message
//         })
//     }
   //order create 
  

    const options={
        amount:amount *100,
        currency:"INR",
        notes:{
         userId
        }
    }
    try {
        //initiate the payment
        const response = await RP_inst.orders.create(options);
       console.log(response)
        return res.status(200).json({
            success:true,
            message:"payment initiated",
            data:response
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
  
}


exports.verifyPayment = async (req,res)=>{
    // const webhookSecret = "abcdefghi"
    // const razorpaySign = req.header("x-razorpay")

    // const shasum = crypto.createHmac("sha256",webhookSecret);
    // shasum.update(JSON.stringify(req.body));
    // const digest = shasum.digest("hex");

    // if(razorpaySign=== digest){
    //     const {courseId,userId} = req.body.payload.entity.notes;
    //     try {
    //         //find the course and update student enrolled
    //         const updateCourse =await Course.findByIdAndUpdate(courseId,{
    //                $push:{ studentsEnrolled:userId }
               
    //         }, {new:true})
    //         //find user and update course
    //         const updateUser = await User.findByIdAndUpdate(userId,{
    //             $push:{courses:courseId}
    //         })
    //     const emailRes = await sendMail(updateUser.email,"congrats","You have successfully registered for the course")
    //    //return res
    //    return res.json({
    //     success:true,
    //     message:"succesfully enrolled in the course"
    // })
    //     } catch (error) {
    //         return res.json({
    //             success:false,
    //             message:error.message
    //         })
    //     }


    // }
    // else{
    //     return res.status(400).json({
    //         success:false,
    //         message:"signature invalid"
    //     })
    // }
   try{
    const {razorpay_payment_id,razorpay_order_id, razorpay_signature, order_id,courses} = req.body;
    const userId = req.user.id;

 // const hash = 
  //  const shasum = CryptoJS.SHA256
    const shasum = crypto.HmacSHA256(order_id + "|" + razorpay_payment_id,process.env.RAZORPAY_KEY_SECRET)
    // shasum.update(JSON.stringify({
    //     order_id ,
    //   razorpay_payment_id
    // }));
   
    generated_signature = crypto.enc.Hex.stringify(shasum);
    console.log("gen ", generated_signature)
    console.log("got ", razorpay_signature)
    console.log(courses)
    if (generated_signature == razorpay_signature) {
      const userDet  = await User.findByIdAndUpdate(userId,{
        $push:{
            courses:{$each:courses.map((course)=> new mongoose.Types.ObjectId(course))}
        }
       },{new:true});
       console.log(userDet)
       const cid  =courses.map((course)=> new mongoose.Types.ObjectId(course))
       console.log("cid",cid)
       await Course.updateMany({_id:{$in:cid}},{
        $push:{
            studentsEnrolled:new mongoose.Types.ObjectId(userId)
        }
       },{multi:true})
       return res.status(200).json({
        success:true,
        message:"signature verified",
        data:userDet
       })

    }
    else{
        return res.status(400).json({
          success:false,
          message:"signature invalid"
         })
            
    }
}catch(error){
    console.log(error)
    return res.status(500).json({
        success:false,
        message:error.message
       })

}
}
