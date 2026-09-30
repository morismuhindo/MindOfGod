const user = require('../models/User');
const transporter = require('../config/Email');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    accountCreatedTemplate,
    forgotPasswordTemplate,
    passwordResetConfirmationTemplate
} = require('../emailTemplates/emailTemplates');


//account registration function
const registerUser = async (req, res)=>{

    try {
        const {username, email, password, role} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({
                message: "All fields are required",

            })
        }
            
            //checking for existing user
            const existingUser = await user.findOne({email});

            if(existingUser){
                return res.status(400).json({
                    message: "email already exists"
                })
            }


            //hashing the password
            const hashedPassword = await bcrypt.hash(password, 10);

            
            const newUser = new user({
                username,
                email,
                role,
                password: hashedPassword
            })
             


            //saving the created user to the database
            await newUser.save();


            //sending account created email
            await transporter.sendMail({
                from:`"Mond of God Ministries"<${process.env.EMAIL_USER}`,
                to: email,
                subject: "Your Account has been created",
                html: accountCreatedTemplate(username)
            });


            res.status(201).json({
                message:"account created",
            })
    }catch(error){
        res.status(500).json({
            message: "Error creating user",
            error: error.message
        })
    }
}






//login function
const loginUser = async (req,res) => {

    try{
    const {loginID, password} = req.body;

    if(!loginID || !password){
        return res.status(400).json({
            message: "All fields are required"
        })
    }


    const existingUser = await user.findOne({$or: [{email: loginID}, {username: loginID}]});


    if(!existingUser){
        return res.status(400).json({
            message: "Invalid login credentials"
        })
    }


    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if(!matchPassword){
        return res.status(400).json({
            message: "Invalid login credentials"
        })
    }


    const token = jwt.sign({
        id: existingUser._id,
        role: existingUser.role
    },
process.env.JWT_SECRET,
{
    expiresIn: '1d'
})


res.status(200).json({
    message: "Login successful",
    token,
    user:{
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,     
    }
})
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "login failed",
        })
    }
}



//change password function
const changePassword = async (req, res) => {
    try{
        const {oldPassword, newPassword} = req.body;


        if(!oldPassword || !newPassword){
            return res.status(400).json({
                message: "All fields are required"
            })
        }




        const existingUser = await user.findById(req.user.id);
        if(!existingUser){
            return res.status(400).json({
                message: "user not found"
            })
        }



        const matchPassword = await bcrypt.compare(oldPassword, existingUser.password);


        if(!matchPassword){
            return res.status(400).json({
                message: "Old password is incorrect"
            })
        }

        const isSamePassword = await bcrypt.compare(newPassword, existingUser.password);


        if(isSamePassword){
            return res.status(400).json({
                message: "New password cannot be the same as the old password"
            })
        }





        existingUser.password = await bcrypt.hash(newPassword, 10);
        await existingUser.save();
        res.status(200).json({
            message: "Password changed successfully"
        })
    }catch(error){
        res.status(500).json({
            message: "Error changing password",
            error: error.message
        })
    }
}


//get my profile function
const myProfile = async (req, res) => {

    try{
    const existingUser = await user.findById(req.user.id);

    if(!existingUser){
        return res.status(400).json({
            message: "user not found",
        })
    }else{
        res.status(200).json({
            user: existingUser,
        })
    }
}catch(error){
    res.status(500).json({
        message: "Error fetching user profile",
    })
}

}



//get allusers function with pagination
const getAllUsers = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;

        const limit = 10;

        const skip = (page - 1) * limit;


        const users = await user.find().skip(skip).limit(limit);

        const totalUsers = await user.countDocuments();

        const totalPages = Math.ceil(totalUsers / limit);


        res.status(200).json({
            users,
            currentPage: page,
            totalPages,
            totalUsers,
            usersPerPage: limit
        })
    }catch(error){
        res.status(500).json({
            message: "Error fetching users",

        })
    }

}



//forgot password function
const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const foundUser = await user.findOne({ email });

        if (!foundUser) {
            return res.status(400).json({
                message: "No account found linked to that email"
            });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        foundUser.resetPasswordToken = resetToken;
        foundUser.resetPasswordExpires = Date.now() + 3600000;

        await foundUser.save();

        const resetLink =
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: `"Mind of God Ministers Convention" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Reset Your Password",
            html: forgotPasswordTemplate(
                foundUser.username,
                resetLink
            )
        });

        res.status(200).json({
            message: "Password reset link sent to your email"
        });

    } catch (error) {

        console.error("Forgot password error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};





const resetPassword = async (req, res) => {

    try {

        const { resetToken } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        const foundUser = await user.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!foundUser) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        foundUser.password = hashedPassword;
        foundUser.resetPasswordToken = null;
        foundUser.resetPasswordExpires = null;

        await foundUser.save();

        // Password reset confirmation email
        await transporter.sendMail({
            from: `"Mind of God Ministers Convention" <${process.env.GMAIL_USER}>`,
            to: foundUser.email,
            subject: "Your Password Has Been Reset",
            html: passwordResetConfirmationTemplate(
                foundUser.username
            )
        });

        res.status(200).json({
            message: "Password reset successful"
        });

    } catch (error) {

        console.error("Reset password error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};



module.exports = {
    registerUser,
    loginUser,
    changePassword,
    myProfile,
    getAllUsers,
    forgotPassword,
    resetPassword
}