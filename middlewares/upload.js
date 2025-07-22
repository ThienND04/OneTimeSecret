const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
require('dotenv').config();

const storage = new CloudinaryStorage({
	cloudinary,
	params: async (req, file) => {
		const timestamp = Date.now();
		const originalName = file.originalname.replace(/\.[^/.]+$/, '');
		return {
			folder: 'onetimesecret',
			// allowed_formats: ['jpg', 'png', 'pdf', 'docx', 'txt'],
			resource_type: 'auto',
			public_id: `${originalName}_${timestamp}`,
		};
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB limit
});

module.exports = upload;
