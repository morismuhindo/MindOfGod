const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB Connected');
    }catch(error){
        console.log("connection failed", error.message);
    }
}
module.exports = connectDB;