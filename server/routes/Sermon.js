const router = require('express').Router();
const uploadAudio = require('../middlewares/UploadAudio');
const {uploadSermon,   getAllSermons, getSermonById, updateSermon, deleteSermon, incrementPlayCount} = require('../controllers/Sermons');
const {verifyToken, authorizeRoles} = require("../middlewares/Authentication");


router.post('/upload', verifyToken, authorizeRoles("admin"), uploadAudio.single('audio'), uploadSermon);
router.get('/allSermons', getAllSermons);


router.get('/singleSermin/:id', verifyToken, authorizeRoles("admin"), getSermonById);


router.put('/updateSermon/:id', verifyToken, authorizeRoles("admin"),uploadAudio.single('audio'), updateSermon);


router.delete('/deleteSermon/:id', verifyToken, authorizeRoles("admin"), deleteSermon);

router.patch('/playSermon/:id/play',authorizeRoles("user","admin"), incrementPlayCount);

module.exports = router;