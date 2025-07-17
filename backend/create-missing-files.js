const fs = require('fs');
const path = require('path');

const createDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✓ Created directory: ${dirPath}`);
    }
};

const createFile = (filePath, content) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
        console.log(`✓ Created file: ${filePath}`);
    }
};

// Create missing directories
createDir('./middleware');
createDir('./uploads');

// Create missing middleware files
createFile('./middleware/authMiddleware.js', `
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stonepaperscissors');
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
`);

// Create missing service files
createDir('./services');
createFile('./services/tokenService.js', `
const jwt = require('jsonwebtoken');
const redis = require('redis');

let redisClient;
try {
    redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    redisClient.connect();
} catch (error) {
    console.log('Redis not available, using in-memory blacklist');
}

const blacklistedTokens = new Set();

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'stonepaperscissors',
        { expiresIn: '24h' }
    );
};

const blacklistToken = async (token) => {
    if (redisClient) {
        await redisClient.setEx(token, 86400, 'blacklisted');
    } else {
        blacklistedTokens.add(token);
    }
};

const isTokenBlacklisted = async (token) => {
    if (redisClient) {
        return await redisClient.get(token) === 'blacklisted';
    } else {
        return blacklistedTokens.has(token);
    }
};

module.exports = {
    generateToken,
    blacklistToken,
    isTokenBlacklisted
};
`);

createFile('./services/otpService.js', `
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const otpStore = new Map();

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const sendOTP = async (email) => {
    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });
    
    console.log(\`OTP for \${email}: \${otp}\`);
    
    // In production, send actual email
    return true;
};

const verifyOTP = (email, otp) => {
    const stored = otpStore.get(email);
    if (!stored || stored.expires < Date.now()) {
        return false;
    }
    
    if (stored.otp === otp) {
        otpStore.delete(email);
        return true;
    }
    
    return false;
};

module.exports = {
    sendOTP,
    verifyOTP
};
`);

// Create missing route files
createFile('./routes/userRoutes.js', `
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.put('/change-password', userController.changePassword);

module.exports = router;
`);

console.log('All missing files created!');