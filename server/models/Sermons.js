const mongoose = require('mongoose');

const sermonsSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
    },

    description:{
        type:String,
        required: true,
    },
    category:{
        type: String,
        enum:['Faith', 'Hope', 'Love', 'Forgiveness', 'Salvation', 'Prayer', 'Worship', 'Bible Study', 'other'],
        default: 'other',
        required: true,
    },

    audioUrl:{
        type: String,
        required: true,
    },

    cloudinaryPublicId: {
            type: String,
            required: true,
        },

    speaker:{
        type: String,
        required: true,
    },

   duration: {
    type: String,
    default: '0:00',
},

    playCount: {
    type: Number,
    default: 0,
},


}, {timestamps: true})
module.exports = mongoose.model('sermons', sermonsSchema);