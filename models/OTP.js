const mongoose = require("mongoose");
const sendMail = require("../utils/sendMail");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
        type:Date,
        default:Date.now(),
       // expires: 60,
    }
});


//a function -> to send emails
async function sendVerificationEmail(email, otp) {
    try{
        const mailResponse = await sendMail(email, "Verification Email from StudyNotion", otp);
        console.log("Email sent Successfully: ",mailResponse);
    }
    catch(error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next) {
    
    await sendVerificationEmail(this.email, this.otp);
    console.log("otp saved")
    next();
}) 



module.exports = mongoose.model("OTP", OTPSchema);

