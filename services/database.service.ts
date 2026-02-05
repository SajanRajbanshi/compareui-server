import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseService {
  private static instance: typeof mongoose | null = null;

  public static async connect(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('Error: MONGODB_URI is not defined in the environment variables.');
      process.exit(1);
    }

    try {
      if (!this.instance) {
        this.instance = await mongoose.connect(mongoUri);
        console.log('Successfully connected to MongoDB Atlas.');
      }
    } catch (error) {
      console.error('Error connecting to MongoDB Atlas:', error);
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    if (this.instance) {
      await mongoose.disconnect();
      this.instance = null;
      console.log('Disconnected from MongoDB Atlas.');
    }
  }
}

export default DatabaseService;
