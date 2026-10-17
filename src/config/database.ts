import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ [MongoDB] Conexión exitosa a: ${env.MONGODB_URI}`);
  } catch (error) {
    console.error('❌ [MongoDB] Error crítico al conectar:', error);
    process.exit(1);
  }
}
