const nodemailer = require("nodemailer");

const sendMail =async (email,title,body)=>{
    try{
       let transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
port: 465,
secure: true,

         auth:{
            user:"q216908@gmail.com",
            pass: "tkgumhmttzfydjrh"
         }
       })
     
      transport.sendMail(
        {
            from:"q216908@gmail.com",
            to: `${email}`,
            subject:`${title}`,
            html:`${body}`
        },(error, info)=>{
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            return info.response
            }
            }
        )

    }catch(error){
        console.log(error);
    
    }
}

module.exports = sendMail;