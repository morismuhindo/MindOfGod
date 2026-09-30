const fs = require('fs');

const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');



const cloudinary = require('../config/Cloudinary');
const Sermon = require('../models/Sermons');



ffmpeg.setFfmpegPath(ffmpegPath);



//upload sermon function

const uploadSermon = async(req, res)=>{
    let compressedFile;



    try{
        const {
            title,
            description,
            category,
            speaker
        }=req.body;




        if(!req.file){
            return res.status(400).json({
                message: 'Audio file is required'
            });
        }



        if(!title || !description || !speaker){
            if(fs.existsSync(req.file.path)){
                fs.unlinkSync(req.file.path);
            }



            return res.status(400).json({
                message: 'all fields are required'
            });
        }

        const existingSermon = await Sermon.findOne({title});
        if(existingSermon){
            return res.status(400).json({
                message: "sermon with that title already exists",
            })
        }



        const originalFile = req.file.path;
        compressedFile = path.join(
            path.dirname(originalFile),
            `${path.parse(req.file.filename).name}-compressed.mp3`
        );



        await new Promise((resolve, reject) => {
            ffmpeg(originalFile)
                .audioCodec('libmp3lame')
                .audioBitrate('128k')
                .audioChannels(2)
                .audioFrequency(44100)
                .format('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(compressedFile);
        });



        const cloudinaryResult = await cloudinary.uploader.upload(
            compressedFile,
            {
                folder: 'church-sermons/audio',
                resource_type: 'video'
            }
        );


        const durationSeconds = Math.round(cloudinaryResult.duration || 0);

        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;

        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const sermon = await Sermon.create({
            title,
            description,
            category: category || 'other',
            speaker,
            audioUrl: cloudinaryResult.secure_url,
            cloudinaryPublicId: cloudinaryResult.public_id,
            duration
        });

        if (fs.existsSync(originalFile)) {
            fs.unlinkSync(originalFile);
        }

        if (fs.existsSync(compressedFile)) {
            fs.unlinkSync(compressedFile);
        }

        return res.status(201).json({
            message: 'Sermon uploaded successfully',
            sermon
        });


    }catch (error) {
        console.error('Sermon upload error:', error);

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (compressedFile && fs.existsSync(compressedFile)) {
            fs.unlinkSync(compressedFile);
        }

        return res.status(500).json({
            message: 'Failed to upload sermon',
            error: error.message
        });
    }
}




//fetch all sermons
const getAllSermons = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = 30;

        const skip = (page - 1) * limit;

        const totalSermons = await Sermon.countDocuments();

        const sermons = await Sermon.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalSermons / limit);

        return res.status(200).json({
            message: 'Sermons retrieved successfully',
            pagination: {
                currentPage: page,
                perPage: limit,
                totalSermons,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            sermons
        });

    } catch (error) {
        console.error('Get sermons error:', error);

        return res.status(500).json({
            message: 'Failed to retrieve sermons',
            error: error.message
        });
    }
};




//get single sermon
const getSermonById = async (req, res) => {
    try {
        const sermon = await Sermon.findById(req.params.id);

        if (!sermon) {
            return res.status(404).json({
                message: 'Sermon not found'
            });
        }

        return res.status(200).json({
            message: 'Sermon retrieved successfully',
            sermon
        });

    } catch (error) {
        console.error('Get sermon error:', error);

        return res.status(500).json({
            message: 'Failed to retrieve sermon',
            error: error.message
        });
    }
};




//update sermon

const updateSermon = async (req, res) => {
    let compressedFile;
    let newCloudinaryPublicId;

    try {
        const sermon = await Sermon.findById(req.params.id);

        if (!sermon) {
            if (req.file) {
                deleteFile(req.file.path);
            }

            return res.status(404).json({
                message: 'Sermon not found'
            });
        }

        const {
            title,
            description,
            category,
            speaker
        } = req.body;

        if (title !== undefined) {
            sermon.title = title;
        }

        if (description !== undefined) {
            sermon.description = description;
        }

        if (category !== undefined) {
            sermon.category = category;
        }

        if (speaker !== undefined) {
            sermon.speaker = speaker;
        }

        if (req.file) {
            const originalFile = req.file.path;

            compressedFile = path.join(
                path.dirname(originalFile),
                `${path.parse(req.file.filename).name}-compressed.mp3`
            );

            await compressAudio(originalFile, compressedFile);

            const cloudinaryResult = await cloudinary.uploader.upload(
                compressedFile,
                {
                    folder: 'church-sermons/audio',
                    resource_type: 'video'
                }
            );

            newCloudinaryPublicId = cloudinaryResult.public_id;

            const oldCloudinaryPublicId = sermon.cloudinaryPublicId;

            sermon.audioUrl = cloudinaryResult.secure_url;
            sermon.cloudinaryPublicId = cloudinaryResult.public_id;
            sermon.duration = cloudinaryResult.duration || 0;

            await sermon.save();

            deleteFile(originalFile);
            deleteFile(compressedFile);

            if (oldCloudinaryPublicId) {
                try {
                    await cloudinary.uploader.destroy(
                        oldCloudinaryPublicId,
                        {
                            resource_type: 'video'
                        }
                    );
                } catch (cloudinaryError) {
                    console.error(
                        'Failed to delete old Cloudinary audio:',
                        cloudinaryError.message
                    );
                }
            }

        } else {
            await sermon.save();
        }

        return res.status(200).json({
            message: 'Sermon updated successfully',
            sermon
        });

    } catch (error) {
        console.error('Update sermon error:', error);

        deleteFile(req.file?.path);
        deleteFile(compressedFile);

        if (newCloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(
                    newCloudinaryPublicId,
                    {
                        resource_type: 'video'
                    }
                );
            } catch (cloudinaryError) {
                console.error(
                    'Failed to clean up new Cloudinary audio:',
                    cloudinaryError.message
                );
            }
        }

        return res.status(500).json({
            message: 'Failed to update sermon',
            error: error.message
        });
    }
};




//delete sermon

const deleteSermon = async (req, res) => {
    try {
        const sermon = await Sermon.findById(req.params.id);

        if (!sermon) {
            return res.status(404).json({
                message: 'Sermon not found'
            });
        }

        if (sermon.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(
                sermon.cloudinaryPublicId,
                {
                    resource_type: 'video'
                }
            );
        }

        await Sermon.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: 'Sermon deleted successfully'
        });

    } catch (error) {
        console.error('Delete sermon error:', error);

        return res.status(500).json({
            message: 'Failed to delete sermon',
            error: error.message
        });
    }
};



//sermon playcount function
const incrementPlayCount = async (req, res) => {
    try {
        const sermon = await Sermon.findByIdAndUpdate(
            req.params.id,
            {
                $inc: {
                    playCount: 1
                }
            },
            {
                new: true
            }
        );

        if (!sermon) {
            return res.status(404).json({
                message: 'Sermon not found'
            });
        }

        return res.status(200).json({
            message: 'Sermon play count updated',
            playCount: sermon.playCount
        });

    } catch (error) {
        console.error('Increment play count error:', error);

        return res.status(500).json({
            message: 'Failed to update play count',
            error: error.message
        });
    }
};




module.exports = {
    uploadSermon,
    getAllSermons,
    getSermonById,
    updateSermon,
    deleteSermon,
    incrementPlayCount
};
