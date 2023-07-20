const express = require("express");
const fileupload = require("express-fileupload")
const dbconnect = require("./config/database")
const userRouter = require("./routes/User.js")
const path = require("path");
const profileRouter = require("./routes/Profile")
const courseRouter = require("./routes/Course")
const paymentRouter = require("./routes/Payment")
require("dotenv").config()
const app = express();
const PORT =  5000 || process.env.PORT;
const cors = require('cors');
const { default: mongoose } = require("mongoose");

app.use(express.json())
app.use(fileupload({
    useTempFiles:true,
    tempFileDir:'/tmp/'
}));
//connecting the database 
dbconnect.dbconnect()

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
     console.log("database connected successfully")
     app.listen(PORT,()=>console.log("running on port ",PORT));
    })
.catch((e)=>
{console.log(e,"database connection failed")
process.exit(1);
                    })


app.use(cors());

app.use("/auth",userRouter);
app.use("/profile",profileRouter);
app.use("/course",courseRouter);
app.use("/payment",paymentRouter);

// serving frontend
app.use(express.static(path.join(__dirname, "./Frontend/build")));

app.get("/*", (req, res) => {
        res.sendFile(
            path.join(__dirname, "./Frontend/build/index.html")),
            function (err){
                res.status(500).send(err);
            }
});




