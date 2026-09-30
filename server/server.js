require('dotenv').config();
const express = require('express');
const connectDB = require('./config/Db');
const userRoutes = require('./routes/User');
const sermonRoutes = require('./routes/Sermon');
const app = express();


app.use(express.json());
const PORT = process.env.PORT || 3000;

connectDB();

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sermons', sermonRoutes);
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})



