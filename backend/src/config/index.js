import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
