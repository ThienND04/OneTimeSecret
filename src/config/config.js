const path = require('path');
const fs = require('fs');

// Xác định môi trường hiện tại
const env = process.env.NODE_ENV || 'development';

// Thứ tự ưu tiên load file .env:
// 1. .env.{environment} (ví dụ: .env.test, .env.development, .env.production)
// 2. .env (fallback nếu không tìm thấy file môi trường cụ thể)

const envFiles = [
    path.resolve(__dirname, `../../.env.${env}`),       // Ưu tiên cao nhất: file môi trường cụ thể
    path.resolve(__dirname, '../../.env'),              // Fallback: file .env chung
];

// Load file .env đầu tiên tìm thấy
// dotenv.config() KHÔNG override các biến đã có, nên chỉ load file đầu tiên
let loadedEnvFile = null;
for (const file of envFiles) {
    if (fs.existsSync(file)) {
        require('dotenv').config({ path: file });
        loadedEnvFile = file;
        console.log(`[Config] Loaded environment variables from: ${path.basename(file)}`);
        break; // Chỉ load file đầu tiên tìm thấy
    }
}

if (!loadedEnvFile) {
    console.warn(`[Config] Warning: No .env file found. Using default values and system environment variables.`);
}

const config = {
    env,
    
    // Server config
    port: parseInt(process.env.PORT, 10) || 3000,
    
    // Database config
    mongoose: {
        url: process.env.MONGO_URI || 'mongodb://localhost:27017/secretdb',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    
    // JWT & Security config
    jwt: {
        secret: process.env.JWT_SECRET || process.env.SECRET_KEY,
        accessExpirationMinutes: parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10) || 30,
        refreshExpirationDays: parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 10) || 30,
    },
    
    // Encryption config
    encryption: {
        secretKey: process.env.SECRET_KEY,
    },
    
    // Bcrypt config
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
    },
    
    // Cloudinary config
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    
    // Logging config
    logging: {
        level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
    },
    
    // Rate limiting config
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    },
    
    // Email config
    email: {
        smtp: {
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT, 10) || 587,
            auth: {
                user: process.env.SMTP_USERNAME || 'test@example.com',
                pass: process.env.SMTP_PASSWORD || 'testpassword',
            },
        },
        from: process.env.EMAIL_FROM || 'noreply@onetimesecret.com',
    },
};

// Validate required config cho production
const requiredEnvVars = ['SECRET_KEY'];

if (env === 'production') {
    requiredEnvVars.push(
        'MONGO_URI',
        'JWT_SECRET',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
    );
}

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0 && env !== 'test') {
    console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
}

if (missingEnvVars.length > 0 && env === 'production') {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config;
