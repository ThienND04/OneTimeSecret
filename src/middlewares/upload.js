const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

if (config.env === 'test' && !fs.existsSync(path.join(__dirname, '..', 'tmp_uploads'))) {
	fs.mkdirSync(path.join(__dirname, '..', 'tmp_uploads'));
}

const storage = 
	config.env === 'test' ? 
	multer.diskStorage({ // Local storage for testing
		destination: (req, file, cb) => {
			cb(null, path.join(__dirname, '..', 'tmp_uploads'));
		},
		filename: (req, file, cb) => {
			const timestamp = Date.now();
			const originalName = file.originalname.replace(/\.[^/.]+$/, '');
			cb(null, `${originalName}_${timestamp}${file.originalname.match(/\..+$/)[0]}`);
		}
	}) :
	new CloudinaryStorage({ // Cloudinary storage for production
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
