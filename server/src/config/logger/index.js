const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('winston-daily-rotate-file');
const config = require('../config');

// Danh sách các key nhạy cảm cần che giấu
const SENSITIVE_KEYS = ['password', 'secret', 'token', 'apiKey', 'creditCard'];

// Format tùy chỉnh để che giấu dữ liệu
const redactSecrets = winston.format((info) => {
    const mask = (obj) => {
        // Duyệt qua từng key trong object log
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Nếu key nằm trong danh sách nhạy cảm -> thay bằng ***
                if (SENSITIVE_KEYS.includes(key)) {
                    obj[key] = '********';
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    // Đệ quy nếu là object lồng nhau
                    mask(obj[key]);
                }
            }
        }
    };
    
    mask(info);
    return info;
});

// Ensure that log directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const { combine, timestamp, printf, errors, json, colorize } = winston.format;

// Custom log format for console
const consoleFormat = printf(({ redactSecrets, level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
        log += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
    }
    return log;
});

// Custom log format for files
const fileFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactSecrets(),
    errors({ stack: true }),
    json()
);

const logger = winston.createLogger({
    level: config.logging.level,
    format: fileFormat,
    defaultMeta: { service: 'one-time-secret' },
    transports: [
        //
        // - Write all logs with importance level of `error` or higher to `error.log`
        //   (i.e., error, fatal, but not other levels)
        //
        new winston.transports.DailyRotateFile({
            level: 'error',
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
        //
        // - Write all logs with importance level of `info` or higher to `combined.log`
        //   (i.e., fatal, error, warn, and info, but not trace)
        //
        new winston.transports.DailyRotateFile({
            filename: path.join(logDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
    ],
    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: path.join(logDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ],
    rejectionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: path.join(logDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (config.env !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize({ all: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            redactSecrets(),
            consoleFormat
        ),
    }));
}

// Create a stream object for Morgan HTTP logger integration
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

module.exports = { logger };