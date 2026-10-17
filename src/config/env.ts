import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduportalangular',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4200'
};
