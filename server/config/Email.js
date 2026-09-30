const nodemailer = require('nodemailer');


//create transporter
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})





transporter.verify((error, success)=>{
    if(error){
        console.log('email transport error', error);
    }else{
        console.log('email transport is ready');
    }
})


module.exports = transporter;