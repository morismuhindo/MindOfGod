const multer = require('multer');
const path = require('path');
const fs = require('fs');



const uploadDirectory = path.join(__dirname, '../temp');


if(!fs.existsSync(uploadDirectory)){
    fs.mkdirSync(uploadDirectory, {recursive: true});
}




const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

        cb(null, filename);

    }
});




const allowedMimeTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    'audio/flac'
];


const uploadAudio = multer({
    storage,

    limits: {
        fileSize: 100 * 1024 * 1024
    },





fileFilter: (req, file, cb) => {

    const extension = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = [
        '.mp3',
        '.wav',
        '.m4a',
        '.aac',
        '.ogg',
        '.oga',
        '.webm',
        '.flac'
    ];

    if (allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files are allowed'));
    }
}

});

module.exports = uploadAudio;


