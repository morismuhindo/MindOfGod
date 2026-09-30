const jwt = require('jsonwebtoken');
const User = require('../models/User');

//verify token 
const verifyToken = async (req, res, next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            message: "token missing"
        })
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if(!user){
            return res.status(401).json({

                message: "user not found"

            })
        }




        req.user = user;
        next();
    }catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({
                message: "token expired"
            })
        } else {
            return res.status(401).json({
                message: "invalid token"
            })
        }
    }
}


//authorize roles 
const authorizeRoles = (...allowedRoles)=>{
    return (req, res, next)=>{
        if(!req.user){
            return res.status(401).json({
                message: "user not authenticated"
            })
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message: "user not authorized"
            })
        }

        next();
    }
}


module.exports = {
    verifyToken,
    authorizeRoles
}